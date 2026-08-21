import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Todo {
  id: string | number;
  name?: string;
  title?: string;
  [key: string]: any;
}

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTodos() {
      const { data } = await supabase.from('todos').select('*');
      if (data) {
        setTodos(data as Todo[]);
      }
    }
    fetchTodos();
  }, []);

  return (
    <ul>
      {todos.map((todo: Todo) => (
        <li key={todo.id}>{todo.name || todo.title || String(todo.id)}</li>
      ))}
    </ul>
  );
}
