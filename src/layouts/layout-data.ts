export interface NavLink {
  href: string;
  label: string;
}

export const navLinks: NavLink[] = [
  { href: '/venta-de-carretillas', label: 'Venta' },
  { href: '/alquiler-de-carretillas', label: 'Alquiler' },
  { href: '/carretillas-de-segunda-mano', label: 'Segunda Mano' },
  { href: '/nuestras-soluciones', label: 'Soluciones' },
  { href: '/sobre-nosotros', label: 'Sobre Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export const legalLinks: NavLink[] = [
  { href: '/politica-de-privacidad', label: 'Política de Privacidad' },
  { href: '/politica-de-cookies', label: 'Política de Cookies' },
  { href: '/aviso-legal', label: 'Aviso Legal' },
];

export const SITE_NAME = 'Carretillas Tekon';
export const DEFAULT_OG_IMAGE_PATH = 'images/og-default.png';
