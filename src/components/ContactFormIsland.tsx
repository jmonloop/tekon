import { useActionState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ContactFormIslandProps {
  forkliftId?: string;
  forkliftName?: string;
}

interface FormState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

const INITIAL_STATE: FormState = { status: 'idle', message: '' };

async function submitInquiry(
  forkliftId: string | undefined,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // Honeypot check
  if (formData.get('website')) {
    return INITIAL_STATE;
  }

  const name = (formData.get('name') as string | null)?.trim();
  const email = (formData.get('email') as string | null)?.trim();
  const message = (formData.get('message') as string | null)?.trim();

  if (!name || !email || !message) {
    return { status: 'error', message: 'Por favor rellena todos los campos.' };
  }

  const payload: Record<string, unknown> = { name, email, message };
  if (forkliftId) payload.forklift_id = forkliftId;

  const { error } = await supabase.from('inquiries').insert(payload);

  if (error) {
    console.error('Error submitting inquiry:', error);
    return {
      status: 'error',
      message: 'Ha ocurrido un error. Inténtalo de nuevo más tarde.',
    };
  }

  return { status: 'success', message: '¡Mensaje enviado! Te responderemos en breve.' };
}

export function ContactFormIsland({ forkliftId, forkliftName }: ContactFormIslandProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const boundAction = submitInquiry.bind(null, forkliftId);
  const [state, formAction, isPending] = useActionState(boundAction, INITIAL_STATE);

  if (state.status === 'success') {
    return (
      <div
        data-testid="contact-form-success"
        role="alert"
        className="rounded-lg border border-green-200 bg-green-50 p-6 text-center"
      >
        <p className="font-semibold text-green-800">{state.message}</p>
      </div>
    );
  }

  const heading = forkliftName
    ? `Consultar sobre ${forkliftName}`
    : 'Contacta con nosotros';

  return (
    <div data-testid="contact-form-container">
      <h2 className="mb-4 text-xl font-semibold">{heading}</h2>

      {state.status === 'error' && (
        <div
          data-testid="contact-form-error"
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {state.message}
        </div>
      )}

      <form
        ref={formRef}
        action={formAction}
        className="space-y-4"
        data-testid="contact-form"
        noValidate
      >
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
          data-testid="honeypot-field"
        />

        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Nombre *</Label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            disabled={isPending}
            placeholder="Tu nombre"
            data-testid="contact-name-input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-email">Email *</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            placeholder="tu@email.com"
            data-testid="contact-email-input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-message">Mensaje *</Label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            required
            disabled={isPending}
            placeholder="¿En qué podemos ayudarte?"
            data-testid="contact-message-input"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
          data-testid="contact-submit-btn"
        >
          {isPending ? 'Enviando...' : 'Enviar consulta'}
        </Button>
      </form>
    </div>
  );
}
