# FÚTBOL: DIRECTOR GENERAL
## Game Design Document — v0.1 POC

**Plataforma objetivo:** web, Vite + React, responsive desktop/tablet/mobile  
**Modelo de juego:** simulación de carrera + gestión deportiva + business tycoon  
**Fantasía del jugador:** empezar como un GM desconocido en el tercer nivel español y construir una carrera que puede terminar dirigiendo un club de Champions con una organización y una marca globales.

---

## 1. Visión

El juego no trata de ser el entrenador de un club. Trata de **ser responsable de todo el club**.

El jugador puede decidir involucrarse personalmente en un área —por ejemplo, asumir también el banquillo— o profesionalizarla contratando especialistas. Cada especialista cuesta dinero, tiene calidad, personalidad y estilo, y puede producir un retorno superior o convertirse en un gasto que el club todavía no puede permitirse.

La experiencia debe permitir historias como:

- vender 100 bufandas desde un stand junto al estadio;
- equivocarse y fabricar 2.000 camisetas que no se venden;
- contratar un Chief Merchandising Officer que profesionaliza el área;
- abrir e-commerce, una tienda oficial y después distribución internacional;
- convertir 2.000 aficionados locales en cientos de miles o millones;
- ampliar un campo de 3.000 espectadores hasta un estadio grande con hospitality y restauración;
- ascender de Primera Federación a Segunda y Primera;
- pasar de negociar con jugadores semiprofesionales a competir por estrellas internacionales;
- ser despedido, mejorar como GM y recibir ofertas de clubes superiores;
- finalmente gestionar un club de Champions como una gran organización deportiva y comercial.

El juego debe sentirse como la combinación de un manager deportivo y un tycoon empresarial, con la accesibilidad y el placer de navegación de PC Fútbol, pero con profundidad contemporánea.

---

## 2. Pilares de diseño

### 2.1 El club es un ecosistema
Ningún sistema vive aislado. Un fichaje estrella puede mejorar resultados, vender camisetas, elevar asistencia, atraer sponsors y aumentar la presión salarial. Subir entradas mejora ingresos por asiento pero puede bajar asistencia y confianza de la afición.

### 2.2 Delegar es una decisión estratégica
El jugador puede hacer muchas cosas personalmente, pero no debe ser siempre óptimo. Un especialista competente aporta eficiencia, información y automatización, a cambio de salario y poder interno.

### 2.3 Progresión del GM
El avatar más importante no es un futbolista: es el propio GM. Los atributos mejoran por logros demostrables, no por gastar puntos arbitrariamente cada temporada.

### 2.4 De barrio a marca mundial
Todas las mecánicas deben funcionar a distintas escalas. El mismo sistema de merchandising debe soportar un lote de 100 bufandas y una cadena mundial de 10.000 camisetas mensuales.

### 2.5 Información densa, navegación sencilla
La profundidad vive dentro de las pantallas; la navegación principal debe ser extremadamente clara y dividir el juego en cuatro grandes cuadrantes.

---

## 3. Navegación principal

La pantalla de despacho funciona como hub de cuatro cuadrantes:

### DEPORTIVO
- resultados
- plantilla
- entrenador
- modelo de juego
- fichajes y contratos
- cantera/scouting
- competiciones

### CLUB & DIRECTIVA
- organigrama y personal
- confianza
- objetivos
- propietarios/directiva
- instalaciones no deportivas
- carrera del GM

### FINANZAS & NEGOCIO
- P&L / caja / presupuesto
- patrocinadores
- merchandising
- retail y e-commerce
- acuerdos comerciales
- derechos y premios

### MATCH DAY
- aficionados
- opiniones y sentimiento
- estadio
- entradas y abonos
- kioscos
- restaurantes
- hospitality / VIP

Cada cuadrante abre sus subpáginas, pero volver al despacho debe ser siempre inmediato.

---

## 4. Creación del GM

### 4.1 Arquetipos iniciales

**Hombre de negocios**
- fuerte: finanzas, directiva, comercial
- débil: fútbol, táctica

**Exfutbolista**
- fuerte: fútbol, táctica, afición
- débil: finanzas, comercial

**Exagente**
- fuerte: negociación de jugadores, contactos, mercado
- medio: fútbol y finanzas
- débil: táctica y gestión de afición

Después del arquetipo, el jugador recibe **5 puntos libres** para personalizar el perfil.

### 4.2 Atributos del GM
Escala 1–10:

1. Negociación financiera
2. Negociación de jugadores
3. Gestión de afición
4. Gestión de directiva
5. Conocimiento de fútbol
6. Conocimiento táctico
7. Visión comercial

A futuro pueden añadirse liderazgo, scouting, comunicación/prensa y gestión de crisis si aportan decisiones distintas.

### 4.3 Progresión por hitos
Ejemplos:

- 1 M€ de merchandising en una temporada → +1 Visión comercial
- 5 M€ de merchandising → +2 adicionales o hito superior equivalente
- fichar una estrella muy por encima del nivel habitual del club → +1 Negociación de jugadores
- 10 llenos en casa → +1 Gestión de afición
- mantener confianza de directiva ≥90 durante 8 semanas → +1 Gestión de directiva
- cerrar una temporada con rentabilidad extraordinaria → +1 Finanzas
- sobrecumplir fuertemente el objetivo liguero → +1 Conocimiento de fútbol
- dirigir personalmente al equipo con éxito sostenido → +1 Conocimiento táctico

Los hitos deben ser visibles desde la pantalla de carrera, incluyendo progreso parcial.

---

## 5. Carrera y mercado de GMs

La primera partida comienza con reputación baja. El jugador recibe ofertas únicamente de **Primera Federación**.

Las ofertas muestran:
- club
- grupo
- reputación/prestigio
- escala de afición
- capacidad de estadio
- caja inicial simulada
- salario de GM
- paciencia de la directiva
- objetivo deportivo
- objetivo comercial/financiero

A futuro:
- despidos
- dimisión
- periodos sin club
- entrevistas
- contraofertas
- interés de clubes según reputación y estilo del GM
- reputación por país
- historial de carrera
- títulos, ascensos, ingresos creados y valor de clubes gestionados

---

## 6. Entrenador y control deportivo

El GM elige entre:

### Contratar entrenador
El entrenador tiene:
- rating
- estilo de juego
- formación preferida
- intensidad de presión
- uso de jóvenes
- gestión de vestuario
- adaptabilidad
- personalidad
- salario
- reputación

La afición tiene también una identidad futbolística. Un estilo puede encajar o chocar con ella.

Ejemplo: una afición que valora presión alta y fútbol agresivo puede tolerar peor un técnico ultradefensivo aunque los resultados sean aceptables.

### Ser también entrenador
El jugador obtiene control táctico directo, pero la calidad de ejecución depende de su atributo de conocimiento táctico. Esta opción no debe ser un atajo gratuito: un GM con 2/10 de táctica debería dirigir claramente peor que un entrenador profesional de rating 75.

---

## 7. Plantilla y jugadores

POC: jugadores procedurales.

Cada jugador tiene al menos:
- nombre
- edad
- nacionalidad en versión posterior
- posición
- overall actual
- techo/potencial
- salario
- valor estimado
- duración de contrato
- moral

Versión comercial:
- atributos por posición
- personalidad
- adaptación
- lesiones
- historial estadístico
- representante
- cláusula
- primas
- rol esperado
- felicidad
- desarrollo
- cantera
- reputación
- interés de mercado

Las tablas importantes deben poder ordenarse por columnas útiles: overall, techo, edad, salario, valor, posición, etc.

---

## 8. Fichajes y negociación

El coste real de una operación combina:
- traspaso
- prima de fichaje
- salario
- primas
- comisión de agente
- duración

El atributo de Negociación de jugadores modifica:
- precio final
- voluntad del futbolista
- margen de negociación
- calidad de información

Fichar una estrella debe tener repercusiones sistémicas:
- calidad deportiva
- presión salarial
- venta de merchandising
- nuevos seguidores
- sponsor appeal
- expectativas de afición y directiva

---

## 9. Personal y estructura del club

Roles principales:
- Entrenador
- Director deportivo
- Chief Merchandising Officer
- CFO
- Jefe de scouting

Posteriormente:
- Director de cantera
- Responsable de ticketing
- Director comercial
- Director de estadio
- Responsable de hospitality
- Head of Data
- médico / rendimiento
- comunicación / prensa

Cada rol tiene:
- rating
- salario
- rasgos
- especialidad
- impacto medible

Regla de diseño: **una vacante debe ser viable en clubes pequeños**. El jugador puede hacer la función de manera básica para ahorrar. Contratar personal profesional eleva el techo de la operación.

---

## 10. Finanzas

El juego utiliza flujo de caja real, no únicamente un “presupuesto de fichajes”.

### Ingresos
- entradas
- abonos
- hospitality
- restauración
- merchandising
- patrocinios
- premios deportivos
- TV
- transferencias salientes
- acuerdos comerciales
- competiciones europeas

### Costes
- plantilla
- personal
- fichajes
- instalaciones
- fabricación de merchandising
- operaciones de estadio
- scouting
- cantera
- deuda e intereses en versión posterior

La pantalla financiera debe mostrar:
- caja
- ingresos acumulados
- costes acumulados
- resultado
- desglose por línea
- tendencia
- previsión de cierre

---

## 11. Merchandising

El merchandising es inventario real.

Productos iniciales:
- camiseta
- bufanda
- gorra

Cada producto tiene:
- coste unitario
- precio
- stock
- producción acumulada
- ventas

El jugador decide cuántas unidades fabricar.

### Riesgo
Comprar 10.000 camisetas sin demanda suficiente consume caja y genera inventario muerto.

### Canales de venta
1. stand de día de partido
2. e-commerce
3. tienda oficial
4. distribuidores internacionales

Los canales aumentan alcance y conversión pero cuestan dinero.

### Demanda
Depende de:
- fans locales
- fans nacionales
- fans globales
- resultados
- estrellas
- precio
- marca
- calidad del CMO
- canales abiertos
- calendario / grandes partidos

Esta mecánica debe escalar sin cambiar de paradigma: de 100 unidades a decenas de miles.

---

## 12. Patrocinios

Tipos:
- camiseta principal
- manga
- naming de estadio
- partner oficial
- training kit
- regional partner

Cada propuesta tiene:
- ingreso fijo
- años
- bonus
- encaje de marca
- exclusividad
- condiciones

Negociación financiera permite obtener mejores términos, pero a futuro una presión excesiva puede romper la operación.

La fuerza comercial del club depende de:
- audiencia
- división
- resultados
- estrellas
- reputación
- presencia internacional

---

## 13. Afición

Tres capas iniciales:

### Local
Compra entradas, abonos, comida y merchandising de match day.

### Nacional
Impulsa e-commerce, televisión, sponsors y relevancia mediática.

### Global
Permite escala internacional y convierte el club en una marca mundial.

Además existe:
- sentimiento 0–100
- identidad futbolística
- expectativas
- sensibilidad al precio
- relación con directiva/GM

El crecimiento nunca debe ser instantáneo. Ganar la Champions no convierte automáticamente 20.000 fans en 10 millones; el crecimiento debe acumularse a través de éxito, estrellas, presencia mediática y tiempo.

---

## 14. Match day y estadio

### Ticketing
El jugador fija precio medio y después, en versiones posteriores:
- precios por grada
- abonos
- descuentos
- dinámico/premium
- visitante

Demanda depende de:
- base local
- rival
- resultados
- precio
- capacidad
- sentimiento

### Instalaciones comerciales
- kioscos
- restaurantes
- hospitality
- VIP
- tienda

### Expansión
El estadio puede ampliarse por fases. Antes de gastar millones, el jugador debe demostrar demanda.

El objetivo de diseño es permitir una progresión visual y económica clara desde un campo pequeño hasta un estadio de 50.000+ espectadores.

---

## 15. Simulación deportiva del POC

La versión POC utiliza un motor agregado para producir resultados verosímiles basados en:
- calidad del once
- entrenador o atributo táctico del GM
- encaje de estilo
- rival
- localía
- variación aleatoria controlada

El motor completo posterior añadirá:
- formaciones
- atributos por línea
- fatiga
- lesiones
- moral
- ritmo de partido
- eventos
- sustituciones
- estadísticas
- modelos tácticos

La simulación de la liga debe mantener tabla completa del grupo, no únicamente los resultados del jugador.

---

## 16. Competiciones y base de clubes

Base inicial 2026/27:

### España
- Primera División
- Segunda División
- Primera Federación — dos grupos de 20
- Copa del Rey
- Supercopa de España

### Europa
- Champions League
- Europa League
- Conference League
- Supercopa de Europa

POC incluye los clubes reales de las tres primeras categorías españolas y un pool adicional de clubes para soportar futuros descensos/ascensos. Plantillas, personal y economía son procedurales.

A futuro el universo debe resolver ascensos, descensos, clasificación europea, copas y cambios de reputación sin scripts específicos por club.

---

## 17. Economía y escala

El balance se diseña por ratios, no por cifras rígidas.

Un club pequeño debería poder sobrevivir con:
- salarios bajos
- un sponsor relevante
- 1.000–5.000 asistentes
- operaciones comerciales manuales

Un club grande debería requerir:
- plantilla muy costosa
- estructura profesional
- ingresos de TV y competición
- sponsors múltiples
- retail global
- estadio de gran capacidad

Una línea de negocio no debe crecer únicamente porque el jugador pulsa “upgrade”; necesita mercado.

Ejemplo de escalado de merchandising:
- club pequeño: 100 camisetas × 45 €
- club medio: 2.000–5.000 unidades + e-commerce
- club de Primera: decenas de miles + tienda + distribución
- gigante europeo: millones de seguidores, múltiples mercados y escala internacional

---

## 18. UI/UX y dirección visual

Objetivo: **manager premium, no dashboard corporativo genérico**.

Dirección:
- azul marino profundo
- tonos cobre/dorado para autoridad y negocio
- verdes discretos para deporte
- superficies densas pero limpias
- crest genérico por iniciales en POC
- tipografía grande en decisiones importantes
- tablas compactas y ordenables
- tarjetas solo cuando aportan jerarquía

Responsive:
- desktop: cuadrantes 2×2
- tablet: igual cuando exista espacio
- móvil: cuadrantes apilados y tablas con scroll horizontal

Accesibilidad:
- foco visible
- contraste alto
- controles con labels
- no depender únicamente del color
- áreas táctiles grandes

---

## 19. Guardado

POC:
- autosave en localStorage
- una partida activa
- nueva partida reinicia el slot

Roadmap:
- 3 slots
- export/import JSON
- guardado cloud opcional
- Vercel + backend/DB cuando la simulación lo justifique

---

## 20. Arquitectura técnica inicial

Stack:
- Vite
- React
- JavaScript modular
- estado local React para POC
- motor de simulación separado de componentes
- datasets separados de UI

Separación clave:
- `src/data`: clubes, competiciones, nombres
- `src/game`: generación y simulación
- `src/screens`: pantallas
- `src/components`: shell y UI reutilizable

Roadmap técnico:
1. reducer/state machine central
2. save schema versionado
3. simulation worker para universos grandes
4. tests deterministas por seed
5. backend solo cuando cloud/multidispositivo sea necesario

---

## 21. Equipo virtual / subrutinas de desarrollo

### GAME DIRECTOR
Responsable de visión, prioridades, GDD, coherencia entre sistemas y aceptación de versiones.

### SYSTEMS & ECONOMY DESIGN
Responsable de fórmulas, progresión, escalado y prevención de estrategias dominantes.

### UX/UI + ART DIRECTION
Responsable del lenguaje visual, navegación en cuadrantes, legibilidad, responsive y especificaciones de assets.

### SIMULATION / DATA DESIGN
Responsable de clubes, competiciones, generación procedural, calendario, resultados y persistencia del universo.

### LEAD PROGRAMMER
Responsable de arquitectura React, implementación, estado, guardado, performance y builds.

### QA GAMEPLAY & BALANCE
Prueba casos extremos y carreras largas. Busca exploits económicos, progresión demasiado rápida/lenta y resultados deportivos absurdos.

### QA ACCESSIBILITY & UX
Comprueba navegación por teclado, contraste, scroll, móvil, ordenación, textos, botones inaccesibles y dead ends.

### RELEASE QA
Ejecuta smoke tests, build, nueva partida, guardado/carga y flujo de al menos varias semanas antes de empaquetar.

En esta conversación, el Director coordina estas disciplinas como pasadas separadas sobre cada entrega para evitar que una mejora visual rompa balance o que una mejora sistémica destruya usabilidad.

---

## 22. POC v0.1 — definición de terminado

El POC debe permitir:

- crear GM
- elegir arquetipo
- repartir 5 puntos
- recibir ofertas de Primera Federación
- aceptar un club
- navegar por cuatro cuadrantes
- ver plantilla procedural
- ordenar plantilla por atributos
- contratar entrenador o autoentrenar
- contratar personal clave
- fichar jugadores procedurales
- simular 38 jornadas
- ver tabla de 20 clubes
- fijar precio de entradas
- fabricar camisetas, bufandas y gorras
- acumular inventario
- vender automáticamente según demanda
- abrir e-commerce / tienda / distribución
- firmar y negociar sponsors
- ampliar estadio
- construir restaurantes
- ver afición local/nacional/global
- ver P&L simplificado
- ganar mejoras de atributos por hitos
- autosave local

---

## 23. Roadmap hacia nivel comercial

### v0.2 — Universo deportivo real
- ascensos/descensos
- Copa del Rey real
- Supercopa
- clasificación europea
- calendario completo multi-competición
- estadísticas de jugadores
- contratos y ventanas

### v0.3 — Club como empresa
- presupuestos departamentales
- deuda
- instalaciones por módulos
- ticketing avanzado
- abonos
- sponsors por inventario comercial
- merchandising con forecast y temporadas

### v0.4 — Personas
- staff profundo
- personalidades
- relaciones
- agentes
- scouting
- cantera
- lesiones
- felicidad

### v0.5 — Carrera viva
- despidos
- entrevistas
- mercado de GMs
- reputación
- historial
- cambios de propietario
- directivas con personalidades

### v0.6 — Simulación profunda
- motor deportivo avanzado
- tácticas
- formaciones
- estadísticas
- evolución de jugadores
- IA de fichajes y clubes

### v0.7 — Presentación comercial
- arte original
- identidad de clubes genérica/licenciada según estrategia
- audio/UI feedback
- onboarding
- tutorial contextual
- prensa/noticias

### v0.8+ — Escala, balance y polish
- carreras largas deterministas de QA
- economía por divisiones
- internacionalización
- cloud saves
- rendimiento
- accesibilidad completa

---

## 24. Riesgos principales

1. **Feature creep:** hay que mantener un núcleo jugable por versión.
2. **Economía trivial:** si todos los upgrades siempre son rentables, no existe juego empresarial.
3. **Delegación falsa:** contratar ejecutivos debe cambiar decisiones y resultados, no ser un simple +5%.
4. **Escala rota:** fórmulas que funcionan para 2.000 fans pueden explotar con 10 millones.
5. **Simulación deportiva superficial:** el negocio solo resulta satisfactorio si los resultados deportivos importan de verdad.
6. **Licencias:** una distribución comercial con nombres, escudos, jugadores o marcas reales requerirá estrategia legal/licencias. El POC usa nombres de clubes como referencia de universo y no incorpora escudos oficiales.

---

## 25. North Star

Al terminar una carrera, el jugador debería poder mirar atrás y decir:

> “Me contrataron para un club de Primera Federación con un campo pequeño, poca caja y un stand de bufandas. Quince temporadas después gestionaba una organización europea, un estadio de 50.000 personas, una marca global, una plantilla de élite y un equipo ejecutivo que yo mismo había construido.”

Si el juego produce historias así mediante sistemas y no mediante escenas prefijadas, la visión está funcionando.
