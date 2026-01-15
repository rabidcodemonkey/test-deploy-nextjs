"use client";

import { useState, useRef, useEffect } from "react";
import { apiUrl } from "@/lib/config";

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Connect to chat WebSocket
    const connectChat = async () => {
      try {
        // Start subscription to Redis messages
        const eventSource = new EventSource(apiUrl("/api/chat?action=subscribe"));
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setConnected(true);
        };

        eventSource.onmessage = (event) => {
          const newMessage: ChatMessage = {
            id: Date.now().toString(),
            content: event.data,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((prev) => [...prev, newMessage]);
        };

        eventSource.onerror = () => {
          setConnected(false);
          eventSource.close();
        };
      } catch (error) {
        console.error("Failed to connect to chat:", error);
        setConnected(false);
      }
    };

    connectChat();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Chat Room</h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-gray-600">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 mt-4">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="flex flex-col gap-0.5 bg-white p-2 rounded border border-gray-100"
            >
              <p className="text-sm text-gray-700">{msg.content}</p>
              <span className="text-xs text-gray-400">{msg.timestamp}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={!connected || loading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
          />
          <button
            type="submit"
            disabled={!connected || loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
