import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  buildEmailHtml,
  buildEmailSubject,
  escapeHtml,
  type InquiryRecord,
} from "./lib.ts";

const baseInquiry: InquiryRecord = {
  id: "test-uuid",
  name: "Juan García",
  email: "juan@example.com",
  message: "Estoy interesado en el modelo S100.",
  forklift_id: null,
  read: false,
  created_at: "2026-03-04T10:00:00Z",
};

Deno.test("escapeHtml - escapes ampersand", () => {
  assertEquals(escapeHtml("A & B"), "A &amp; B");
});

Deno.test("escapeHtml - escapes angle brackets", () => {
  assertEquals(escapeHtml("<script>"), "&lt;script&gt;");
});

Deno.test("escapeHtml - escapes double quotes", () => {
  assertEquals(escapeHtml('say "hello"'), 'say &quot;hello&quot;');
});

Deno.test("escapeHtml - escapes single quotes", () => {
  assertEquals(escapeHtml("it's"), "it&#x27;s");
});

Deno.test("escapeHtml - leaves plain text unchanged", () => {
  assertEquals(escapeHtml("hello world"), "hello world");
});

Deno.test("escapeHtml - handles XSS payload", () => {
  const xss = '<img src=x onerror="alert(1)">';
  const result = escapeHtml(xss);
  assertEquals(
    result,
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
  );
});

Deno.test("buildEmailSubject - without forklift name", () => {
  assertEquals(
    buildEmailSubject("Juan García"),
    "Nueva consulta de Juan García",
  );
});

Deno.test("buildEmailSubject - with forklift name", () => {
  assertEquals(
    buildEmailSubject("Juan García", "Apilador S100"),
    "Nueva consulta sobre Apilador S100 - Juan García",
  );
});

Deno.test("buildEmailSubject - with empty forklift name uses generic subject", () => {
  assertEquals(
    buildEmailSubject("Ana López", ""),
    "Nueva consulta de Ana López",
  );
});

Deno.test("buildEmailHtml - contains sender name and email", () => {
  const html = buildEmailHtml(baseInquiry);
  assertStringIncludes(html, "Juan García");
  assertStringIncludes(html, "juan@example.com");
});

Deno.test("buildEmailHtml - contains message", () => {
  const html = buildEmailHtml(baseInquiry);
  assertStringIncludes(html, "Estoy interesado en el modelo S100.");
});

Deno.test("buildEmailHtml - does not include product section when no forklift", () => {
  const html = buildEmailHtml(baseInquiry);
  assertEquals(html.includes("<strong>Producto:</strong>"), false);
});

Deno.test("buildEmailHtml - includes product section when forklift name provided", () => {
  const html = buildEmailHtml(baseInquiry, "Apilador S100");
  assertStringIncludes(html, "<strong>Producto:</strong>");
  assertStringIncludes(html, "Apilador S100");
});

Deno.test("buildEmailHtml - escapes XSS in name", () => {
  const maliciousInquiry: InquiryRecord = {
    ...baseInquiry,
    name: '<script>alert("xss")</script>',
  };
  const html = buildEmailHtml(maliciousInquiry);
  assertEquals(html.includes("<script>"), false);
  assertStringIncludes(html, "&lt;script&gt;");
});

Deno.test("buildEmailHtml - escapes XSS in email", () => {
  const maliciousInquiry: InquiryRecord = {
    ...baseInquiry,
    email: 'evil"@example.com',
  };
  const html = buildEmailHtml(maliciousInquiry);
  assertStringIncludes(html, "evil&quot;@example.com");
});

Deno.test("buildEmailHtml - escapes XSS in message", () => {
  const maliciousInquiry: InquiryRecord = {
    ...baseInquiry,
    message: '<img src=x onerror="fetch(\'//evil.com\')">',
  };
  const html = buildEmailHtml(maliciousInquiry);
  assertEquals(html.includes("<img"), false);
  assertStringIncludes(html, "&lt;img");
});

Deno.test("buildEmailHtml - escapes XSS in forklift name", () => {
  const html = buildEmailHtml(baseInquiry, '<b>not bold</b>');
  assertEquals(html.includes("<b>"), false);
  assertStringIncludes(html, "&lt;b&gt;");
});

Deno.test("buildEmailHtml - converts newlines to <br> in message", () => {
  const multilineInquiry: InquiryRecord = {
    ...baseInquiry,
    message: "Línea 1\nLínea 2",
  };
  const html = buildEmailHtml(multilineInquiry);
  assertStringIncludes(html, "Línea 1<br>Línea 2");
});

Deno.test("buildEmailHtml - contains formatted date", () => {
  const html = buildEmailHtml(baseInquiry);
  assertStringIncludes(html, "Recibido el");
  assertStringIncludes(html, "2026");
});
