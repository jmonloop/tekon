export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  message: string;
  forklift_id: string | null;
  read: boolean;
  created_at: string;
}

export interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: InquiryRecord;
  schema: string;
  old_record: InquiryRecord | null;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function buildEmailSubject(name: string, forkliftName?: string): string {
  if (forkliftName) {
    return `Nueva consulta sobre ${forkliftName} - ${name}`;
  }
  return `Nueva consulta de ${name}`;
}

export function buildEmailHtml(
  inquiry: InquiryRecord,
  forkliftName?: string,
): string {
  const safeName = escapeHtml(inquiry.name);
  const safeEmail = escapeHtml(inquiry.email);
  const safeMessage = escapeHtml(inquiry.message).replace(/\n/g, "<br>");
  const safeForklift = forkliftName ? escapeHtml(forkliftName) : "";
  const formattedDate = new Date(inquiry.created_at).toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `<h2>Nueva consulta recibida</h2>
<p><strong>Nombre:</strong> ${safeName}</p>
<p><strong>Email:</strong> ${safeEmail}</p>
${safeForklift ? `<p><strong>Producto:</strong> ${safeForklift}</p>` : ""}
<p><strong>Mensaje:</strong></p>
<p>${safeMessage}</p>
<hr />
<p style="color: #888; font-size: 12px;">Recibido el ${formattedDate}</p>`;
}
