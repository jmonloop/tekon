import { useStore } from '@nanostores/react';
import { $counter } from '@/lib/stores';

export default function DisplayIsland() {
  const count = useStore($counter);

  return (
    <div className="p-4">
      <p>Display: {count}</p>
    </div>
  );
}
