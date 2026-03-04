import { useStore } from '@nanostores/react';
import { Button } from '@/components/ui/button';
import { $counter } from '@/lib/stores';

export default function CounterIsland() {
  const count = useStore($counter);

  return (
    <div className="flex items-center gap-4 p-4">
      <span>Counter: {count}</span>
      <Button onClick={() => $counter.set(count + 1)}>Add</Button>
    </div>
  );
}
