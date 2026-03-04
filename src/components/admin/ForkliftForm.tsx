import { useParams } from 'react-router-dom';

export function ForkliftForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  return (
    <div data-testid="admin-forklift-form" className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        {isEditMode ? 'Editar carretilla' : 'Nueva carretilla'}
      </h1>
      <p className="text-muted-foreground">
        {isEditMode ? `Editando carretilla con ID: ${id}` : 'Formulario para crear una nueva carretilla.'}
      </p>
    </div>
  );
}
