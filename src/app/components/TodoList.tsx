'use client';

import { useState, useEffect } from 'react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      setError(null);
      const response = await fetch('/api/todos');
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to load todos');
        setTodos([]);
      } else {
        setTodos(Array.isArray(data.todos) ? data.todos : []);
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      setError('Unable to connect to the server. Make sure the database is running.');
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    
    if (!title.trim()) return;

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        const data = await response.json();
        setTodos([data.todo, ...todos]);
        setTitle('');
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  }

  async function handleToggleTodo(id: number) {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
      });

      if (response.ok) {
        const data = await response.json();
        setTodos(todos.map(todo => todo.id === id ? data.todo : todo));
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  }

  async function handleDeleteTodo(id: number) {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Todo List</h1>

      <form onSubmit={handleAddTodo} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700"><strong>Error:</strong> {error}</p>
          <p className="text-red-600 text-sm mt-2">
            Please check your database connection and ensure PostgreSQL is running.
          </p>
        </div>
      ) : todos.length === 0 ? (
        <p className="text-gray-500">No todos yet. Add one to get started!</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo.id)}
                className="w-5 h-5 text-blue-500 rounded cursor-pointer"
              />
              <span
                className={`flex-1 ${
                  todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                }`}
              >
                {todo.title}
              </span>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
