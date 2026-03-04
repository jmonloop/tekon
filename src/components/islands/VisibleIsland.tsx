import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VisibleIsland() {
  const [value, setValue] = useState('');

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Búsqueda</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Escribe para buscar..."
        />
      </CardContent>
    </Card>
  );
}
