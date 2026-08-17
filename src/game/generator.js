import { firstNames, lastNames, positions, tacticalPresets } from '../data/names.js';
import { hashString } from '../data/clubs.js';
import { sponsorRights } from '../data/management.js';

export function rng(seed) {
  let t = seed + 0x6D2B79F5;
  return () => {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
const pick=(arr,r)=>arr[Math.floor(r()*arr.length)];
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function playerArchetype(pos,r){
  if(pos==='POR') return pick(['Portero de reflejos','Portero líbero','Dominador aéreo'],r);
  if(pos==='DFC') return pick(['Central expeditivo','Central constructor','Central rápido'],r);
  if(['LD','LI'].includes(pos)) return pick(['Lateral profundo','Lateral equilibrado','Lateral defensivo'],r);
  if(pos==='MCD') return pick(['Ancla','Organizador retrasado','Recuperador'],r);
  if(pos==='MC') return pick(['Box to box','Organizador','Interior asociativo'],r);
  if(pos==='MP') return pick(['Mediapunta creativo','Segundo punta','Conector'],r);
  if(['ED','EI'].includes(pos)) return pick(['Extremo vertical','Extremo asociativo','Interior inverso'],r);
  return pick(['Delantero móvil','Referencia aérea','Finalizador','Delantero de presión'],r);
}

function attributesFor(pos,overall,r){
  const n=(offset=0)=>clamp(Math.round(overall+offset+(r()*14-7)),35,92);
  const base={pace:n(),technique:n(),physical:n(),aerial:n(),passing:n(),creativity:n(),workRate:n(),positioning:n(),finishing:n(),discipline:n()};
  if(pos==='POR'){base.pace=n(-12);base.technique=n(-5);base.aerial=n(7);base.positioning=n(7);base.finishing=n(-25)}
  if(pos==='DFC'){base.physical=n(5);base.aerial=n(7);base.positioning=n(5);base.creativity=n(-8);base.finishing=n(-12)}
  if(['ED','EI','LD','LI'].includes(pos)) base.pace=n(7);
  if(['MC','MP','MCD'].includes(pos)){base.passing=n(6);base.creativity=n(pos==='MP'?8:3)}
  if(pos==='DC'){base.finishing=n(8);base.aerial=n(3)}
  return base;
}

export function generatePlayers(club,count=24){
  const r=rng(hashString(`${club.name}-players-v2`));
  return Array.from({length:count},(_,i)=>{
    const pos=positions[i%positions.length];
    const base=Math.round(42+club.sporting*.36+(r()*18-9));
    const age=18+Math.floor(r()*17);
    const potentialBoost=Math.max(0,Math.round((27-age)*r()*1.35));
    const overall=clamp(base,45,88);
    return {
      id:`p-${club.id}-${i}`,name:`${pick(firstNames,r)} ${pick(lastNames,r)}`,pos,age,overall,
      potential:clamp(base+potentialBoost,48,94),
      salary:Math.round((24000+base*base*18)/1000)*1000,
      value:Math.round((90000+Math.pow(base-35,2)*950)/10000)*10000,
      morale:58+Math.floor(r()*32),fitness:72+Math.floor(r()*24),sharpness:60+Math.floor(r()*34),contract:1+Math.floor(r()*4),
      archetype:playerArchetype(pos,r),attributes:attributesFor(pos,overall,r),
      style:{directness:4+Math.floor(r()*17),pressing:4+Math.floor(r()*17),line:4+Math.floor(r()*17),freedom:4+Math.floor(r()*17)},
      academy:r()<.22,
    };
  });
}

export function generateMarket(club,count=42){
  const r=rng(hashString(`${club.name}-market-v2`));
  return Array.from({length:count},(_,i)=>{
    const overall=48+Math.floor(r()*33); const age=18+Math.floor(r()*17); const pos=pick(positions,r);
    const listed=r()>.72; const free=r()<.18;
    const value=Math.round((130000+Math.pow(overall-38,2)*1150)/50000)*50000;
    return {
      id:`m-${i}-${Math.floor(r()*1e7)}`,name:`${pick(firstNames,r)} ${pick(lastNames,r)}`,pos,age,overall,
      potential:Math.min(94,overall+Math.max(0,Math.floor((29-age)*r()))),value,
      salary:Math.round((32000+overall*overall*22)/5000)*5000,
      club:free?'Libre':`Club ${String.fromCharCode(65+(i%18))}`,
      star:overall>=club.sporting+17,listed,archetype:playerArchetype(pos,r),attributes:attributesFor(pos,overall,r),
      style:{directness:4+Math.floor(r()*17),pressing:4+Math.floor(r()*17),line:4+Math.floor(r()*17),freedom:4+Math.floor(r()*17)},
      seller:{asking:free?0:Math.round(value*(listed?.92:1.08+r()*.28)/50000)*50000,patience:2+Math.floor(r()*4),relationship:45+Math.floor(r()*36),needCash:r()>.62},
      agent:{salaryAsk:Math.round((32000+overall*overall*24)*(1+r()*.18)/5000)*5000,signingAsk:Math.round((25000+value*.05)/5000)*5000,patience:2+Math.floor(r()*4)},
    };
  });
}

const roleSpecialties={
  'Entrenador':['Táctica','Gestión de grupo','Desarrollo'],
  'Director deportivo':['Mercado','Contratos','Planificación'],
  'Preparador físico':['Resistencia','Potencia','Prevención'],
  'Segundo entrenador':['Análisis rival','Táctica','Vestuario'],
  'Fisioterapia':['Prevención','Recuperación','Carga'],
  'Chief Merchandising Officer':['Demanda','Retail','Producto'],
  'CFO':['Control de costes','Tesorería','Financiación'],
  'Jefe de scouting':['Potencial','Cobertura','Datos'],
  'Director de cantera':['Desarrollo','Captación','Metodología'],
};
export function generateStaff(club,role,count=5){
  const r=rng(hashString(`${club.name}-${role}-v2`));
  return Array.from({length:count},(_,i)=>{
    const rating=44+Math.floor(r()*45);
    const preset=role==='Entrenador'?{...pick(tacticalPresets,r)}:null;
    if(preset){Object.keys(preset).forEach(k=>{if(typeof preset[k]==='number') preset[k]=clamp(preset[k]+Math.round(r()*4-2),1,20);});}
    return {id:`s-${role}-${i}`,name:`${pick(firstNames,r)} ${pick(lastNames,r)}`,role,rating,
      salary:Math.round((22000+rating*rating*31+r()*45000)/1000)*1000,
      tactic:preset,trait:pick(['Metódico','Negociador','Innovador','Formador','Carismático','Analítico','Exigente','Pragmático'],r),
      specialty:pick(roleSpecialties[role]||['Gestión'],r),reputation:clamp(Math.round(rating*.85+r()*18),35,92),
      ego:35+Math.floor(r()*61),flexibility:25+Math.floor(r()*71),contractYears:1+Math.floor(r()*3),
    };
  });
}

const localPrefixes=['Clínica','Talleres','Construcciones','Restaurante','Seguros','Transportes','Cerámicas','Grupo','Automoción','Bodegas'];
const localSuffixes=['Norte','Central','Del Río','San Miguel','La Plaza','Iberia','Atlántico','Levante','Castilla','Costa'];
const regionalBrands=['Motor Sierra','Caja Regional','Costa Telecom','Norte Bebidas','Ruta Hotels','Atlas Construcción','Mercado Centro','Ebro Energía'];
const nationalBrands=['Nexo Bank','Brava Foods','Orbe Telecom','Aurea Logistics','Cobalto Tech','Marea Hotels','Alma Retail','Turia Mobility'];
const globalBrands=['Helix Airways','Vertex Cloud','Northstar Energy','Atlas Global Bank','NovaDrive','Apex Sportswear'];
const sponsorSectors=['Alimentación','Finanzas','Tecnología','Automoción','Telecomunicaciones','Turismo','Construcción','Energía','Retail'];
function sponsorScopeFor(club,brandScore,r){
  if(club.tier>=3){return r()<.72?'local':'regional';}
  if(club.tier===2){return r()<.25?'local':r()<.78?'regional':'national';}
  if(brandScore>=72)return r()<.18?'regional':r()<.56?'national':'global';
  return r()<.35?'regional':'national';
}
export function generateSponsorOffers(club,skill=6,brandScore=null){
  const score=brandScore??Math.round(club.prestige*.72+Math.log10(Math.max(1000,club.globalFans||1000))*5);
  const r=rng(hashString(`${club.name}-sponsors-v3-${skill}-${score}`));
  const eligible=sponsorRights.filter(x=>club.tier<=x.minTier&&score>=x.minBrand);
  const rights=[...eligible].sort(()=>r()-.5).slice(0,Math.min(12,eligible.length));
  return rights.map((right,i)=>{
    let scope=sponsorScopeFor(club,score,r);
    // Absolute gate: a Primera Federación club never receives a global corporation.
    if(club.tier>=3&&scope==='global')scope='regional';
    if(club.tier>=3&&scope==='national')scope='regional';
    const brand=scope==='local'?`${pick(localPrefixes,r)} ${pick(localSuffixes,r)}`:scope==='regional'?pick(regionalBrands,r):scope==='national'?pick(nationalBrands,r):pick(globalBrands,r);
    const mult={local:.42,regional:.78,national:1.55,global:3.2}[scope];
    const base=(club.localFans*5.2+(club.globalFans||0)*.18+club.prestige*7600+score*11000);
    const annual=Math.max(5000,Math.round((base*right.mult*mult*(.78+r()*.42))/5000)*5000);
    const sector=right.sector||pick(sponsorSectors,r);
    return {id:`sp-${right.id}-${i}-${hashString(brand)%9999}`,brand,scope,sector,slotId:right.id,type:right.name,group:right.group,annual,years:1+Math.floor(r()*4),remainingYears:1+Math.floor(r()*4),
      bonusWin:Math.round(annual*(.01+r()*.035)/1000)*1000,fit:42+Math.floor(r()*57),reputation:40+Math.floor(r()*58),
      targetAnnual:Math.round(annual*(1.04+r()*.16)/5000)*5000,patience:2+Math.floor(r()*3),negotiatedRounds:0,
      activationAsk:Math.round(annual*(.04+r()*.05)/1000)*1000,exclusivity:sector,
    };
  });
}

export function generateSuppliers(club){
  const r=rng(hashString(`${club.name}-suppliers-v4`));
  const categories=['Catering','Seguridad','Limpieza','Telecomunicaciones','Energía','Viajes','Merchandising','Ticketing','Material médico'];
  const baseByCat={Catering:1450,Seguridad:2200,Limpieza:1350,Telecomunicaciones:980,Energía:1750,Viajes:1650,Merchandising:1150,Ticketing:820,'Material médico':760};
  return Object.fromEntries(categories.map((category)=>[category,Array.from({length:4},(_,i)=>{
    const quality=42+Math.floor(r()*51);const scale=.72+i*.15+r()*.18;const weekly=Math.round((baseByCat[category]*scale+club.capacity*(category==='Seguridad'?.045:category==='Limpieza'?.022:.01)+quality*9)/1)*1;
    const setupFee=Math.round((250+r()*2100+i*450)/1)*1;const perMatch=Math.round((80+r()*620)*(category==='Seguridad'?1.4:category==='Catering'?1.2:.6));const perAttendee=Number(((category==='Catering'?.018:category==='Seguridad'?.012:category==='Limpieza'?.007:.002)+r()*.006).toFixed(3));
    return {id:`sup-${category}-${i}`,category,name:`${pick(['Grupo','Servicios','Soluciones','Red','Operaciones'],r)} ${pick(localSuffixes,r)}`,quality,weekly,setupFee,perMatch,perAttendee,
      sla:pick(['24 h','12 h','4 h','2 h'],r),bonus:pick(['Precio muy estable','Mayor calidad','Flexibilidad de volumen','Respuesta rápida','Tecnología incluida'],r),contractYears:1+Math.floor(r()*4)};
  })]));
}
