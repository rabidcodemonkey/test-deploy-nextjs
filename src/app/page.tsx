import TodoList from "./components/TodoList";
import Chat from "./components/Chat";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <TodoList />
        </div>
        <div>
          <Chat />
        </div>
      </div>
    </main>
  );
}
