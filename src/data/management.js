export const sponsorRights = [
  {id:'shirtMain',group:'Kit',name:'Patrocinador principal de camiseta',short:'Frontal camiseta',mult:1.00,minTier:3,minBrand:18},
  {id:'shirtSleeve',group:'Kit',name:'Patrocinador de manga',short:'Manga',mult:.28,minTier:3,minBrand:22},
  {id:'shirtBack',group:'Kit',name:'Patrocinador trasero de camiseta',short:'Espalda',mult:.20,minTier:3,minBrand:18},
  {id:'shorts',group:'Kit',name:'Patrocinador de pantalón',short:'Pantalón',mult:.14,minTier:3,minBrand:18},
  {id:'trainingKit',group:'Kit',name:'Training partner',short:'Ropa entrenamiento',mult:.31,minTier:3,minBrand:25},
  {id:'stadiumNaming',group:'Naming rights',name:'Naming rights del estadio',short:'Nombre estadio',mult:.68,minTier:3,minBrand:38},
  {id:'trainingNaming',group:'Naming rights',name:'Naming rights ciudad deportiva',short:'Nombre centro entrenamiento',mult:.19,minTier:3,minBrand:40},
  {id:'autoPartner',group:'Partners',name:'Automóvil oficial',short:'Automoción',mult:.20,minTier:3,minBrand:28,sector:'Automoción'},
  {id:'bankPartner',group:'Partners',name:'Banco oficial',short:'Banca',mult:.22,minTier:3,minBrand:30,sector:'Finanzas'},
  {id:'telecomPartner',group:'Partners',name:'Telecom oficial',short:'Telecom',mult:.18,minTier:3,minBrand:27,sector:'Telecomunicaciones'},
  {id:'beveragePartner',group:'Partners',name:'Bebida oficial',short:'Bebidas',mult:.16,minTier:3,minBrand:25,sector:'Alimentación'},
  {id:'travelPartner',group:'Partners',name:'Travel partner',short:'Viajes',mult:.12,minTier:3,minBrand:22,sector:'Turismo'},
  {id:'localPartner1',group:'Local',name:'Partner local A',short:'Partner local',mult:.075,minTier:3,minBrand:10},
  {id:'localPartner2',group:'Local',name:'Partner local B',short:'Partner local',mult:.065,minTier:3,minBrand:10},
  {id:'localPartner3',group:'Local',name:'Partner local C',short:'Partner local',mult:.055,minTier:3,minBrand:10},
];

const L=(name,cost,weeks,description,effects={},upkeep=0,requires=null)=>({name,cost,weeks,description,effects,upkeep,requires});

export const facilityGroups = {
  stadium:{name:'Estadio',description:'El recinto de partido: capacidad, experiencia, ticketing, hospitality y explotación comercial.'},
  club:{name:'Instalaciones del club',description:'Oficinas, medicina, medios, datos y estructura operativa fuera del terreno de juego.'},
  sport:{name:'Ciudad deportiva',description:'Campos, gimnasio, recuperación, análisis y academia. Convierte inversión en rendimiento y talento.'},
};

export const facilityDefs = {
  stadium:{
    scoreboard:{name:'Videomarcadores',icon:'SCREEN',category:'Tecnología',levels:[
      L('Marcador electrónico básico',0,0,'Un marcador LED sencillo en un lateral. Resultado, tiempo y mensajes básicos.',{fan:0,media:0}),
      L('Pantalla LED a color',90000,3,'Pantalla a color de 6×3 m en el fondo principal. Marcadores, anuncios y gráficos.',{fan:2,sponsor:1},1500),
      L('Pantalla HD con repeticiones',280000,5,'Pantalla HD de 10×6 m con realización básica y repetición de jugadas.',{fan:4,sponsor:2,media:2,ticketWtp:1.5},4200),
      L('Segunda pantalla HD',520000,6,'Una segunda pantalla en el fondo opuesto para eliminar zonas ciegas.',{fan:6,sponsor:3,media:3,ticketWtp:2.5},7300),
      L('Sistema 4K + cinta LED',1650000,10,'Dos videomarcadores 4K y cinta LED perimetral sincronizada para contenido y patrocinio.',{fan:9,sponsor:7,media:7,ticketWtp:4},19000),
      L('Anillo de vídeo 360°',7200000,18,'Anillo 360° de vídeo de nivel elite. Replays, estadísticas, activaciones y espectáculo audiovisual.',{fan:15,sponsor:14,media:12,ticketWtp:7},65000,{minCapacity:25000}),
    ]},
    access:{name:'Accesos y ticketing físico',icon:'GATE',category:'Operaciones',levels:[
      L('Control manual',0,0,'Personal comprueba entradas en puertas sencillas. Barato, lento y suficiente para campos pequeños.',{fan:0,attendanceCap:0}),
      L('Lectores de código de barras',115000,3,'Lectores digitales portátiles y control de fraude básico.',{fan:2,attendanceCap:3},1200),
      L('Tornos electrónicos',360000,5,'Tornos fijos con ticket digital y contadores de aforo en tiempo real.',{fan:4,attendanceCap:7},3500),
      L('Acceso NFC / móvil',880000,7,'Acceso contactless, integración con app y gestión dinámica de puertas.',{fan:7,attendanceCap:11,data:3},8500),
      L('Accesos inteligentes de alta capacidad',2200000,10,'Red redundante de accesos, redistribución de colas y control centralizado.',{fan:10,attendanceCap:16,data:6,ticketWtp:2},21000),
    ]},
    toilets:{name:'Baños y servicios',icon:'WC',category:'Experiencia',levels:[
      L('Servicios básicos',0,0,'Bloques funcionales, con colas importantes en el descanso.',{fan:0}),
      L('Reforma de bloques existentes',75000,3,'Mejor limpieza, iluminación, lavabos y mantenimiento.',{fan:2},1100),
      L('Nuevos bloques en ambos fondos',230000,5,'Más capacidad y menores colas en los picos de descanso.',{fan:5,ticketWtp:1},2800),
      L('Servicios familiares y accesibles',390000,5,'Nuevas instalaciones accesibles, familiares y de cambio infantil.',{fan:7,ticketWtp:1.5},4300),
      L('Red sanitaria premium',900000,7,'Instalaciones renovadas en todo el estadio, gestión de colas y consumo eficiente.',{fan:10,ticketWtp:2.5},9000),
    ]},
    seating:{name:'Asientos y gradas',icon:'SEAT',category:'Bowl',levels:[
      L('Asiento básico',0,0,'Gradas sencillas con asiento plástico estándar y zonas antiguas.',{fan:0,ticketWtp:0}),
      L('Renovar grada principal',180000,4,'Asientos nuevos, numeración y mejor señalización en la lateral principal.',{fan:3,ticketWtp:1},2000),
      L('Asiento individual en todo el estadio',620000,7,'Renovación integral con asiento individual y mejores pasillos.',{fan:6,ticketWtp:2.5},6500),
      L('Confort mejorado',1400000,9,'Más espacio entre filas, mejores respaldos y sectores premium acolchados.',{fan:9,ticketWtp:4},15000),
      L('Bowl premium',4200000,15,'Renovación del bowl con visibilidad optimizada, cubierta parcial y confort de gran estadio.',{fan:14,ticketWtp:7},42000,{minCapacity:12000}),
    ]},
    capacity:{name:'Aforo',icon:'BOWL',category:'Bowl',levels:[
      L('Aforo actual',0,0,'La capacidad existente del campo.',{}),
      L('Grada modular +750',380000,7,'Estructura modular para añadir unas 750 plazas sin reconstrucción completa.',{capacity:750},5000),
      L('Ampliación de fondo +2.000',1250000,12,'Nuevo anillo parcial detrás de una portería.',{capacity:2000},13000),
      L('Nueva lateral +5.000',5200000,20,'Nueva grada lateral permanente con servicios interiores.',{capacity:5000,commercialSlots:2},48000,{minCapacity:5000}),
      L('Segundo anillo +10.000',18000000,30,'Transformación estructural para competir como gran recinto nacional.',{capacity:10000,commercialSlots:4},125000,{minCapacity:15000}),
    ]},
    vip:{name:'VIP y hospitality',icon:'VIP',category:'Hospitality',levels:[
      L('Palco institucional',0,0,'Un pequeño palco para directiva, autoridades e invitados.',{vipSeats:20,hospitality:0}),
      L('Sala hospitality básica',140000,4,'Sala interior para 60 invitados con catering sencillo.',{vipSeats:60,hospitality:3,ticketWtp:1},2600),
      L('Lounge corporativo',450000,6,'Lounge para empresas con acceso independiente y restauración.',{vipSeats:140,hospitality:7,ticketWtp:2},7000),
      L('Palcos privados',1250000,10,'Batería de palcos cerrados con contratos anuales.',{vipSeats:280,hospitality:13,sponsor:3,ticketWtp:3},18000),
      L('Hospitality club premium',3900000,14,'Suites, lounges, restauración de alto nivel y experiencia corporativa integral.',{vipSeats:650,hospitality:22,sponsor:7,ticketWtp:5},52000,{minCapacity:12000}),
    ]},
    fnb:{name:'Comida y bebida',icon:'FNB',category:'Comercial',levels:[
      L('Carritos de partido',0,0,'Puestos móviles y oferta muy limitada.',{fnb:1}),
      L('Kioscos fijos',65000,3,'Dos kioscos permanentes con cerveza/refrescos y comida rápida.',{fnb:4,fan:1},1800),
      L('Red de concesiones',240000,5,'Puntos de venta distribuidos por las gradas y mejor flujo de servicio.',{fnb:8,fan:3},5500),
      L('Restaurante del estadio',680000,8,'Restaurante con funcionamiento también fuera de los partidos.',{fnb:13,fan:5,nonMatch:4},14000),
      L('Distrito gastronómico',2300000,13,'Varios conceptos de restauración y terraza exterior con operación semanal.',{fnb:22,fan:8,nonMatch:12,ticketWtp:2},40000,{minCapacity:10000}),
    ]},
    commercialSpaces:{name:'Locales comerciales',icon:'UNIT',category:'Comercial',levels:[
      L('Un hueco exterior',0,0,'Un único espacio sencillo junto al acceso principal que puede albergar un kiosco o pequeño comercio.',{commercialSlots:1,nonMatch:0}),
      L('Tres locales bajo tribuna',180000,5,'Dos locales adicionales con acometidas y persianas comerciales.',{commercialSlots:2,nonMatch:2},2500),
      L('Galería de seis locales',620000,8,'Nueva galería interior con mezcla de restauración, retail y arrendamiento.',{commercialSlots:3,nonMatch:5,fan:2},8500),
      L('Paseo comercial del estadio',2100000,13,'Diez espacios conectados al exterior para operar también entre semana.',{commercialSlots:4,nonMatch:12,fan:4},28000,{minCapacity:9000}),
      L('Distrito comercial',7600000,22,'Gran desarrollo de ocio y comercio alrededor del estadio con operación diaria.',{commercialSlots:8,nonMatch:28,fan:7,sponsor:6},95000,{minCapacity:22000}),
    ]},
    retail:{name:'Tiendas y retail',icon:'SHOP',category:'Comercial',levels:[
      L('Mesa de merchandising',0,0,'Una mesa/stand en la entrada. Ideal para lotes pequeños y venta directa.',{retail:1}),
      L('Pequeña tienda en el estadio',50000,3,'Local de unos 25 m² con stock básico y cobro electrónico.',{retail:4,fan:1},1200),
      L('Tienda oficial grande',250000,6,'Tienda de unos 150 m², escaparate, personal fijo y surtido amplio.',{retail:9,fan:3},6000),
      L('Segunda tienda + corner museo',620000,7,'Segundo punto de venta y espacio de producto histórico/coleccionable.',{retail:14,fan:5,nonMatch:3},13000),
      L('Galería comercial del club',1900000,12,'Varios locales propios y alquilados conectados al estadio.',{retail:22,fan:7,nonMatch:10,commercialSlots:3},36000,{minCapacity:9000}),
      L('Centro comercial del estadio',7800000,22,'Un destino comercial con gran tienda, restauración y locales arrendados.',{retail:35,fan:11,nonMatch:25,commercialSlots:7,ticketWtp:3},110000,{minCapacity:22000}),
    ]},
    wifi:{name:'Conectividad del aficionado',icon:'WIFI',category:'Tecnología',levels:[
      L('Cobertura móvil irregular',0,0,'Sin red propia para espectadores.',{fan:0,media:0}),
      L('Wi‑Fi en tribuna principal',85000,3,'Cobertura en la grada principal y zonas internas.',{fan:2,media:1,data:1},1200),
      L('Wi‑Fi estadio completo',310000,5,'Cobertura para todo el bowl y mejores puntos de venta conectados.',{fan:5,media:3,data:4},4200),
      L('Red de alta densidad',980000,8,'Red preparada para miles de conexiones, app, pedidos y activaciones.',{fan:8,media:6,data:8,sponsor:3,ticketWtp:1.5},12000),
      L('Estadio conectado',2500000,12,'Plataforma integral de conectividad, analítica y servicios digitales de asiento.',{fan:12,media:10,data:13,sponsor:6,ticketWtp:3},30000),
    ]},
    pitch:{name:'Césped y drenaje',icon:'PITCH',category:'Deportivo',levels:[
      L('Césped natural básico',0,0,'Mantenimiento convencional y vulnerabilidad al clima.',{performance:0}),
      L('Drenaje reforzado',160000,4,'Mejor drenaje y menor degradación por lluvia.',{performance:1,injury:-1},3000),
      L('Sistema profesional de mantenimiento',420000,6,'Riego, maquinaria y control agronómico profesional.',{performance:2,injury:-2},8000),
      L('Césped híbrido',1100000,8,'Superficie híbrida de alta consistencia y uso intensivo.',{performance:4,injury:-3,media:1},18000),
      L('Sistema elite de superficie',2600000,10,'Césped híbrido, calefacción/ventilación según clima y monitorización avanzada.',{performance:6,injury:-5,media:2},40000,{minCapacity:15000}),
    ]},
    lighting:{name:'Iluminación',icon:'LIGHT',category:'Tecnología',levels:[
      L('Torres básicas',0,0,'Iluminación válida para la categoría actual, con capacidad audiovisual limitada.',{media:0}),
      L('LED eficiente',220000,5,'Mejor uniformidad, menor consumo y retransmisión más limpia.',{media:3,fan:1},-1000),
      L('Broadcast profesional',650000,7,'Iluminación preparada para producción televisiva de mayor nivel.',{media:7,sponsor:2,fan:2},5500),
      L('Iluminación dinámica',1400000,9,'Control de escenas, shows de entrada y mayor calidad de cámara.',{media:10,sponsor:4,fan:6,ticketWtp:1},14000),
      L('Broadcast elite',3200000,12,'Nivel elite para grandes retransmisiones y producción 4K/HDR.',{media:14,sponsor:7,fan:8},30000,{minCapacity:15000}),
    ]},
  },
  club:{
    offices:{name:'Oficinas y sede',icon:'HQ',category:'Administración',levels:[
      L('Oficina compacta',0,0,'Dirección, administración y operaciones comparten una sede pequeña.',{admin:0}),
      L('Sede profesional',120000,4,'Despachos separados y salas de reunión.',{admin:3,staffAttraction:1},2500),
      L('Centro corporativo',480000,7,'Áreas de finanzas, comercial y operaciones con sistemas comunes.',{admin:7,staffAttraction:3,sponsor:2},8000),
      L('Campus corporativo',1500000,10,'Sede de nivel Primera/Europa con espacios para partners y eventos.',{admin:12,staffAttraction:7,sponsor:5},22000),
    ]},
    medical:{name:'Centro médico',icon:'MED',category:'Rendimiento',levels:[
      L('Sala médica básica',0,0,'Consulta, camilla y recuperación elemental.',{medical:0,injury:0}),
      L('Clínica de club',180000,5,'Diagnóstico y tratamiento diario dentro del club.',{medical:4,injury:-2},5000),
      L('Centro de recuperación',620000,8,'Fisioterapia, hidroterapia y control de cargas.',{medical:9,injury:-5,recovery:3},15000),
      L('Centro de alto rendimiento médico',1900000,12,'Laboratorio, rehabilitación avanzada y diagnóstico especializado.',{medical:15,injury:-8,recovery:6,staffAttraction:4},42000),
      L('Instituto médico elite',5600000,18,'Capacidad de referencia con tecnología diagnóstica avanzada y especialistas propios.',{medical:20,injury:-11,recovery:9,staffAttraction:8},115000),
    ]},
    mediaCenter:{name:'Media center',icon:'MEDIA',category:'Comercial',levels:[
      L('Sala de prensa',0,0,'Ruedas de prensa y contenido básico.',{media:0}),
      L('Estudio de contenido',95000,4,'Pequeño plató para entrevistas, fotografía y redes.',{media:4,digital:3,sponsor:1},2200),
      L('Media center profesional',340000,6,'Estudio, edición, podcast y producción diaria.',{media:8,digital:8,sponsor:3},7500),
      L('Broadcast & content hub',1150000,10,'Producción multicámara, streaming y espacios comerciales de marca.',{media:14,digital:15,sponsor:7},22000),
      L('Plataforma de medios global',3900000,14,'Producción internacional, estudios propios y monetización multicanal.',{media:20,digital:24,sponsor:12},68000,{minBrand:65}),
    ]},
    dataCenter:{name:'Datos y análisis',icon:'DATA',category:'Deportivo',levels:[
      L('Hojas de cálculo y vídeo',0,0,'Análisis básico realizado por el staff existente.',{analysis:0,scouting:0}),
      L('Sala de análisis',85000,3,'Vídeo, tagging y almacenamiento estructurado.',{analysis:3,scouting:1},1800),
      L('Departamento de datos',300000,6,'Modelos propios de rendimiento y recruitment.',{analysis:7,scouting:5},7000),
      L('Football intelligence center',980000,9,'Integración de tracking, scouting, salud y planificación.',{analysis:13,scouting:10,performance:2},20000),
      L('Plataforma de inteligencia elite',3100000,14,'Infraestructura de datos de referencia y equipo multidisciplinar.',{analysis:20,scouting:17,performance:4},60000,{minBrand:55}),
    ]},
    commercialOffice:{name:'Departamento comercial',icon:'BIZ',category:'Comercial',levels:[
      L('El GM vende',0,0,'El propio Director General y administración gestionan partners y ventas.',{commercial:0}),
      L('Ejecutivo comercial',70000,3,'Primer profesional dedicado a activación y captación.',{commercial:3,sponsor:2},2500),
      L('Equipo comercial',260000,6,'Ventas B2B, partnerships y CRM comercial.',{commercial:8,sponsor:5},9000),
      L('Dirección comercial completa',900000,9,'Equipos separados de partnerships, retail y hospitality.',{commercial:14,sponsor:10,staffAttraction:2},28000),
      L('Organización comercial internacional',3000000,14,'Ventas globales, oficinas regionales y account management avanzado.',{commercial:22,sponsor:18},85000,{minBrand:62}),
    ]},
    warehouse:{name:'Logística y almacén',icon:'BOX',category:'Operaciones',levels:[
      L('Trastero de estadio',0,0,'Stock reducido y manejo manual.',{inventoryCap:800}),
      L('Almacén local',50000,3,'Espacio dedicado con control básico de inventario.',{inventoryCap:4000,retail:1},1300),
      L('Centro logístico',210000,5,'Picking, recepción de mercancía y stock suficiente para e-commerce regional.',{inventoryCap:18000,retail:3},5500),
      L('Fulfilment profesional',760000,8,'Procesos automatizados y capacidad nacional.',{inventoryCap:75000,retail:7},17000),
      L('Hub internacional',2400000,12,'Distribución internacional, devoluciones y múltiples líneas de producto.',{inventoryCap:250000,retail:13},52000,{minBrand:55}),
    ]},
  },
  sport:{
    trainingPitches:{name:'Campos de entrenamiento',icon:'FIELD',category:'Entrenamiento',levels:[
      L('Un campo compartido',0,0,'Instalación funcional con poca flexibilidad de sesiones.',{training:0}),
      L('Segundo campo',160000,5,'Permite separar titulares, suplentes y recuperación.',{training:3},3500),
      L('Dos campos profesionales',520000,7,'Superficies mejoradas y planificación simultánea.',{training:7,performance:1},9000),
      L('Complejo de cuatro campos',1800000,12,'Múltiples superficies, porteros y trabajo específico.',{training:13,performance:3,staffAttraction:3},30000),
      L('Campus elite',5800000,18,'Complejo integral de entrenamiento de máximo nivel.',{training:20,performance:6,staffAttraction:8},95000,{minBrand:55}),
    ]},
    gym:{name:'Gimnasio y fuerza',icon:'GYM',category:'Rendimiento',levels:[
      L('Gimnasio básico',0,0,'Pesas y equipamiento funcional.',{fitness:0}),
      L('Sala de fuerza profesional',110000,4,'Equipamiento moderno y zonas de potencia.',{fitness:4,performance:1},3000),
      L('Performance gym',380000,6,'Fuerza, velocidad, test y monitorización.',{fitness:9,performance:2},9000),
      L('Centro de fuerza elite',1250000,10,'Biomecánica, plataformas y trabajo individualizado.',{fitness:15,performance:4,staffAttraction:3},27000),
    ]},
    recovery:{name:'Recuperación',icon:'REC',category:'Rendimiento',levels:[
      L('Recuperación manual',0,0,'Masaje, hielo y trabajo básico.',{recovery:0}),
      L('Zona de recuperación',90000,4,'Baños, movilidad y recuperación postpartido.',{recovery:3,injury:-1},2200),
      L('Hidroterapia',330000,6,'Piscinas frío/calor y protocolos personalizados.',{recovery:7,injury:-3},8000),
      L('Recovery lab',1050000,9,'Sueño, nutrición, recuperación y monitorización integrada.',{recovery:13,injury:-5,performance:2},24000),
    ]},
    analysisRoom:{name:'Sala táctica y vídeo',icon:'TACT',category:'Entrenamiento',levels:[
      L('Pizarra y proyector',0,0,'Reuniones tácticas sencillas.',{analysis:0}),
      L('Sala de vídeo',60000,3,'Vídeo rival y sesiones de grupo.',{analysis:3,tactical:1},1400),
      L('Auditorio táctico',220000,5,'Pantallas múltiples, análisis por unidades y trabajo interactivo.',{analysis:7,tactical:3},5200),
      L('Tactical lab',720000,8,'Simulación, datos y preparación individualizada.',{analysis:13,tactical:6,performance:2},15000),
    ]},
    academyGround:{name:'Instalaciones de cantera',icon:'ACA',category:'Cantera',levels:[
      L('Cantera municipal',0,0,'Los juveniles comparten instalaciones y horarios.',{youth:0}),
      L('Campo dedicado de cantera',130000,5,'Primer espacio propio para categorías inferiores.',{youth:4},3000),
      L('Academia de dos campos',480000,8,'Entrenamiento estable, gimnasio básico y mejor metodología.',{youth:9,potential:2},10000),
      L('Centro de formación',1550000,12,'Varios equipos, análisis, captación y personal especializado.',{youth:15,potential:5,staffAttraction:2},32000),
      L('Academia de referencia',5200000,18,'Campus completo capaz de atraer talento nacional.',{youth:22,potential:9,staffAttraction:7},90000,{minBrand:48}),
    ]},
    academyResidence:{name:'Residencia de cantera',icon:'HOME',category:'Cantera',levels:[
      L('Sin residencia',0,0,'La captación está limitada a jugadores que pueden vivir cerca.',{recruitRadius:0}),
      L('Alojamiento concertado',85000,4,'Acuerdos con residencias para un grupo reducido.',{recruitRadius:3,youth:1},2500),
      L('Residencia propia',520000,8,'Alojamiento, comedor y tutorización para jóvenes.',{recruitRadius:8,youth:4,potential:2},13000),
      L('Campus residencial y educativo',1750000,12,'Residencia, aulas, tutores y servicios integrales.',{recruitRadius:15,youth:8,potential:4},38000),
    ]},
  },
};

export function getLevelDef(group,id,level){return facilityDefs[group]?.[id]?.levels?.[level]||null;}
export function getNextLevelDef(game,group,id){const level=game.infrastructure?.levels?.[group]?.[id]||0;return getLevelDef(group,id,level+1);}
export function maxLevel(group,id){return Math.max(0,(facilityDefs[group]?.[id]?.levels?.length||1)-1);}

export const merchChannelDefs={
  matchday:{name:'Venta en día de partido',levels:[
    {name:'Mesa junto a la entrada',cost:0,capacity:120,mult:1,description:'Venta manual y surtido pequeño.'},
    {name:'Kiosco móvil de merchandising',cost:18000,capacity:350,mult:1.08,description:'Puesto visible, TPV y mayor variedad.'},
    {name:'Tres puntos de venta',cost:70000,capacity:900,mult:1.16,description:'Cobertura de varios accesos del estadio.'},
  ]},
  ecommerce:{name:'E-commerce',levels:[
    {name:'Sin tienda online',cost:0,capacity:0,mult:0,description:'No existe canal digital propio.'},
    {name:'Tienda online básica',cost:45000,capacity:300,mult:.92,description:'Venta nacional con procesos manuales.'},
    {name:'E-commerce integrado',cost:180000,capacity:1600,mult:1.05,description:'CRM, stock sincronizado y campañas.'},
    {name:'E-commerce internacional',cost:650000,capacity:8000,mult:1.16,description:'Idiomas, divisas y logística internacional.'},
  ]},
  distributors:{name:'Distribución externa',levels:[
    {name:'Sin distribución',cost:0,capacity:0,mult:0,description:'Solo canales propios.'},
    {name:'Tiendas deportivas locales',cost:30000,capacity:450,mult:.78,description:'Margen menor, mayor alcance local.'},
    {name:'Cadena regional',cost:140000,capacity:2200,mult:.74,description:'Distribución en la región.'},
    {name:'Distribución nacional',cost:520000,capacity:9000,mult:.69,description:'Presencia en cadenas nacionales.'},
    {name:'Licencia internacional',cost:1800000,capacity:40000,mult:.62,description:'Gran alcance; royalties/margen unitario inferior.'},
  ]},
};

export const coachInterventions={
  attack:{label:'Quiero un equipo más ofensivo',detail:'Pide subir la vocación ofensiva y adelantar riesgos.',patch:{attackIntent:2,defensiveLine:1}},
  press:{label:'Quiero más presión',detail:'Pide aumentar presión y transición tras pérdida.',patch:{pressing:2,transitionAD:2}},
  calm:{label:'Bajemos la intensidad',detail:'Reduce presión/agresividad para proteger físicamente la plantilla.',patch:{pressing:-2,aggression:-2,transitionAD:-1}},
  freedom:{label:'Demos más libertad',detail:'Pide más libertad posicional y creatividad.',patch:{freedom:2,directness:-1}},
  direct:{label:'Seamos más verticales',detail:'Pide transiciones rápidas y juego más directo.',patch:{directness:2,transitionDA:2,tempo:1}},
  youth:{label:'Quiero más minutos para jóvenes',detail:'No cambia la pizarra: crea una directriz de selección de cantera.',directive:'youth'},
  intenseTraining:{label:'Subamos la carga de entrenamiento',detail:'Más sharpness y desarrollo; peor frescura y más riesgo físico.',training:'high'},
  lightTraining:{label:'Reducir carga de entrenamiento',detail:'Protege físico y recuperación; puede perderse ritmo competitivo.',training:'light'},
};
