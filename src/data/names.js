export const firstNames = ['Álvaro','Iker','Mateo','Hugo','Martín','Dani','Sergio','Pablo','Raúl','Adrián','Nico','Álex','Mario','Rubén','Diego','Iván','Marcos','Jorge','Ángel','Gonzalo','Joan','Pol','Aitor','Unai','Lucas','Bruno','Gael','Thiago','Alejandro','Víctor','Óscar','Ander','David','Ismael','Tomás','Marc'];
export const lastNames = ['García','Martínez','López','Sánchez','Pérez','Gómez','Fernández','Díaz','Ruiz','Hernández','Moreno','Muñoz','Álvarez','Romero','Alonso','Gutiérrez','Navarro','Torres','Domínguez','Vázquez','Ramos','Gil','Ramírez','Serrano','Molina','Blanco','Suárez','Ortega','Delgado','Castro','Sola','Méndez','Calvo','Pascual','Prieto','Ferrer'];
export const positions = ['POR','LD','DFC','DFC','LI','MCD','MC','MC','MP','ED','EI','DC'];

export const tacticalIdentityNames = {
  expressive:'Expresivo y ofensivo',
  intense:'Intenso y vertical',
  control:'Control y cantera',
  pragmatic:'Competitivo y pragmático',
};

export const tacticalPresets = [
  { id:'possession', name:'Posesión dominante', formation:'4-3-3', transitionDA:12, transitionAD:16, freedom:15, defensiveLine:16, pressing:16, aggression:11, directness:6, tempo:12, width:14, setPieces:7, attackIntent:17 },
  { id:'vertical', name:'Vertical de alta intensidad', formation:'4-2-3-1', transitionDA:18, transitionAD:18, freedom:12, defensiveLine:14, pressing:17, aggression:15, directness:16, tempo:18, width:15, setPieces:10, attackIntent:17 },
  { id:'counter', name:'Bloque bajo y contraataque', formation:'5-3-2', transitionDA:18, transitionAD:8, freedom:7, defensiveLine:5, pressing:7, aggression:15, directness:18, tempo:14, width:9, setPieces:16, attackIntent:8 },
  { id:'press', name:'Presión y recuperación', formation:'4-4-2', transitionDA:16, transitionAD:20, freedom:10, defensiveLine:17, pressing:20, aggression:17, directness:13, tempo:17, width:13, setPieces:8, attackIntent:15 },
  { id:'fluid', name:'Ataque fluido', formation:'4-2-3-1', transitionDA:15, transitionAD:14, freedom:19, defensiveLine:13, pressing:13, aggression:10, directness:10, tempo:15, width:17, setPieces:6, attackIntent:19 },
  { id:'balanced', name:'Equilibrado', formation:'4-4-2', transitionDA:12, transitionAD:12, freedom:10, defensiveLine:11, pressing:11, aggression:11, directness:11, tempo:11, width:12, setPieces:10, attackIntent:12 },
];

export const formations = ['4-3-3','4-2-3-1','4-4-2','5-3-2','3-4-2-1','4-1-4-1'];
