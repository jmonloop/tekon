-- Migration: Seed data
-- Categories and forklifts extracted from carretillastekon.com

-- Categories
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Apiladores eléctricos', 'apiladores-electricos', 1),
  ('Transpaletas eléctricas', 'transpaletas-electricas', 2),
  ('Transpaletas manuales', 'transpaletas-manuales', 3),
  ('Carretillas eléctricas 3 ruedas', 'carretillas-electricas-3-ruedas', 4),
  ('Carretillas eléctricas 4 ruedas', 'carretillas-electricas-4-ruedas', 5),
  ('Carretillas retráctiles', 'carretillas-retractiles', 6),
  ('Preparadoras de pedidos de bajo nivel', 'preparadoras-de-pedidos-de-bajo-nivel', 7),
  ('Carretillas Diésel', 'carretillas-diesel', 8),
  ('Soluciones de remolque', 'soluciones-de-remolque', 9);

-- Forklifts
INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'S100', 's100',
  (SELECT id FROM categories WHERE slug = 'apiladores-electricos'),
  'La serie CESAB S100 se utiliza en establecimientos de alimentación, centros comerciales, oficinas, almacenes y plantas de producción, y constituye una alternativa excelente para trabajar en aplicaciones de baja intensidad y espacios reducidos. La CESAB S110 puede utilizarse para transportar cargas a corta distancia y para apilar material a poca altura. También resulta útil como mesa de trabajo ergonómica de altura ajustable en operaciones de recogida y colocación de mercancías.',
  'La serie CESAB S100 se utiliza en establecimientos de alimentación, centros comerciales, oficinas, almacenes y plantas de producción, y constituye una...',
  'https://www.carretillastekon.com/wp-content/uploads/Apilador-S100-1.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabs100speces.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 's100'), 'Carga nominal', '1000', 'kg', 0),
  ((SELECT id FROM forklifts WHERE slug = 's100'), 'Tipo de operador', 'Pedestrian', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 's100'), 'Brazos soporte', 'Fixed', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 's100'), 'Velocidad de desplazamiento con/sin carga', '4.5/5.5', 'km/h', 3),
  ((SELECT id FROM forklifts WHERE slug = 's100'), 'Longitud carretilla, excl. horquillas (L2)', '530', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 's100'), 'Ancho de chasis (b1)', '700', 'mm', 5),
  ((SELECT id FROM forklifts WHERE slug = 's100'), 'Tipo de mástil', 'Mono mast', NULL, 6),
  ((SELECT id FROM forklifts WHERE slug = 's100'), 'Alturas de elevación (h23) de', '1580/2000', 'mm', 7),
  ((SELECT id FROM forklifts WHERE slug = 's100'), 'Voltaje de la batería/Capacidad nominal K5', '2 x 12V/63Ah *', NULL, 8),
  ((SELECT id FROM forklifts WHERE slug = 's100'), 'Cargador', 'Built-in', NULL, 9);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'S300', 's300',
  (SELECT id FROM categories WHERE slug = 'apiladores-electricos'),
  'La gama CESAB S300 trae un robusto rendimiento a nuestra serie de apiladores electricos. Con una altura de elevación de hasta 5,4 m, una capacidad de 1.600 kg y una velocidad máxima de 8 km/h, la gama CESAB S300 está acostumbrada a las operaciones más exigentes de apilado y de manejo de palets. Así que cuando la tarea exige más de los equipos de manejo de materiales, la gama CESAB S300 cumple lo prometido.',
  'La gama CESAB S300 trae un robusto rendimiento a nuestra serie de apiladores electricos. Con una altura de elevación de hasta 5,4 m, una capacidad de 1.600 kg y...',
  'https://www.carretillastekon.com/wp-content/uploads/S300.png',
  'https://www.carretillastekon.com/wp-content/uploads/cesabs300bres.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 's300'), 'Carga nominal (Capacidad sobre horquillas)', '1200', 'kg', 0),
  ((SELECT id FROM forklifts WHERE slug = 's300'), 'Capacidad sobre brazos soporte', '–', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 's300'), 'Capacidad sobre horquillas y brazos soporte', '–', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 's300'), 'Tipo de operador', 'Plataforma del operador', NULL, 3),
  ((SELECT id FROM forklifts WHERE slug = 's300'), 'Brazos soporte', 'Fijos', NULL, 4),
  ((SELECT id FROM forklifts WHERE slug = 's300'), 'Velocidad de desplazamiento con/sin carga', '6-7.5/6-8', 'km/h', 5),
  ((SELECT id FROM forklifts WHERE slug = 's300'), 'Longitud carretilla, excl. horquillas y plataforma elevada (L2)*', '887/996', 'mm', 6),
  ((SELECT id FROM forklifts WHERE slug = 's300'), 'Ancho de chasis (b1)', '790', 'mm', 7),
  ((SELECT id FROM forklifts WHERE slug = 's300'), 'Tipo de mástil disponible **', 'DTP / DL / TL', NULL, 8),
  ((SELECT id FROM forklifts WHERE slug = 's300'), 'Alturas de elevación (h23) de', '1950', 'mm', 9),
  ((SELECT id FROM forklifts WHERE slug = 's300'), 'Máxima altura de elevación (h23)', '4800', 'mm', 10),
  ((SELECT id FROM forklifts WHERE slug = 's300'), 'Voltaje de la batería/Capacidad nominal K5', '24V / 201 – 500 Ah', NULL, 11);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'S200', 's200',
  (SELECT id FROM categories WHERE slug = 'apiladores-electricos'),
  'Para las necesidades de las operaciones con conductor a pie, la gama CESAB S200 de apiladores eléctricos significa negocio. Con su diseño compacto que incluye un chasis redondeado y un timón de montaje central, la gama CESAB S200 ofrece una excelente maniobrabilidad y un manejo de palets sin esfuerzo. En la venta minorista y mayorista, la fabricación y la distribución, la gama CESAB S200 es una solución flexible para todas las aplicaciones con conductor a pie gracias a la opción de una plataforma plegable y un exclusivo timón si en su compañía se requieren distancias de desplazamiento largas.',
  'Para las necesidades de las operaciones con conductor a pie, la gama CESAB S200 de apiladores eléctricos significa negocio. Con su diseño compacto que incluye...',
  'https://www.carretillastekon.com/wp-content/uploads/Apilador-S100.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabs200bres.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Carga nominal (Capacidad sobre horquillas)', '800', 'kg', 0),
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Capacidad sobre brazos soporte', '2000', 'kg', 1),
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Tipo de operador', 'Acompañante', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Brazos soporte', 'Elevables', NULL, 3),
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Velocidad de desplazamiento con/sin carga', '6/6', 'km/h', 4),
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Longitud carretilla, excl. horquillas (L2)', '628', 'mm', 5),
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Ancho de chasis (b1)', '726', 'mm', 6),
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Tipo de mástil', 'Mono', NULL, 7),
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Alturas de elevación (h23) de', '600', 'mm', 8),
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Máxima altura de elevación (h23)', '1580', 'mm', 9),
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Voltaje de la batería/Capacidad nominal K5', '24V / 180 – 230 Ah', NULL, 10),
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Longitud carretilla, excl. horquillas (L2)*', '683/740', 'mm', 15),
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Tipo de mástil**', 'S / DT / DTP', NULL, 17),
  ((SELECT id FROM forklifts WHERE slug = 's200'), 'Capacidad sobre horquillas y brazos soporte', '–', NULL, 45);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'S010i', 's010i',
  (SELECT id FROM categories WHERE slug = 'apiladores-electricos'),
  'Dé los primeros pasos hacia la mecanización de su empresa con el apilador CESAB S010i. La manipulación manual es la principal causa de lesiones musculares en el lugar de trabajo. Este tipo de lesión representa más de 1/3 de todas las enfermedades relacionadas con el trabajo. Con la S010i, CESAB cierra la brecha entre los apiladores manuales o semi-manuales y las versiones más caras. La CESAB S010i es excepcionalmente compacta y ofrece una ergonomía mejorada y una manipulación de palés más rápida a un precio asequible. La batería de iones de litio con cargador integrado garantiza el máximo tiempo de actividad, ya que la carretilla puede recargarse en cualquier toma de corriente. Con el lanzamiento de S010i, CESAB ofrece una solución rentable para mecanizar la manipulación básica . La manipulación manual es la principal causa de lesiones musculares en el lugar de trabajo y representa más de un tercio de las enfermedades profesionales. Con la S010i, CESAB cierra la brecha entre los apiladores manuales o semi-manuales y las versiones eléctricas más caras. El CESAB S010i ofrece todas las ventajas de un apilador completo: reducción automática de la velocidad a partir de una altura de elevación de 300 mm y frenado automático del apilador en las curvas . Máxima seguridad de uso. Además, una parada suave al alcanzar la altura máxima de elevación impide que el mástil oscile . Un indicador de capacidad residual en el perfil del mástil garantiza que el usuario no supere la carga máxima autorizada al apilar. La batería de iones de litio de 24V-60Ah garantiza una excelente autonomía . El cargador integrado recarga la batería en menos de tres horas desde cualquier toma de corriente. La batería de iones de litio de 24V-60Ah garantiza una excelente autonomía . El cargador integrado recarga la batería en menos de tres horas desde cualquier toma de corriente. Compacta y fácil de usar, la CESAB S010i es una solución económica cuando se necesita intensificar la manipulación de materiales.',
  'Dé los primeros pasos hacia la mecanización de su empresa con el apilador CESAB S010i. La manipulación manual es la principal causa de lesiones musculares en el...',
  'https://www.carretillastekon.com/wp-content/uploads/S010i.png',
  'https://www.carretillastekon.com/wp-content/uploads/20230411cesabs010i-p013ibrochureesfinallores-1.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 's010i'), 'Capacidad de carga (Cdc 600 mm)', '1000', 'kg', 0),
  ((SELECT id FROM forklifts WHERE slug = 's010i'), 'Tipo de operario', 'Conductor acompañante', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 's010i'), 'Altura de elevación (h 23 )', '2900 o 3600 mm', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 's010i'), 'Velocidad de desplazamiento, con/sin carga', '4,2 / 4,5', 'km/h', 3),
  ((SELECT id FROM forklifts WHERE slug = 's010i'), 'Longitud total (l 1 )', '1710', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 's010i'), 'Longitud hasta talón interior horquillas (l 2 )', '560', 'mm', 5),
  ((SELECT id FROM forklifts WHERE slug = 's010i'), 'Ancho del chasis (b 1 )', '800', 'mm', 6),
  ((SELECT id FROM forklifts WHERE slug = 's010i'), 'Radio de giro (W a )', '1350', 'mm', 7),
  ((SELECT id FROM forklifts WHERE slug = 's010i'), 'Clasificación del motor de tracción S2 60 min', '0,65', 'kW', 8),
  ((SELECT id FROM forklifts WHERE slug = 's010i'), 'Voltaje de la batería, capacidad nomina K 5', '24V / 60Ah', NULL, 9),
  ((SELECT id FROM forklifts WHERE slug = 's010i'), 'Cargador', 'Integrado 220V / 25A', NULL, 10),
  ((SELECT id FROM forklifts WHERE slug = 's010i'), 'Nivel de sonido EN 12053', '< 70 dB(A)', NULL, 11);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'R300', 'r300-2',
  (SELECT id FROM categories WHERE slug = 'carretillas-retractiles'),
  'La gama CESAB R300 tiene una productividad extraordinaria garantizada desde el primer día y durante muchos años. Todos los aspectos de cada modelo de la gama han sido desarrollados para incrementar la productividad a niveles nunca vistos. Un conductor con confort y seguridad es productivo. Para obtener una productividad óptima de la persona detrás de los mandos, se han incorporado el confort y la facilidad de uso a cada aspecto del diseño ergonómico de las CESAB R300.',
  'La gama CESAB R300 tiene una productividad extraordinaria garantizada desde el primer día y durante muchos años. Todos los aspectos de cada modelo de la gama...',
  'https://www.carretillastekon.com/wp-content/uploads/R200-3.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabbrochurer200-r300esv02lores_0.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'r300-2'), 'Carga nominal', '1400', 'kg', 0),
  ((SELECT id FROM forklifts WHERE slug = 'r300-2'), 'Tipo de operador', 'Sentado', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'r300-2'), 'Tipo de mástil', 'Triplex con elevación Libre', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 'r300-2'), 'Alturas de elevación (h23) de', '4900', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'r300-2'), 'Máxima altura de elevación (h23)', '11000', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 'r300-2'), 'Velocidad de desplazamiento con/sin carga', '10.3/11.0', 'km/h', 5),
  ((SELECT id FROM forklifts WHERE slug = 'r300-2'), 'Velocidad de elevación, con/sin carga', '0.38/0.68', 'm/s', 6),
  ((SELECT id FROM forklifts WHERE slug = 'r300-2'), 'Velocidad de descenso, con/sin carga', '0.55/0.59', 'm/s', 7),
  ((SELECT id FROM forklifts WHERE slug = 'r300-2'), 'Ancho de chasis (b1)', '1270', 'mm', 8),
  ((SELECT id FROM forklifts WHERE slug = 'r300-2'), 'Compartimentos de bateria', 'Estándar/ cambio lateralmente', NULL, 9),
  ((SELECT id FROM forklifts WHERE slug = 'r300-2'), 'Voltaje de la batería/Capacidad nominal K5', '48V / 465 – 775 Ah', NULL, 10),
  ((SELECT id FROM forklifts WHERE slug = 'r300-2'), 'Potencia del motor de desplazamiento/elevación', '7.5/11.0', 'kW', 11);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'R200', 'r200',
  (SELECT id FROM categories WHERE slug = 'carretillas-retractiles'),
  'La nueva gama CESAB R200 ha sido creada para ofrecer una excepcional productividad en las operaciones de manejo de materiales realizadas en espacios pequeños. Su original diseño las hacen perfectas para situaciones exigentes que requieren un alto nivel de productividad y aplicaciones de apilado de bloques y almacenaje.',
  'La nueva gama CESAB R200 ha sido creada para ofrecer una excepcional productividad en las operaciones de manejo de materiales realizadas en espacios pequeños....',
  'https://www.carretillastekon.com/wp-content/uploads/R200-1.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabbrochurer200-r300esv02lores_0.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Carga nominal', '1200', 'kg', 0),
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Tipo de operador', 'Sentado', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Tipo de mástil disponible*', 'DT / DL / TL', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Alturas de elevación (h23) de', '3350', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Máxima altura de elevación (h23)', '6000', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Velocidad de desplazamiento con/sin carga', '10/11', 'km/h', 5),
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Velocidad de elevación, con/sin carga', '0.29/0.42', 'm/s', 6),
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Velocidad de descenso, con/sin carga', '0.47/0.47', 'm/s', 7),
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Ancho de chasis (b1)', '1120', 'mm', 8),
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Compartimentos de batería', 'Estándar/ cambio lateralmente', NULL, 9),
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Voltaje de la batería/Capacidad nominal K5', '48V / 310 – 620 Ah', NULL, 10),
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Potencia del motor de desplazamiento/elevación', '7.5/7.4', 'kW', 11),
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Mast Type', 'Triplex Freelift', NULL, 14),
  ((SELECT id FROM forklifts WHERE slug = 'r200'), 'Tipo de mástil', 'Triplex con elevación Libre', NULL, 26);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'R100', 'r100',
  (SELECT id FROM categories WHERE slug = 'carretillas-retractiles'),
  'La forma sigue a la función: la CESAB R100 es una práctica carretilla retráctil de fácil manejo que se ha diseñado para proporcionar una gran maniobrabilidad, fiabilidad y seguridad en las operaciones de manipulación de materiales. La CESAB R100 también aprovecha al máximo el diseño ergonómico inteligente. La altura del suelo ajustable, las consolas de control y el asiento permiten adaptar la carretilla a medida de la persona que se encuentra detrás de los mandos, pues un operario que está cómodo es más productivo.',
  'La forma sigue a la función: la CESAB R100 es una práctica carretilla retráctil de fácil manejo que se ha diseñado para proporcionar una gran maniobrabilidad,...',
  'https://www.carretillastekon.com/wp-content/uploads/R100.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabr100bres_0.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'r100'), 'Carga nominal', '1200', 'kg', 0),
  ((SELECT id FROM forklifts WHERE slug = 'r100'), 'Tipo de operador', 'Sentado', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'r100'), 'Tipo de mástil*', 'DT/TL', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 'r100'), 'Alturas de elevación (h23) de', '3000', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'r100'), 'Máxima altura de elevación (h23)', '7000', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 'r100'), 'Velocidad de desplazamiento con/sin carga', '10', 'km/h', 5),
  ((SELECT id FROM forklifts WHERE slug = 'r100'), 'Velocidad de elevación, con/sin carga', '0.31/0.44', 'm/s', 6),
  ((SELECT id FROM forklifts WHERE slug = 'r100'), 'Velocidad de descenso, con/sin carga', '0.49/0.52', 'm/s', 7),
  ((SELECT id FROM forklifts WHERE slug = 'r100'), 'Ancho de chasis (b1)', '1270', 'mm', 8),
  ((SELECT id FROM forklifts WHERE slug = 'r100'), 'Compartimentos de batería', 'Estándar/ cambio lateralmente', NULL, 9),
  ((SELECT id FROM forklifts WHERE slug = 'r100'), 'Voltaje de la batería/Capacidad nominal K5', '48V / 310 – 465 Ah', NULL, 10),
  ((SELECT id FROM forklifts WHERE slug = 'r100'), 'Potencia del motor de desplazamiento/elevación', '5/10', 'kW', 11);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'B400', 'b400',
  (SELECT id FROM categories WHERE slug = 'carretillas-electricas-4-ruedas'),
  'Las carretillas contrapesadas CESAB B400, compactas y potentes, están diseñadas para brindar un alto rendimiento y excelente maniobrabilidad, respaldadas por la probada fiabilidad de CESAB. Equipadas con Intelligent Stability Design (ISD), supervisan activamente parámetros clave para minimizar el tiempo de inactividad y garantizar la máxima productividad. El sistema ISD, compuesto por diez sensores, tres actuadores y un controlador, contribuye activamente a la seguridad laboral corrigiendo operaciones de manejo de materiales para asegurar la estabilidad de la carretilla y la carga. La tecnología de diseño de mástil inteligente (IMD) ofrece una visibilidad líder en el sector, con características de seguridad activa que permiten a los operarios manejar las cargas con precisión y menos riesgo. La serie B400 incluye opciones de controles como mandos hidráulicos táctiles, joysticks de doble función o un único joystick multifunción, y ofrece flexibilidad en la selección de pedales y baterías. Con motores de CA de 48 voltios, la serie CESAB B400 proporciona un rendimiento excepcional, eliminando la necesidad de elegir entre maniobrabilidad y rendimiento.',
  'Las carretillas contrapesadas CESAB B400, compactas y potentes, están diseñadas para brindar un alto rendimiento y excelente maniobrabilidad, respaldadas por la...',
  'https://www.carretillastekon.com/wp-content/uploads/B400.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/brb300-b400es.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'b400'), 'Sistema de tracción', 'Eléctrico', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'b400'), 'Capacidad de carga (Q)', '1600', 'kg', 1),
  ((SELECT id FROM forklifts WHERE slug = 'b400'), 'Distancia al centro de gravedad de la carga (c)', '500', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'b400'), 'Alturas de elevació (h3) de', '3000', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'b400'), 'Velocidad de traslación, con/sin carga', '20/20', 'km/h', 4),
  ((SELECT id FROM forklifts WHERE slug = 'b400'), 'Velocidad de elevación, con/sin carga', '0.43/0.61', 'm/s', 5),
  ((SELECT id FROM forklifts WHERE slug = 'b400'), 'Radio de giro (Wa)', '1707', 'mm', 6),
  ((SELECT id FROM forklifts WHERE slug = 'b400'), 'Voltaje de la batería/Capacidad nominal (5h)', '48V / 525-625 Ah', NULL, 7);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'B600', 'b600',
  (SELECT id FROM categories WHERE slug = 'carretillas-electricas-4-ruedas'),
  'La gama CESAB de carretillas elevadoras eléctricas de 80V y 4 ruedas ofrece una solución potente para alcanzar niveles superiores de productividad en el entorno laboral. Con modelos que van desde 2000 kg hasta 5000 kg, incluyendo las versiones B625 y B630 con capacidades de 2500 kg y 3000 kg respectivamente, estas carretillas están diseñadas para diversas aplicaciones. La opción de extracción lateral de la batería en la B600 facilita operaciones de trabajo más prolongadas, especialmente en entornos de logística y distribución. Con la capacidad de operar en interiores y exteriores gracias a la opción de protección de motor, las carretillas eléctricas CESAB B600 destacan por su tecnología de Diseño Inteligente del Mástil (IMD), que garantiza óptima visibilidad y durabilidad, con sensores que monitorean la velocidad y altura para una seguridad superior. La serie ofrece una variedad de mástiles, adaptándose a diversas aplicaciones, con una altura máxima de elevación de 6500 mm.',
  'La gama CESAB de carretillas elevadoras eléctricas de 80V y 4 ruedas ofrece una solución potente para alcanzar niveles superiores de productividad en el entorno...',
  'https://www.carretillastekon.com/wp-content/uploads/B600.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabb620-650bres.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'b600'), 'Sistema de tracción', 'Eléctrico', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'b600'), 'Capacidad de carga (Q)', '2000', 'kg', 1),
  ((SELECT id FROM forklifts WHERE slug = 'b600'), 'Distancia al centro de gravedad de la carga (c)', '500', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'b600'), 'Alturas de elevació (h3) de', '3260', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'b600'), 'Velocidad de traslación, con/sin carga', '16 / 16', 'km/h', 4),
  ((SELECT id FROM forklifts WHERE slug = 'b600'), 'Versión de alto rendimiento', '19 / 20', 'km/h', 5),
  ((SELECT id FROM forklifts WHERE slug = 'b600'), 'Velocidad de elevación, con/sin carga', '0,43 / 0,60', 'm/s', 6),
  ((SELECT id FROM forklifts WHERE slug = 'b600'), 'Radio de giro (Wa)', '2025', 'mm', 8),
  ((SELECT id FROM forklifts WHERE slug = 'b600'), 'Voltaje de la batería/Capacidad nominal (5h)', '80V / 500-620Ah', NULL, 9);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'B800', 'b800',
  (SELECT id FROM categories WHERE slug = 'carretillas-electricas-4-ruedas'),
  'La CESAB B800* es una carretilla eléctrica contrapesada de alta resistencia con capacidades de carga de hasta 8500 kg. Se caracteriza por altos niveles de rendimiento y autonomía logrados gracias al uso de motores eléctricos dotados de control electrónico avanzado y la posibilidad de utilizar baterías de gran capacidad. Todo ello da lugar a una carretilla de alta calidad diseñada para tareas pesadas. * Antes conocida como gama ECO-P.',
  'La CESAB B800* es una carretilla eléctrica contrapesada de alta resistencia con capacidades de carga de hasta 8500 kg. Se caracteriza por altos niveles de...',
  'https://www.carretillastekon.com/wp-content/uploads/B800-1.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/brb800es.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Sistema de tracción', 'Eléctrico', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Capacidad de carga (Q)', '6000', 'kg', 1),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Distancia al centro de gravedad de la carga (c)', '600', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Alturas de elevación (h3) de', '3150', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Velocidad de traslación, con/sin carga', '18/20', 'km/h', 4),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Velocidad de elevación, con/sin carga', '0.38/0.48', 'm/s', 5),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Radio de giro (Wa)', '3005', 'mm', 6),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Voltaje de la batería/Capacidad nominal (5h)', '80V / 1120-1240Ah', NULL, 7),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Model Code', 'B880', NULL, 16),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Power Unit', 'Electric', NULL, 17),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Load Capacity (Q)', '8000', 'kg', 18),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Load Centre (c)', '600', 'mm', 19),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Travel Speed with/without load', '17 / 19', 'km/h', 20),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Lifting Speed with/without load', '0,32 / 0,42', 'm/s', 21),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Turning Radius (Wa)', '3005', 'mm', 22),
  ((SELECT id FROM forklifts WHERE slug = 'b800'), 'Battery Voltage/Rated Capacity (5h)', '80V / 1120-1240Ah', NULL, 23);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'B200', 'b200',
  (SELECT id FROM categories WHERE slug = 'carretillas-electricas-3-ruedas'),
  'La carretilla elevadora CESAB B200, diseñada para aplicaciones ligeras y medianas, sobresale por su máxima maniobrabilidad en espacios reducidos. Equipada con la tecnología Intelligent Stability Design (ISD), esta serie de carretillas de tres ruedas supervisa activamente los parámetros de rendimiento para minimizar el tiempo de inactividad y garantizar la máxima productividad. El sistema ISD, con diez sensores, tres actuadores y un controlador, contribuye a la seguridad laboral corrigiendo operaciones de manejo de materiales para mantener la estabilidad de la carretilla y la carga. Además, incorpora la tecnología de diseño de mástil inteligente (IMD) para una visibilidad líder en el sector, combinando un diseño que ofrece una excelente vista frontal con una cabina espaciosa y opciones de controles flexibles. Con tracción trasera y un rendimiento excepcional, la serie CESAB B200 destaca por su tamaño compacto, estabilidad óptima y excelencia en el manejo de materiales.',
  'La carretilla elevadora CESAB B200, diseñada para aplicaciones ligeras y medianas, sobresale por su máxima maniobrabilidad en espacios reducidos. Equipada con...',
  'https://www.carretillastekon.com/wp-content/uploads/B200.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/brb200es.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'b200'), 'Sistema de tracción', 'Eléctrico', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'b200'), 'Capacidad de carga (Q)', '1000', 'kg', 1),
  ((SELECT id FROM forklifts WHERE slug = 'b200'), 'Distancia al centro de gravedad de la carga (c)', '500', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'b200'), 'Alturas de elevación (h3) de', '2970', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'b200'), 'Velocidad de traslación, con/sin carga', '12/12.5', 'km/h', 4),
  ((SELECT id FROM forklifts WHERE slug = 'b200'), 'Velocidad de elevación, con/sin carga', '0.34/0.52', 'm/s', 5),
  ((SELECT id FROM forklifts WHERE slug = 'b200'), 'Radio de giro (Wa)', '1229', 'mm', 6),
  ((SELECT id FROM forklifts WHERE slug = 'b200'), 'Voltaje de la batería/Capacidad nominal (5h)', '24V / 420-500 Ah', NULL, 7);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'B300', 'b300',
  (SELECT id FROM categories WHERE slug = 'carretillas-electricas-3-ruedas'),
  'Las carretillas elevadoras CESAB B300 destacan por su rendimiento potente y maniobrabilidad excepcional en aplicaciones ligeras y medianas. Garantizando fiabilidad y seguridad, la serie ofrece una espaciosa cabina con vista panorámica de 360° y mandos hidráulicos ergonómicos. Equipadas con Intelligent Stability Design (ISD), supervisan activamente parámetros clave para minimizar el tiempo de inactividad y garantizar la máxima productividad. Con tecnología Intelligent Mast Design (IMD) para una visibilidad líder en el sector, la serie presenta diversas opciones de controles, como mandos táctiles y joysticks de doble función. Con motores de CA de 48 voltios, las CESAB B300 logran un rendimiento excepcional, eliminando la necesidad de elegir entre maniobrabilidad y rendimiento. Además, ofrecen flexibilidad en la elección de pedales y baterías, adaptándose a diversas necesidades de uso en aplicaciones de varios turnos.',
  'Las carretillas elevadoras CESAB B300 destacan por su rendimiento potente y maniobrabilidad excepcional en aplicaciones ligeras y medianas. Garantizando...',
  'https://www.carretillastekon.com/wp-content/uploads/B200-1.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/brb300-b400es.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'b300'), 'Sistema de tracción', 'Eléctrico', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'b300'), 'Capacidad de carga (Q)', '1500', 'Kg', 1),
  ((SELECT id FROM forklifts WHERE slug = 'b300'), 'Distancia al centro de gravedad de la carga (c)', '500', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'b300'), 'Alturas de elevación (h3) de', '3000', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'b300'), 'Velocidad de traslación, con/sin carga', '16/16', 'km/h', 4),
  ((SELECT id FROM forklifts WHERE slug = 'b300'), 'Velocidad de elevación, con/sin carga', '0.44/0.61', 'm/s', 5),
  ((SELECT id FROM forklifts WHERE slug = 'b300'), 'Radio de giro (Wa)', '1455', 'mm', 6),
  ((SELECT id FROM forklifts WHERE slug = 'b300'), 'Voltaje de la batería/Capacidad nominal (5h)', '48V / 420-500 Ah', NULL, 7);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'TTE 71', 'tte-71',
  (SELECT id FROM categories WHERE slug = 'soluciones-de-remolque'),
  'Operator type: Sitting driver',
  'Operator type: Sitting driver',
  'https://www.carretillastekon.com/wp-content/uploads/tte71_0.jpg',
  NULL,
  true, true, false, true
);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'TTE 40', 'tte-40',
  (SELECT id FROM categories WHERE slug = 'soluciones-de-remolque'),
  'Operator type: Sitting driver',
  'Operator type: Sitting driver',
  'https://www.carretillastekon.com/wp-content/uploads/tte40_0.jpg',
  NULL,
  true, true, false, true
);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'TTE 30', 'tte-30',
  (SELECT id FROM categories WHERE slug = 'soluciones-de-remolque'),
  'Operator type: Sitting / standing',
  'Operator type: Sitting / standing',
  'https://www.carretillastekon.com/wp-content/uploads/tte30_0.jpg',
  NULL,
  true, true, false, true
);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'TE 80IXB', 'te-80ixb',
  (SELECT id FROM categories WHERE slug = 'soluciones-de-remolque'),
  'Operator type: Sitting driver',
  'Operator type: Sitting driver',
  'https://www.carretillastekon.com/wp-content/uploads/te80ixb.jpg',
  NULL,
  true, true, false, true
);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'TTE 15', 'tte-15',
  (SELECT id FROM categories WHERE slug = 'soluciones-de-remolque'),
  'Operator type: Standing driver',
  'Operator type: Standing driver',
  'https://www.carretillastekon.com/wp-content/uploads/tte15_0.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabsimaiadvancebrochureportraitv04lores_25-1.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'tte-15'), 'Model Code', 'PE 15', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'tte-15'), 'Drive', 'Electric', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'tte-15'), 'Operator type', 'Sitting driver', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 'tte-15'), 'Load capacity (Q)', '1,5', 't', 3),
  ((SELECT id FROM forklifts WHERE slug = 'tte-15'), 'Towing capacity (Q)', '5', 't', 4),
  ((SELECT id FROM forklifts WHERE slug = 'tte-15'), 'Rated drawbar pull (F)', '1400', 'N', 5),
  ((SELECT id FROM forklifts WHERE slug = 'tte-15'), 'Wheelbase (Y)', '1800', 'mm', 6);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'TE 80', 'te-80',
  (SELECT id FROM categories WHERE slug = 'soluciones-de-remolque'),
  'Operator type: Sitting driver',
  'Operator type: Sitting driver',
  'https://www.carretillastekon.com/wp-content/uploads/te80_0.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabsimaiadvancebrochureportraitv04lores_25-1.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'te-80'), 'Model Code', 'TE 80', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'te-80'), 'Drive', 'Electric', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'te-80'), 'Operator type', 'Sitting driver', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 'te-80'), 'Load capacity (Q)', '0,1', 't', 3),
  ((SELECT id FROM forklifts WHERE slug = 'te-80'), 'Towing capacity (Q)', '8', 't', 4),
  ((SELECT id FROM forklifts WHERE slug = 'te-80'), 'Rated drawbar pull (F)', '1900', 'N', 5),
  ((SELECT id FROM forklifts WHERE slug = 'te-80'), 'Wheelbase (Y)', '1229', 'mm', 6);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'TE 500RR', 'te-500rr',
  (SELECT id FROM categories WHERE slug = 'soluciones-de-remolque'),
  'Operator type: Sitting driver',
  'Operator type: Sitting driver',
  'https://www.carretillastekon.com/wp-content/uploads/te500rr_0.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabsimaiadvancebrochureportraitv04lores_25-1.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'te-500rr'), 'Model Code', 'TE 500RR', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'te-500rr'), 'Drive', 'Electric', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'te-500rr'), 'Operator type', 'Sitting driver', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 'te-500rr'), 'Load capacity (Q)', '0,2', 't', 3),
  ((SELECT id FROM forklifts WHERE slug = 'te-500rr'), 'Towing capacity (Q)', '50', 't', 4),
  ((SELECT id FROM forklifts WHERE slug = 'te-500rr'), 'Rated drawbar pull (F)', '10000', 'N', 5),
  ((SELECT id FROM forklifts WHERE slug = 'te-500rr'), 'Wheelbase (Y)', '1820', 'mm', 6);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'TE 300R', 'te-300r',
  (SELECT id FROM categories WHERE slug = 'soluciones-de-remolque'),
  'Operator type: Sitting driver',
  'Operator type: Sitting driver',
  'https://www.carretillastekon.com/wp-content/uploads/te300r_0.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabsimaiadvancebrochureportraitv04lores_25-1.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'te-300r'), 'Model Code', 'TE 300R', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'te-300r'), 'Drive', 'Electric', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'te-300r'), 'Operator type', 'Sitting driver', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 'te-300r'), 'Load capacity (Q)', '0,1', 't', 3),
  ((SELECT id FROM forklifts WHERE slug = 'te-300r'), 'Towing capacity (Q)', '30', 't', 4),
  ((SELECT id FROM forklifts WHERE slug = 'te-300r'), 'Rated drawbar pull (F)', '5400', 'N', 5),
  ((SELECT id FROM forklifts WHERE slug = 'te-300r'), 'Wheelbase (Y)', '2000', 'mm', 6);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'TE 291', 'te-291',
  (SELECT id FROM categories WHERE slug = 'transpaletas-electricas'),
  'Model Code TE 291 TE 291L Drive Electric Electric Operator type Sitting drive Sitting drive Load Capacity (Q) 0,2 t 0,2 t Towing capacity (Q) 29 t 29 t Rated drawbar pull (F) 5800 N 5800 N Wheelbase (Y) 1550 mm 1840 mm',
  'Model Code TE 291 TE 291L Drive Electric Electric Operator type Sitting drive Sitting drive Load Capacity (Q) 0,2 t 0,2 t Towing capacity (Q) 29 t 29 t Rated...',
  'https://www.carretillastekon.com/wp-content/uploads/te291_0.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabsimaiadvancebrochureportraitv04lores_25-1.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'te-291'), 'Model Code', 'TE 291', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'te-291'), 'Drive', 'Electric', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'te-291'), 'Operator type', 'Sitting drive', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 'te-291'), 'Load Capacity (Q)', '0,2', 't', 3),
  ((SELECT id FROM forklifts WHERE slug = 'te-291'), 'Towing capacity (Q)', '29', 't', 4),
  ((SELECT id FROM forklifts WHERE slug = 'te-291'), 'Rated drawbar pull (F)', '5800', 'N', 5),
  ((SELECT id FROM forklifts WHERE slug = 'te-291'), 'Wheelbase (Y)', '1550', 'mm', 6);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'TE 152', 'te-152',
  (SELECT id FROM categories WHERE slug = 'soluciones-de-remolque'),
  'Operator type: Sitting driver',
  'Operator type: Sitting driver',
  'https://www.carretillastekon.com/wp-content/uploads/te152_0.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabsimaiadvancebrochureportraitv04lores_25-1.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'te-152'), 'Model Code', 'TE 152', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'te-152'), 'Drive', 'Electric', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'te-152'), 'Operator type', 'Sitting driver', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 'te-152'), 'Load capacity (Q)', '0,2', 't', 3),
  ((SELECT id FROM forklifts WHERE slug = 'te-152'), 'Towing capacity (Q)', '15', 't', 4),
  ((SELECT id FROM forklifts WHERE slug = 'te-152'), 'Rated drawbar pull (F)', '3000', 'N', 5),
  ((SELECT id FROM forklifts WHERE slug = 'te-152'), 'Wheelbase (Y)', '1425', 'mm', 6);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'PE 30', 'pe-30',
  (SELECT id FROM categories WHERE slug = 'soluciones-de-remolque'),
  'Operator type: Sitting driver',
  'Operator type: Sitting driver',
  'https://www.carretillastekon.com/wp-content/uploads/pe30_0.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabsimaiadvancebrochureportraitv04lores_25-1.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'pe-30'), 'Model Code', 'PE 20', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'pe-30'), 'Drive', 'Electric', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'pe-30'), 'Operator type', 'Sitting driver', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 'pe-30'), 'Load capacity (Q)', '3', 't', 3),
  ((SELECT id FROM forklifts WHERE slug = 'pe-30'), 'Towing capacity (Q)', '8', 't', 4),
  ((SELECT id FROM forklifts WHERE slug = 'pe-30'), 'Rated drawbar pull (F)', '2400', 'N', 5),
  ((SELECT id FROM forklifts WHERE slug = 'pe-30'), 'Wheelbase (Y)', '2750', 'mm', 6);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'PE 20', 'pe-20',
  (SELECT id FROM categories WHERE slug = 'soluciones-de-remolque'),
  'Operator type: Sitting driver',
  'Operator type: Sitting driver',
  'https://www.carretillastekon.com/wp-content/uploads/pe20_0.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabsimaiadvancebrochureportraitv04lores_25-1.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'pe-20'), 'Model Code', 'PE 20', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'pe-20'), 'Drive', 'Electric', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'pe-20'), 'Operator type', 'Sitting driver', NULL, 2),
  ((SELECT id FROM forklifts WHERE slug = 'pe-20'), 'Load capacity (Q)', '2', 't', 3),
  ((SELECT id FROM forklifts WHERE slug = 'pe-20'), 'Towing capacity (Q)', '6', 't', 4),
  ((SELECT id FROM forklifts WHERE slug = 'pe-20'), 'Rated drawbar pull (F)', '1750', 'N', 5),
  ((SELECT id FROM forklifts WHERE slug = 'pe-20'), 'Wheelbase (Y)', '1935', 'mm', 6);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'PE15', 'pe15',
  (SELECT id FROM categories WHERE slug = 'soluciones-de-remolque'),
  'Operator type: Sitting driver',
  'Operator type: Sitting driver',
  'https://www.carretillastekon.com/wp-content/uploads/pe15_0.jpg',
  NULL,
  true, true, false, true
);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'P300', 'p300',
  (SELECT id FROM categories WHERE slug = 'transpaletas-electricas'),
  'Las transpaletas eléctricas CESAB P300 ofrecen una combinación sin igual de maniobrabilidad compacta y alto rendimiento. Con capacidades de 2000 kg y 2200 kg y una velocidad de traslación de hasta 10 km/h, las carretillas CESAB P300 son perfectas para operaciones que requieran recorrer largas distancias y aplicaciones intensivas como la carga y descarga de vehículos.',
  'Las transpaletas eléctricas CESAB P300 ofrecen una combinación sin igual de maniobrabilidad compacta y alto rendimiento. Con capacidades de 2000 kg y 2200 kg y...',
  'https://www.carretillastekon.com/wp-content/uploads/P300.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabp300bres.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'p300'), 'Carga nominal', '2000', 'kg', 0),
  ((SELECT id FROM forklifts WHERE slug = 'p300'), 'Tipo de operador', 'Plataforma del operador', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'p300'), 'Velocidad de desplazamiento con/sin carga', '6-9/6-10', 'km/h', 2),
  ((SELECT id FROM forklifts WHERE slug = 'p300'), 'Longitud carretilla (L2)*, excl. horquillas y plataforma elevada', '666 – 871 mm', NULL, 3),
  ((SELECT id FROM forklifts WHERE slug = 'p300'), 'Ancho de chasis (b1)', '730', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 'p300'), 'Voltaje de la batería/Capacidad nominal K5', '24V / 225 – 400 Ah', NULL, 5),
  ((SELECT id FROM forklifts WHERE slug = 'p300'), 'Longitud horquillas', '1000 – 2350 mm', NULL, 6);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'P216i', 'p216i',
  (SELECT id FROM categories WHERE slug = 'transpaletas-electricas'),
  'Con esta transpaleta eléctrica P216i, diseñada exclusivamente en torno a nuestro concepto modular de iones de litio, CESAB añade un nuevo modelo con características únicas a la probada gama de transpaletas eléctricas CESAB P200. Ofreciendo la misma calidad y rendimiento sobresalientes, la nueva CESAB P216i es más corta, más baja y liviana, y tiene todas las ventajas de los iones de litio: no se intercambia la batería, no se necesita un área de carga separada, batería sin mantenimiento, etc. Esta nueva CESAB P216i es la solución perfecta para los clientes que necesitan una carretilla compacta para trabajar en áreas de espacio reducido o de peso limitado, o que necesitan una carretilla disponible durante todo el día.',
  'Con esta transpaleta eléctrica P216i, diseñada exclusivamente en torno a nuestro concepto modular de iones de litio, CESAB añade un nuevo modelo con...',
  'https://www.carretillastekon.com/wp-content/uploads/P216i-2-scaled.jpg',
  NULL,
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'p216i'), 'Carga nominal', '1600', 'kg', 0),
  ((SELECT id FROM forklifts WHERE slug = 'p216i'), 'Tipo de operador', 'Acompañante', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'p216i'), 'Velocidad de desplazamiento con/sin carga', '6/6', 'km/h', 2),
  ((SELECT id FROM forklifts WHERE slug = 'p216i'), 'Longitud carretilla, excl. horquillas (L2)', '419', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'p216i'), 'Longitud horquillas', '1150', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 'p216i'), 'Ancho de chasis (b1)', '730', 'mm', 5),
  ((SELECT id FROM forklifts WHERE slug = 'p216i'), 'Voltaje de la batería/Capacidad nominal K5', '24/50V, 105/150Ah', NULL, 6);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'P200', 'p200',
  (SELECT id FROM categories WHERE slug = 'transpaletas-electricas'),
  'Para las necesidades de las operaciones con conductor a pie, la gama CESAB P200 de transpaletas eléctricas significa negocio. Con su diseño compacto que incluye un chasis redondeado y un timón de montaje central, la gama CESAB P200 ofrece una excelente maniobrabilidad y un manejo de sin esfuerzo. Desde la venta minorista hasta la mayorista, desde la fabricación hasta la distribución, la gama CESAB P200 ofrece una solución flexible para todas las aplicaciones con conducción externa. La gama CESAB P200 está disponible con capacidad de 1,4 a 2,5 toneladas, con una selección de baterías que permite personalizarla transpaleta elegida según las exigencias desu empresa.',
  'Para las necesidades de las operaciones con conductor a pie, la gama CESAB P200 de transpaletas eléctricas significa negocio. Con su diseño compacto que incluye...',
  'https://www.carretillastekon.com/wp-content/uploads/P200-1.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabp200bres.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'p200'), 'Carga nominal', '1400', 'kg', 0),
  ((SELECT id FROM forklifts WHERE slug = 'p200'), 'Tipo de operador', 'Acompañante', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'p200'), 'Velocidad de desplazamiento con/sin carga', '6/6', 'km/h', 2),
  ((SELECT id FROM forklifts WHERE slug = 'p200'), 'Longitud carretilla, excl. horquillas (L2)', '481', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'p200'), 'Longitud horquillas', '810 – 1520 mm', NULL, 4),
  ((SELECT id FROM forklifts WHERE slug = 'p200'), 'Ancho de chasis (b1)', '726', 'mm', 5),
  ((SELECT id FROM forklifts WHERE slug = 'p200'), 'Voltaje de la batería/Capacidad nominal K5', '24V / 150 Ah', NULL, 6),
  ((SELECT id FROM forklifts WHERE slug = 'p200'), 'Longitud carretilla, excl. horquillas (L2)*', '481/538', 'mm', 10);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'P100', 'p100',
  (SELECT id FROM categories WHERE slug = 'transpaletas-electricas'),
  'Elimine el trabajo de tirar, empujar y levantar la carga manualmente y mejore la productividad de su empresa. La CESAB P113 es un modelo perfecto para dar el salto de las transpaletas manuales a las eléctricas. Posee un tamaño compacto y una excelente maniobrabilidad que la hacen muy adecuada para operaciones de baja intensidad en espacios reducidos . También resulta muy práctica para usarla en camiones de transporte, ya que lleva un cargador en el vehículo.',
  'Elimine el trabajo de tirar, empujar y levantar la carga manualmente y mejore la productividad de su empresa. La CESAB P113 es un modelo perfecto para dar el...',
  'https://www.carretillastekon.com/wp-content/uploads/P100.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabp100speces.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'p100'), 'Carga nominal', '1300', 'kg', 0),
  ((SELECT id FROM forklifts WHERE slug = 'p100'), 'Tipo de operador', 'Acompañante', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'p100'), 'Velocidad de desplazamiento con/sin carga', '4.5/5.5', 'km/h', 2),
  ((SELECT id FROM forklifts WHERE slug = 'p100'), 'Longitud carretilla, excl. horquillas (L2)', '420', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'p100'), 'Ancho de chasis (b1)', '700', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 'p100'), 'Voltaje de la batería/Capacidad nominal K5', '2x 12V / 63 Ah (Sin mantenimiento)', NULL, 5),
  ((SELECT id FROM forklifts WHERE slug = 'p100'), 'Cargador', 'Incorporado', NULL, 6);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'P013i', 'p013i',
  (SELECT id FROM categories WHERE slug = 'transpaletas-electricas'),
  'Con el lanzamiento de la P013, CESAB ofrece una solución económica para mecanizar el manejo básico de materiales. El manejo manual es la principal causa de lesiones musculares en el lugar de trabajo; estos tipos de lesiones representan más de 1/3 de todas las enfermedades relacionadas con el trabajo. Con la P013, CESAB cierra la brecha entre las transpaletas manuales y las transpaletas eléctricas más caras. La P013 tiene todas las características de las «grandes»: Reducción automática de la velocidad en las curvas para una máxima seguridad del conductor y la carga, botón «tortuga» para maniobras más precisas, conduciendo con el timón en posición vertical cuando las cosas se ponen difíciles. Su batería de 24V-36Ah ofrece una excelente autonomía y se puede cargar rápidamente en menos de 3 horas. La P013 es la solución ideal y económica cuando las cargas son pesadas o cuando hay poco espacio.',
  'Con el lanzamiento de la P013, CESAB ofrece una solución económica para mecanizar el manejo básico de materiales. El manejo manual es la principal causa de...',
  'https://www.carretillastekon.com/wp-content/uploads/P013i.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/p013i-flyer.pdf',
  true, true, false, true
);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'O125-O125P', 'o125-o125p',
  (SELECT id FROM categories WHERE slug = 'preparadoras-de-pedidos-de-bajo-nivel'),
  'Las CESAB O125 y O125P son máquinas potentes para la preparación de pedidos a bajo nivel, con una gran variedad de dimensiones de horquilla que se adaptan tanto a palets como a contenedores con ruedas. La versión P ofrece elevación de plataforma a un metro, con un pulsador en el pie para descender en modo de manos libres.',
  'Las CESAB O125 y O125P son máquinas potentes para la preparación de pedidos a bajo nivel, con una gran variedad de dimensiones de horquilla que se adaptan tanto...',
  'https://www.carretillastekon.com/wp-content/uploads/O125-O125P.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabbrochurellopenv02lores_0.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'o125-o125p'), 'Alimentación', 'Eléctrica', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'o125-o125p'), 'Capacidad de carga (Q)', '2500', 'kg', 1),
  ((SELECT id FROM forklifts WHERE slug = 'o125-o125p'), 'Centro de carga (c)', '1200', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'o125-o125p'), 'Altura de base (h7)', '138', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'o125-o125p'), 'Anchura total (b1)', '790', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 'o125-o125p'), 'Velocidad de traslación con/sin carga', '8,0/12,0', 'km/h', 5),
  ((SELECT id FROM forklifts WHERE slug = 'o125-o125p'), 'Velocidad de elevación con/sin carga', '0,067/0,094', 'm/s', 6),
  ((SELECT id FROM forklifts WHERE slug = 'o125-o125p'), 'Velocidad de descenso con/sin carga', '0,08/0,05', 'm/s', 7);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'O112P', 'o112p',
  (SELECT id FROM categories WHERE slug = 'preparadoras-de-pedidos-de-bajo-nivel'),
  'Con una elevación de horquillas de 800 mm, las CESAB O112 y O112P son ideales para recoger mercancías pesadas, ya que permiten al operario elevar las horquillas a la altura de trabajo. Hay múltiples dimensiones de horquilla disponibles para una amplia gama de portacargas. La versión P con plataforma permite una altura de recogida de aproximadamente 2,70 metros.',
  'Con una elevación de horquillas de 800 mm, las CESAB O112 y O112P son ideales para recoger mercancías pesadas, ya que permiten al operario elevar las horquillas...',
  'https://www.carretillastekon.com/wp-content/uploads/0112P.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabbrochurellopenv02lores_0.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'o112p'), 'Alimentación', 'Eléctrica', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'o112p'), 'Capacidad de carga (Q)', '1200', 'kg', 1),
  ((SELECT id FROM forklifts WHERE slug = 'o112p'), 'Centro de carga (c)', '1200', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'o112p'), 'Altura de base (h7)', '138', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'o112p'), 'Anchura total (b1)', '790', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 'o112p'), 'Velocidad de traslación con/sin carga', '8,0/12,0', 'km/h', 5),
  ((SELECT id FROM forklifts WHERE slug = 'o112p'), 'Velocidad de elevación con/sin carga', '0,13/0,15', 'm/s', 6),
  ((SELECT id FROM forklifts WHERE slug = 'o112p'), 'Velocidad de descenso con/sin carga', '0,22/0,18', 'm/s', 7);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'O120X', 'o120x',
  (SELECT id FROM categories WHERE slug = 'preparadoras-de-pedidos-de-bajo-nivel'),
  'Los modelos con elevación de tijera de la versión X son ideales para aplicaciones donde es preciso elevar las horquillas a la altura de trabajo, por ejemplo, para recoger mercancías pesadas y grandes. La versión P permite al operario alcanzar una altura de plataforma de 1000 mm para la recogida en el segundo nivel (~ 2,7 m). Hay múltiples dimensiones de horquilla disponibles.',
  'Los modelos con elevación de tijera de la versión X son ideales para aplicaciones donde es preciso elevar las horquillas a la altura de trabajo, por ejemplo,...',
  'https://www.carretillastekon.com/wp-content/uploads/O112X.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabbrochurellopenv02lores_0.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'o120x'), 'Alimentación', 'Eléctrica', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'o120x'), 'Capacidad de carga (Q)', '2000/1800* kg', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'o120x'), 'Centro de carga (c)', '1200/1400', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'o120x'), 'Altura de base (h7)', '138', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'o120x'), 'Anchura total (b1)', '790', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 'o120x'), 'Velocidad de traslación con/sin carga', '8,5/12,0', 'km/h', 5),
  ((SELECT id FROM forklifts WHERE slug = 'o120x'), 'Velocidad de elevación con/sin carga', '0,07/0,12', 'm/s', 6),
  ((SELECT id FROM forklifts WHERE slug = 'o120x'), 'Velocidad de descenso con/sin carga', '0,12/0,12', 'm/s', 7);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'O112CB', 'o112cb',
  (SELECT id FROM categories WHERE slug = 'preparadoras-de-pedidos-de-bajo-nivel'),
  'La CESAB O112CB es una solución híbrida todo en uno diseñada para recogida y apilado. Este modelo puede solicitarse con un mástil símplex o dúplex y ofrece horquillas ajustables para adaptarse a una gran variedad de portacargas. La altura de elevación con el mástil dúplex alcanza los 4,15 m. Con la CESAB O112CB, el operario puede recoger y reponer fácilmente las estanterías.',
  'La CESAB O112CB es una solución híbrida todo en uno diseñada para recogida y apilado. Este modelo puede solicitarse con un mástil símplex o dúplex y ofrece...',
  'https://www.carretillastekon.com/wp-content/uploads/0112CB.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabbrochurellopenv02lores_0.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'o112cb'), 'Alimentación', 'Eléctrica', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'o112cb'), 'Capacidad de carga (Q)', '1200', 'kg', 1),
  ((SELECT id FROM forklifts WHERE slug = 'o112cb'), 'Centro de carga (c)', '500', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'o112cb'), 'Altura de base (h7)', '135', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'o112cb'), 'Anchura total (b1/b2)', '790/861', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 'o112cb'), 'Velocidad de traslación con/sin carga', '7,0/12,0', 'km/h', 5),
  ((SELECT id FROM forklifts WHERE slug = 'o112cb'), 'Velocidad de elevación con/sin carga', '0,12/0,27', 'm/s', 6),
  ((SELECT id FROM forklifts WHERE slug = 'o112cb'), 'Velocidad de descenso con/sin carga', '0,33/0,36', 'm/s', 7);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'O112', 'o112',
  (SELECT id FROM categories WHERE slug = 'preparadoras-de-pedidos-de-bajo-nivel'),
  'Con una elevación de horquillas de 800 mm, las CESAB O112 y O112P son ideales para recoger mercancías pesadas, ya que permiten al operario elevar las horquillas a la altura de trabajo. Hay múltiples dimensiones de horquilla disponibles para una amplia gama de portacargas. La versión P con plataforma permite una altura de recogida de aproximadamente 2,70 metros.',
  'Con una elevación de horquillas de 800 mm, las CESAB O112 y O112P son ideales para recoger mercancías pesadas, ya que permiten al operario elevar las horquillas...',
  'https://www.carretillastekon.com/wp-content/uploads/0112.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabbrochurellopenv02lores_0.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'o112'), 'Alimentación', 'Eléctrica', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'o112'), 'Capacidad de carga (Q)', '1200', 'kg', 1),
  ((SELECT id FROM forklifts WHERE slug = 'o112'), 'Centro de carga (c)', '1200', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'o112'), 'Altura de base (h7)', '138', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'o112'), 'Anchura total (b1)', '790', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 'o112'), 'Velocidad de traslación con/sin carga', '8,0/12,0', 'km/h', 5),
  ((SELECT id FROM forklifts WHERE slug = 'o112'), 'Velocidad de elevación con/sin carga', '0,13/0,15', 'm/s', 6),
  ((SELECT id FROM forklifts WHERE slug = 'o112'), 'Velocidad de descenso con/sin carga', '0,22/0,18', 'm/s', 7);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'O110', 'o110',
  (SELECT id FROM categories WHERE slug = 'preparadoras-de-pedidos-de-bajo-nivel'),
  'Estos modelos permiten al conductor y a las horquillas una cómoda recogida en altura. La plataforma se eleva hasta 1,2 m, permitiendo una altura máxima de recogida de aproximadamente 2,7 m. La O110 ofrece una elevación combinada de la plataforma y las horquillas que hace posible una altura de elevación total de 1,8 m. La versión W no lleva barrera, lo que facilita la manipulación de mercancías voluminosas.',
  'Estos modelos permiten al conductor y a las horquillas una cómoda recogida en altura. La plataforma se eleva hasta 1,2 m, permitiendo una altura máxima de...',
  'https://www.carretillastekon.com/wp-content/uploads/cesabo110.jpg',
  NULL,
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'o110'), 'Alimentación', 'Eléctrica', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'o110'), 'Capacidad de carga (Q)', '1000', 'kg', 1),
  ((SELECT id FROM forklifts WHERE slug = 'o110'), 'Centro de carga (c)', '600', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'o110'), 'Altura de base (h7)', '180/1200', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'o110'), 'Anchura total (b1)', '790', 'mm', 4),
  ((SELECT id FROM forklifts WHERE slug = 'o110'), 'Velocidad de traslación con/sin carga', '7,0/12,0', 'km/h', 5),
  ((SELECT id FROM forklifts WHERE slug = 'o110'), 'Velocidad de elevación con/sin carga', '0,12/0,19', 'm/s', 6),
  ((SELECT id FROM forklifts WHERE slug = 'o110'), 'Velocidad de descenso con/sin carga', '0,33/0,36', 'm/s', 7),
  ((SELECT id FROM forklifts WHERE slug = 'o110'), 'Altura de base (h7/h12)', '180/1200', 'mm', 11);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'CE-H', 'ce-h',
  (SELECT id FROM categories WHERE slug = 'transpaletas-manuales'),
  'La H200 es un modelo de alta elevación con capacidad para 1 tonelada y disponible también con motor de elevación eléctrico. Es una transpaleta versátil que puede utilizarse también como mesa de trabajo ergonómica de altura ajustable.',
  'La H200 es un modelo de alta elevación con capacidad para 1 tonelada y disponible también con motor de elevación eléctrico. Es una transpaleta versátil que...',
  'https://www.carretillastekon.com/wp-content/uploads/ce-h.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabce100h200-300speces.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'ce-h'), 'Carga nominal', '1000', 'kg', 0),
  ((SELECT id FROM forklifts WHERE slug = 'ce-h'), 'Motor de elevación eléctrico', '–', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'ce-h'), 'Altura de elevación', '810', 'mm', 2);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'CE', 'ce',
  (SELECT id FROM categories WHERE slug = 'transpaletas-manuales'),
  'La gama de transpaletas manuales CESAB de baja elevación (capacidades situadas entre las 2 y las 3 toneladas) contiene numerosas versiones y configuraciones para cubrir cualquier necesidad del mercado, lo que incluye una versión con freno de mano, otra de elevación rápida y modelos con horquilla baja. Por ejemplo, la versión de elevación rápida ofrece alta productividad y menor fatiga para el operador. Una unidad de bomba de elevación rápida permite a la horquilla realizar el trabajo en dos movimientos, el primero para llegar al palet y el segundo para elevarlo.',
  'La gama de transpaletas manuales CESAB de baja elevación (capacidades situadas entre las 2 y las 3 toneladas) contiene numerosas versiones y configuraciones...',
  'https://www.carretillastekon.com/wp-content/uploads/CE.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabce100h200-300speces.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'ce'), 'Carga nominal', '2000', 'kg', 0),
  ((SELECT id FROM forklifts WHERE slug = 'ce'), 'Tipo', 'Horquilla baja', NULL, 1),
  ((SELECT id FROM forklifts WHERE slug = 'ce'), 'Minima altura de horquillas', '55', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'ce'), 'Ancho exterior horquillas', '520/685', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'ce'), 'Longitud horquillas', '800 – 1220 mm', NULL, 4),
  ((SELECT id FROM forklifts WHERE slug = 'ce'), 'Rated Carga nominal', '3000', 'kg', 10),
  ((SELECT id FROM forklifts WHERE slug = 'ce'), 'Fork Length', '900 – 1830 mm', NULL, 14);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'R300', 'r300',
  (SELECT id FROM categories WHERE slug = 'carretillas-retractiles'),
  'La gama CESAB R300 tiene una productividad extraordinaria garantizada desde el primer día y durante muchos años. Todos los aspectos de cada modelo de la gama han sido desarrollados para incrementar la productividad a niveles nunca vistos. Un conductor con confort y seguridad es productivo. Para obtener una productividad óptima de la persona detrás de los mandos, se han incorporado el confort y la facilidad de uso a cada aspecto del diseño ergonómico de las CESAB R300.',
  'La gama CESAB R300 tiene una productividad extraordinaria garantizada desde el primer día y durante muchos años. Todos los aspectos de cada modelo de la gama...',
  'https://www.carretillastekon.com/wp-content/uploads/R200-1.jpg',
  NULL,
  true, true, false, true
);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'M300TC Stage V', 'm300tc-stage-v',
  (SELECT id FROM categories WHERE slug = 'carretillas-diesel'),
  'La destacada gama CESAB M300TC, disponible en versiones diésel y GLP con capacidades nominales de 1,5 t a 3,5 t, asegura una manipulación precisa y eficaz en diversas aplicaciones. Con un comportamiento de conducción similar al de un automóvil, ofrece altas prestaciones para agilizar las operaciones de manipulación de materiales. Equipada con un convertidor de par, la CESAB M300 garantiza una transición suave de la potencia del motor a las ruedas, brindando velocidad y rendimiento en distancias largas. Impulsada por motores diésel o GLP industriales Fase V, diseñados específicamente para carretillas elevadoras, la gama se beneficia del diseño de mástil inteligente (IMD) para una visibilidad líder en el sector y del diseño de estabilidad inteligente (ISD) para mejorar la seguridad y productividad en el lugar de trabajo. Además, el confort del operario se prioriza con soportes flotantes que reducen vibraciones y fatiga, asegurando operaciones seguras y productivas. La CESAB M300TC, resistente y fiable, ha sido desarrollada con miles de horas de investigación y rigurosas pruebas para ofrecer un rendimiento consistente en el trabajo diario.',
  'La destacada gama CESAB M300TC, disponible en versiones diésel y GLP con capacidades nominales de 1,5 t a 3,5 t, asegura una manipulación precisa y eficaz en...',
  'https://www.carretillastekon.com/wp-content/uploads/M300TC.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabm300bres.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'm300tc-stage-v'), 'Sistema de tracción', 'GLP', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'm300tc-stage-v'), 'Capacidad de carga (Q)', '1500', 'kg', 1),
  ((SELECT id FROM forklifts WHERE slug = 'm300tc-stage-v'), 'Distancia al centro de gravedad de la carga (c)', '500', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'm300tc-stage-v'), 'Alturas de elevación (h3) de', '2970', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'm300tc-stage-v'), 'Velocidad de traslación, con/sin carga', '18,5/19,0', 'km/h', 4),
  ((SELECT id FROM forklifts WHERE slug = 'm300tc-stage-v'), 'Velocidad de elevación, con/sin carga', '0,67/0,68', 'm/s', 5),
  ((SELECT id FROM forklifts WHERE slug = 'm300tc-stage-v'), 'Radio de giro (Wa)', '1990', 'mm', 6),
  ((SELECT id FROM forklifts WHERE slug = 'm300tc-stage-v'), 'Modelo de motor', '4Y-ECS (V)', NULL, 7);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'M300H', 'm300h',
  (SELECT id FROM categories WHERE slug = 'carretillas-diesel'),
  'Ahora la probada carretilla elevadora contrapesada CESAB M300 está disponible con transmisión hidrostática. Llamada serie CESAB M300H, sustituye a la premiada serie Drago. El corazón de este nuevo modelo es un eje propulsor hidrostático de diseño propio desarrollado con componentes de Bosch-Rexroth. La carretilla CESAB M300H ofrece una manipulación potente, pero precisa, con un cambio rápido de dirección para optimizar la productividad. Cuando el acelerador no se acciona, el efecto de frenado automático permite una fácil maniobrabilidad y garantiza un control perfecto en las rampas. El modelo CESAB M300H ofrece tres parámetros de funcionamiento predefinidos y se adapta a las capacidades del conductor.',
  'Ahora la probada carretilla elevadora contrapesada CESAB M300 está disponible con transmisión hidrostática. Llamada serie CESAB M300H, sustituye a la premiada...',
  'https://www.carretillastekon.com/wp-content/uploads/M300H.jpg',
  'https://www.carretillastekon.com/wp-content/uploads/cesabm300bres.pdf',
  true, true, false, true
);

INSERT INTO forklift_specs (forklift_id, spec_name, spec_value, spec_unit, sort_order) VALUES
  ((SELECT id FROM forklifts WHERE slug = 'm300h'), 'Sistema de tracción', 'GLP', NULL, 0),
  ((SELECT id FROM forklifts WHERE slug = 'm300h'), 'Capacidad de carga (Q)', '1500', 'kg', 1),
  ((SELECT id FROM forklifts WHERE slug = 'm300h'), 'Distancia al centro de gravedad de la carga (c)', '500', 'mm', 2),
  ((SELECT id FROM forklifts WHERE slug = 'm300h'), 'Alturas de elevación (h3) de', '2970', 'mm', 3),
  ((SELECT id FROM forklifts WHERE slug = 'm300h'), 'Velocidad de traslación, con/sin carga', '19/19', 'km/h', 4),
  ((SELECT id FROM forklifts WHERE slug = 'm300h'), 'Velocidad de elevación, con/sin carga', '0,67/0,68', 'm/s', 5),
  ((SELECT id FROM forklifts WHERE slug = 'm300h'), 'Radio de giro (Wa)', '1990', 'mm', 6),
  ((SELECT id FROM forklifts WHERE slug = 'm300h'), 'Modelo de motor', '4Y-ECS (V)', NULL, 7);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'Nissan DX25', 'nissan-dx25',
  (SELECT id FROM categories WHERE slug = 'carretillas-diesel'),
  'Capacidad de carga: 2.500 kg',
  'Capacidad de carga: 2.500 kg',
  'https://www.carretillastekon.com/wp-content/uploads/IMG_4252-scaled.jpg',
  NULL,
  false, false, true, true
);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'OM TSX20', 'om-tsx20',
  (SELECT id FROM categories WHERE slug = 'transpaletas-electricas'),
  'Capacidad de carga: 2.000 kg',
  'Capacidad de carga: 2.000 kg',
  'https://www.carretillastekon.com/wp-content/uploads/IMG_4246-scaled.jpg',
  NULL,
  false, false, true, true
);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'Nissan GQ02L30CU', 'nissan-gq02l30cu',
  (SELECT id FROM categories WHERE slug = 'carretillas-electricas-4-ruedas'),
  'Capacidad de carga: 3.000 Kg',
  'Capacidad de carga: 3.000 Kg',
  'https://www.carretillastekon.com/wp-content/uploads/IMG_4244-scaled.jpg',
  NULL,
  false, false, true, true
);

INSERT INTO forklifts (name, slug, category_id, description, short_description, image_url, catalog_pdf_url, available_for_sale, available_for_rental, available_as_used, is_published)
VALUES (
  'OM-Thesi', 'om-thesi',
  (SELECT id FROM categories WHERE slug = 'carretillas-retractiles'),
  'Capacidad Carga: 1.400kg',
  'Capacidad Carga: 1.400kg',
  'https://www.carretillastekon.com/wp-content/uploads/IMG_4242-1-scaled.jpg',
  NULL,
  false, false, true, true
);
