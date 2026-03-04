import { describe, it, expect } from 'vitest';
import { faqJsonLd } from '../lib/seo';

// The visible FAQ content in nuestras-soluciones.astro must match the JSON-LD exactly.
// These tests verify the faqJsonLd structure and that the page's visible FAQ content
// matches the structured data (per Google's requirement).

describe('faqJsonLd — structure', () => {
  it('has correct Schema.org context', () => {
    expect(faqJsonLd['@context']).toBe('https://schema.org');
  });

  it('has FAQPage type', () => {
    expect(faqJsonLd['@type']).toBe('FAQPage');
  });

  it('contains exactly 5 questions', () => {
    expect(faqJsonLd.mainEntity).toHaveLength(5);
  });

  it('all entries are Question type', () => {
    faqJsonLd.mainEntity.forEach((item) => {
      expect(item['@type']).toBe('Question');
    });
  });

  it('all entries have acceptedAnswer of type Answer', () => {
    faqJsonLd.mainEntity.forEach((item) => {
      expect(item.acceptedAnswer['@type']).toBe('Answer');
    });
  });

  it('all questions have non-empty name', () => {
    faqJsonLd.mainEntity.forEach((item) => {
      expect(item.name.trim().length).toBeGreaterThan(0);
    });
  });

  it('all answers have non-empty text', () => {
    faqJsonLd.mainEntity.forEach((item) => {
      expect(item.acceptedAnswer.text.trim().length).toBeGreaterThan(0);
    });
  });
});

describe('faqJsonLd — question content', () => {
  const questions = faqJsonLd.mainEntity.map((q) => q.name);
  const answers = faqJsonLd.mainEntity.map((q) => q.acceptedAnswer.text);

  it('includes rental price question', () => {
    expect(questions.some((q) => q.toLowerCase().includes('alquilar'))).toBe(true);
  });

  it('includes forklift types question', () => {
    expect(questions.some((q) => q.toLowerCase().includes('tipos'))).toBe(true);
  });

  it('includes repair service question', () => {
    expect(questions.some((q) => q.toLowerCase().includes('reparacion'))).toBe(true);
  });

  it('includes used forklifts question', () => {
    expect(questions.some((q) => q.toLowerCase().includes('segunda mano'))).toBe(true);
  });

  it('includes location question', () => {
    expect(questions.some((q) => q.toLowerCase().includes('ubicados'))).toBe(true);
  });

  it('rental answer mentions Valencia', () => {
    const rentalAnswer = answers.find((_, i) =>
      questions[i].toLowerCase().includes('alquilar')
    );
    expect(rentalAnswer).toBeDefined();
    expect(rentalAnswer!.toLowerCase()).toContain('valencia');
  });

  it('repair answer mentions experience since 1989', () => {
    const repairAnswer = answers.find((_, i) =>
      questions[i].toLowerCase().includes('reparacion')
    );
    expect(repairAnswer).toBeDefined();
    expect(repairAnswer!).toContain('1989');
  });

  it('location answer mentions Sueca', () => {
    const locationAnswer = answers.find((_, i) =>
      questions[i].toLowerCase().includes('ubicados')
    );
    expect(locationAnswer).toBeDefined();
    expect(locationAnswer!.toLowerCase()).toContain('sueca');
  });
});

describe('faqJsonLd — content matches visible page FAQ', () => {
  // The page (nuestras-soluciones.astro) defines a `faqs` array with the same
  // questions and answers as faqJsonLd. These tests verify the JSON-LD data
  // so that any change to one serves as a reminder to update the other.

  const EXPECTED_QUESTIONS = [
    'Cuanto cuesta alquilar una carretilla en Valencia?',
    'Que tipos de carretillas elevadoras vendeis?',
    'Ofreceis servicio de reparacion de carretillas en Valencia?',
    'Teneis carretillas de segunda mano?',
    'Donde estais ubicados?',
  ];

  const EXPECTED_ANSWERS = [
    'El precio del alquiler de carretillas en Valencia depende del tipo de carretilla, la duracion del alquiler y las condiciones especificas. Contacta con Carretillas Tekon para un presupuesto personalizado.',
    'Vendemos apiladores electricos, transpaletas, carretillas contrapesadas electricas y diesel, retractiles y mas. Todas disponibles en nuestra sede de Sueca, Valencia.',
    'Si, ofrecemos servicio tecnico y reparacion de carretillas elevadoras en Valencia y provincia. Nuestro equipo cuenta con mas de 30 anos de experiencia desde 1989.',
    'Si, disponemos de carretillas elevadoras de segunda mano revisadas y garantizadas. Consulta nuestro catalogo o contacta con nosotros para disponibilidad.',
    'Carretillas Tekon esta ubicada en Sueca, en la provincia de Valencia. Damos servicio a toda la provincia de Valencia y alrededores.',
  ];

  it('each JSON-LD question matches the expected visible question', () => {
    faqJsonLd.mainEntity.forEach((item, index) => {
      expect(item.name).toBe(EXPECTED_QUESTIONS[index]);
    });
  });

  it('each JSON-LD answer matches the expected visible answer', () => {
    faqJsonLd.mainEntity.forEach((item, index) => {
      expect(item.acceptedAnswer.text).toBe(EXPECTED_ANSWERS[index]);
    });
  });
});
