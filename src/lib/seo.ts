const SITE_URL = 'https://carretillastekon.com';

export const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#organization`,
  name: 'Carretillas Tekon',
  alternateName: 'Tekon',
  description:
    'Venta, alquiler y reparacion de carretillas elevadoras en Valencia y provincia. Desde 1989.',
  url: SITE_URL,
  telephone: '+34961705113',
  email: 'info@carretillastekon.com',
  foundingDate: '1989',
  image: `${SITE_URL}/images/logo-tekon.png`,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/images/logo-tekon.png`,
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'S N, Camino Guardarany, 0',
    addressLocality: 'Sueca',
    addressRegion: 'Valencia',
    postalCode: '46410',
    addressCountry: 'ES',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.2028,
    longitude: -0.3117,
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Provincia de Valencia',
    containedInPlace: {
      '@type': 'Country',
      name: 'Spain',
    },
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
  ],
  priceRange: '$$',
  sameAs: [],
};

export interface ProductJsonLdInput {
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  category: { name: string } | null;
  available_for_sale: boolean;
  available_for_rental: boolean;
}

export function productJsonLd(forklift: ProductJsonLdInput) {
  const description =
    forklift.short_description ||
    (forklift.description ? forklift.description.replace(/<[^>]+>/g, '').slice(0, 155) : '');

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: forklift.name,
    description,
    image: forklift.image_url,
    url: `${SITE_URL}/carretillas/${forklift.slug}`,
    brand: {
      '@type': 'Brand',
      name: 'Carretillas Tekon',
    },
    category: forklift.category?.name ?? '',
    offers: {
      '@type': 'Offer',
      availability: forklift.available_for_sale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/PreOrder',
      areaServed: {
        '@type': 'AdministrativeArea',
        name: 'Provincia de Valencia',
      },
      seller: {
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/#organization`,
      },
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Carretillas Tekon',
    },
  };
}

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Cuanto cuesta alquilar una carretilla en Valencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El precio del alquiler de carretillas en Valencia depende del tipo de carretilla, la duracion del alquiler y las condiciones especificas. Contacta con Carretillas Tekon para un presupuesto personalizado.',
      },
    },
    {
      '@type': 'Question',
      name: 'Que tipos de carretillas elevadoras vendeis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vendemos apiladores electricos, transpaletas, carretillas contrapesadas electricas y diesel, retractiles y mas. Todas disponibles en nuestra sede de Sueca, Valencia.',
      },
    },
    {
      '@type': 'Question',
      name: 'Ofreceis servicio de reparacion de carretillas en Valencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si, ofrecemos servicio tecnico y reparacion de carretillas elevadoras en Valencia y provincia. Nuestro equipo cuenta con mas de 30 anos de experiencia desde 1989.',
      },
    },
    {
      '@type': 'Question',
      name: 'Teneis carretillas de segunda mano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si, disponemos de carretillas elevadoras de segunda mano revisadas y garantizadas. Consulta nuestro catalogo o contacta con nosotros para disponibilidad.',
      },
    },
    {
      '@type': 'Question',
      name: 'Donde estais ubicados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Carretillas Tekon esta ubicada en Sueca, en la provincia de Valencia. Damos servicio a toda la provincia de Valencia y alrededores.',
      },
    },
  ],
};
