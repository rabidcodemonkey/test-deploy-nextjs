import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initializeDatabase() {
  try {
    const client = await pool.connect();
    
    // Create todos table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Database initialized successfully');
    client.release();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getTodos() {
  return query('SELECT * FROM todos ORDER BY created_at DESC');
}

export async function addTodo(title: string) {
  const result = await query(
    'INSERT INTO todos (title) VALUES ($1) RETURNING *',
    [title]
  );
  return result[0];
}

export async function toggleTodo(id: number) {
  const result = await query(
    'UPDATE todos SET completed = NOT completed, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
    [id]
  );
  return result[0];
}

export async function deleteTodo(id: number) {
  await query('DELETE FROM todos WHERE id = $1', [id]);
}

export async function closePool() {
  await pool.end();
}
