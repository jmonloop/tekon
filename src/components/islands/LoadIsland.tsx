import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function LoadIsland() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <p>Count: {count}</p>
      <Button onClick={() => setCount((c) => c + 1)}>Increment</Button>
    </div>
  );
}
