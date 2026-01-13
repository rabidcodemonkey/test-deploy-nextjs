import { publishMessage, subscribeToMessages } from "@/lib/redis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "subscribe") {
    // Server-Sent Events (SSE) for real-time messaging
    const encoder = new TextEncoder();
    let closed = false;
    let cleanup: (() => Promise<void>) | null = null;
    let heartbeat: NodeJS.Timeout | null = null;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          console.log("SSE subscription started");

          // Subscribe to Redis messages
          cleanup = await subscribeToMessages((message) => {
            if (!closed) {
              console.log("Sending message via SSE:", message);
              try {
                controller.enqueue(encoder.encode(`data: ${message}\n\n`));
              } catch (error) {
                console.error("Error enqueueing message:", error);
              }
            }
          });

          // Send initial connection message
          try {
            controller.enqueue(encoder.encode("data: connected\n\n"));
          } catch (error) {
            console.error("Error sending initial message:", error);
          }

          // Keep connection alive with heartbeat
          heartbeat = setInterval(() => {
            if (!closed) {
              try {
                controller.enqueue(encoder.encode(": heartbeat\n\n"));
              } catch (error) {
                console.error("Error sending heartbeat:", error);
              }
            }
          }, 30000);

          // Cleanup on close
          const handleClose = async () => {
            if (!closed) {
              closed = true;
              if (heartbeat) {
                clearInterval(heartbeat);
              }
              if (cleanup) {
                await cleanup();
              }
              try {
                controller.close();
              } catch (error) {
                console.error("Error closing controller:", error);
              }
              console.log("SSE connection closed");
            }
          };

          // Handle graceful shutdown
          request.signal.addEventListener("abort", handleClose);
        } catch (error) {
          console.error("SSE subscription error:", error);
          closed = true;
          try {
            controller.error(error);
          } catch (e) {
            console.error("Error calling controller.error:", e);
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  return new Response("Not Found", { status: 404 });
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    await publishMessage(message);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error publishing message:", error);
    return Response.json(
      { error: "Failed to publish message" },
      { status: 500 }
    );
  }
}
