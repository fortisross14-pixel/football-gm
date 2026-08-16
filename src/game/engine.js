import { primeraFederacionClubs, hashString } from '../data/clubs.js';
import { tacticalPresets, tacticalIdentityNames } from '../data/names.js';
import { generateMarket, generatePlayers, generateSponsorOffers, generateStaff, generateSuppliers, rng } from './generator.js';

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const MAX_GM_STAT=20;
export const archetypes={
  business:{name:'Hombre de negocios',blurb:'Capital, estructura y crecimiento comercial. Menos instinto de vestuario, más capacidad para construir una empresa.',stats:{finance:10,players:5,fans:6,board:8,football:4,tactics:3,commercial:10}},
  player:{name:'Exfutbolista',blurb:'Credibilidad deportiva, lectura del juego y vestuario. Tendrás que aprender a dominar el negocio.',stats:{finance:4,players:6,fans:8,board:6,football:10,tactics:9,commercial:4}},
  agent:{name:'Exagente',blurb:'Mercado, relaciones y contratos. Detectas oportunidades y sabes hasta dónde tensar una negociación.',stats:{finance:7,players:10,fans:5,board:7,football:7,tactics:5,commercial:7}},
};
export const statLabels={finance:'Negociación financiera',players:'Negociación de jugadores',fans:'Gestión de afición',board:'Gestión de directiva',football:'Conocimiento de fútbol',tactics:'Conocimiento táctico',commercial:'Gestión comercial'};
const statLabelsShort={finance:'finanzas',players:'negociación de jugadores',fans:'afición',board:'directiva',football:'fútbol',tactics:'táctica',commercial:'comercial'};

export function money(v){
  if(Math.abs(v)>=1000000)return `${(v/1000000).toFixed(Math.abs(v)>=10000000?1:2)} M€`;
  if(Math.abs(v)>=1000)return `${Math.round(v/1000)} k€`;
  return `${Math.round(v)} €`;
}

function matchSchedule(club){
  const peers=primeraFederacionClubs.filter(c=>c.group===club.group&&c.id!==club.id); const r=rng(hashString(`${club.name}-schedule-v2`));
  const shuffled=[...peers].sort(()=>r()-.5);
  const first=shuffled.map((opp,i)=>({round:i+1,opponentId:opp.id,opponent:opp.name,home:i%2===0}));
  const second=shuffled.map((opp,i)=>({round:i+20,opponentId:opp.id,opponent:opp.name,home:i%2!==0}));
  return [...first,...second];
}
function seedTable(club){return primeraFederacionClubs.filter(c=>c.group===club.group).map(c=>({id:c.id,name:c.name,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0,strength:c.sporting}));}

function clubIdentity(club){
  const ids=['expressive','intense','control','pragmatic']; const id=ids[hashString(club.name+'culture')%ids.length];
  const vectors={
    expressive:{attack:18,freedom:18,intensity:12,youth:11,stars:13},
    intense:{attack:16,freedom:10,intensity:19,youth:12,stars:10},
    control:{attack:14,freedom:14,intensity:13,youth:18,stars:10},
    pragmatic:{attack:10,freedom:8,intensity:15,youth:9,stars:14},
  };
  return {id,name:tacticalIdentityNames[id],...vectors[id]};
}

export function getJobOffers(gmStats,archetypeId){
  const r=rng(260816+Object.values(gmStats).reduce((a,b)=>a+b,0)+hashString(archetypeId));
  return primeraFederacionClubs.filter(c=>c.prestige<67||gmStats.board>=9).sort(()=>r()-.5).slice(0,6).map((c,i)=>({...c,
    salary:Math.round((54000+c.prestige*2400+i*3000)/1000)*1000,
    expectation:c.sporting>63?'Pelear por el playoff':c.sporting>51?'Top 10 y profesionalizar el club':'Estabilidad deportiva y caja sostenible',
    patience:45+(hashString(c.name+'patience')%45),
  }));
}

function defaultGMtactic(){return {...tacticalPresets.find(x=>x.id==='balanced')};}
const staffRoles=[
  ['coach','Entrenador'],['sportingDirector','Director deportivo'],['fitnessCoach','Preparador físico'],['assistantCoach','Segundo entrenador'],['physio','Fisioterapia'],
  ['cmo','Chief Merchandising Officer'],['cfo','CFO'],['scout','Jefe de scouting'],['academyDirector','Director de cantera'],
];

export function createGame(club,gm){
  const players=generatePlayers(club); const coaches=generateStaff(club,'Entrenador',6); const currentCoach=coaches[0];
  const candidates=Object.fromEntries(staffRoles.filter(([k])=>k!=='coach').map(([,role])=>[role,generateStaff(club,role,5)]));
  const fanCulture=clubIdentity(club);
  return {
    version:2,club:{...club},gm:{...gm,reputation:34,level:1,xp:0,unspent:0},week:1,season:1,dateLabel:'Agosto · Semana 1',cash:club.cash,
    boardConfidence:68,fanSentiment:64,localFans:club.localFans,globalFans:club.globalFans,nationalFans:Math.round(club.localFans*.55),fanCulture,
    stadium:{capacity:club.capacity,condition:72,vipSeats:Math.round(club.capacity*.025),training:1,access:'Manual',accessRating:32,gates:Math.max(2,Math.round(club.capacity/3500)),concourse:1,transport:42,commercialSlots:3,units:[{slot:0,type:'kiosk',name:'Kiosco local'}]},
    ticket:{price:club.tier===3?18:28,seasonTickets:Math.min(Math.round(club.localFans*.12),Math.round(club.capacity*.55))},players,market:generateMarket(club),
    staff:{coach:currentCoach,sportingDirector:null,fitnessCoach:null,assistantCoach:null,physio:null,cmo:null,cfo:null,scout:null,academyDirector:null},
    coachCandidates:coaches.slice(1),staffCandidates:candidates,controlMode:'coach',gmTactic:defaultGMtactic(),coachTrust:70,
    sponsors:[],sponsorOffers:generateSponsorOffers(club,gm.stats.finance),suppliers:{},supplierOffers:generateSuppliers(club),
    merch:{inventory:{shirt:0,scarf:0,cap:0},prices:{shirt:45,scarf:18,cap:22},produced:{shirt:0,scarf:0,cap:0},revenueSeason:0,channels:{matchday:true,ecommerce:false,clubShop:false,distributors:false}},
    finance:{revenue:0,costs:0,ticket:0,merch:0,sponsor:0,broadcast:0,hospitality:0,wages:0,facilities:0,suppliers:0,transfersIn:0,transfersOut:0,weekly:[]},
    schedule:matchSchedule(club),lastMatch:null,table:seedTable(club),
    objectives:[{id:'league',label:club.sporting>60?'Terminar Top 6':'Terminar en la mitad superior',target:club.sporting>60?6:10},{id:'cash',label:'Cerrar la temporada con caja positiva'},{id:'fans',label:'Aumentar la afición local un 8%'}],
    achievements:{merch1:false,merch5:false,star:false,sellouts:0,selloutSkill:false,boardEliteWeeks:0,boardSkill:false,tacticsSkill:false,staffEdge:false},
    history:[],news:[{week:1,title:`${club.name} presenta a su nuevo Director General`,tone:'info'},{week:1,title:`La grada se identifica con un fútbol ${fanCulture.name.toLowerCase()}`,tone:'neutral'}],
  };
}

export function getActiveTactic(game){return game.controlMode==='self'?game.gmTactic:(game.staff.coach?.tactic||game.gmTactic);}
export function setTactic(game,patch){if(game.controlMode!=='self')return game;return {...game,gmTactic:{...game.gmTactic,...patch}};}
export function applyTacticalPreset(game,id){const p=tacticalPresets.find(x=>x.id===id);return p?setTactic(game,{...p}):game;}

function closeness(a,b){return Math.max(0,20-Math.abs(a-b))/20;}
export function getFanTacticalSatisfaction(game){
  const t=getActiveTactic(game),f=game.fanCulture;
  const intensity=(t.pressing+t.aggression+t.transitionAD)/3;
  const academyShare=game.players.filter(p=>p.academy).length/Math.max(1,game.players.length)*20;
  const score=(closeness(t.attackIntent,f.attack)*.31+closeness(t.freedom,f.freedom)*.22+closeness(intensity,f.intensity)*.24+closeness(academyShare,f.youth)*.10+closeness(20-t.setPieces*.35,f.stars)*.03)*100;
  return clamp(Math.round(score),18,98);
}

export function playerTacticalFit(player,tactic){
  const s=player.style||{directness:10,pressing:10,line:10,freedom:10};
  const lineWeight=['DFC','LD','LI'].includes(player.pos)?.3:.12; const pressWeight=['POR'].includes(player.pos)?.08:.25;
  const score=closeness(s.directness,tactic.directness)*.25+closeness(s.pressing,tactic.pressing)*pressWeight+closeness(s.line,tactic.defensiveLine)*lineWeight+closeness(s.freedom,tactic.freedom)*.2;
  return clamp(Math.round(score*100),25,99);
}

function bestXI(game){const t=getActiveTactic(game);return [...game.players].sort((a,b)=>(b.overall+playerTacticalFit(b,t)*.12+b.fitness*.05)-(a.overall+playerTacticalFit(a,t)*.12+a.fitness*.05)).slice(0,11);}
export function squadTacticalFit(game){const t=getActiveTactic(game),xi=bestXI(game);return Math.round(xi.reduce((s,p)=>s+playerTacticalFit(p,t),0)/xi.length);}

export function getCoachRequests(game){
  if(game.controlMode!=='coach'||!game.staff.coach)return [];
  const t=getActiveTactic(game),req=[]; const defenders=game.players.filter(p=>p.pos==='DFC'); const attackers=game.players.filter(p=>['DC','ED','EI','MP'].includes(p.pos));
  if(t.pressing>=16&&(!game.staff.fitnessCoach||game.staff.fitnessCoach.rating<68)) req.push({id:'fitness',priority:'Alta',title:'Preparador físico de nivel',detail:'Mi presión exige sostener esfuerzos. Quiero un preparador físico de 68+.',fulfilled:game.staff.fitnessCoach?.rating>=68});
  if(t.defensiveLine>=15&&Math.max(...defenders.map(p=>p.attributes?.pace||0),0)<72) req.push({id:'fastcb',priority:'Alta',title:'Central rápido',detail:'La línea alta necesita un DFC con velocidad ≥72.',fulfilled:defenders.some(p=>(p.attributes?.pace||0)>=72)});
  if(t.setPieces>=14&&!attackers.some(p=>(p.attributes?.aerial||0)>=75)) req.push({id:'aerial',priority:'Media',title:'Amenaza aérea',detail:'Necesito un atacante con juego aéreo ≥75 para explotar balón parado.',fulfilled:false});
  if(t.freedom>=16&&!attackers.some(p=>(p.attributes?.creativity||0)>=76)) req.push({id:'creator',priority:'Media',title:'Jugador creativo',detail:'Nuestro modelo necesita un atacante/MP con creatividad ≥76.',fulfilled:false});
  if(squadTacticalFit(game)<62) req.push({id:'fit',priority:'Alta',title:'Plantilla poco compatible',detail:`El encaje táctico del XI está en ${squadTacticalFit(game)}%. Prioriza fichajes compatibles.`,fulfilled:false});
  return req.slice(0,4);
}

function teamStrength(game){
  const xi=bestXI(game),avg=xi.reduce((s,p)=>s+p.overall,0)/11,fit=squadTacticalFit(game),fitness=xi.reduce((s,p)=>s+p.fitness,0)/11;
  const coach=game.controlMode==='self'?42+game.gm.stats.tactics*2.8:(game.staff.coach?.rating??50);
  const fitnessStaff=game.staff.fitnessCoach?.rating??38; const assistant=game.staff.assistantCoach?.rating??40;
  return avg*.68+coach*.14+fit*.07+fitness*.04+fitnessStaff*.035+assistant*.02+game.gm.stats.football*.22;
}


function poisson(lambda,r){
  const L=Math.exp(-lambda);let k=0,p=1;
  do{k+=1;p*=r();}while(p>L&&k<9);
  return Math.max(0,k-1);
}

function updateTable(table,userId,opponentId,userGoals,oppGoals,seed){
  const r=rng(seed),next=table.map(row=>({...row}));
  const apply=(row,gf,ga)=>{row.p++;row.gf+=gf;row.ga+=ga;row.gd=row.gf-row.ga;if(gf>ga){row.w++;row.pts+=3}else if(gf===ga){row.d++;row.pts++}else row.l++;};
  const user=next.find(x=>x.id===userId),opp=next.find(x=>x.id===opponentId); apply(user,userGoals,oppGoals);apply(opp,oppGoals,userGoals);
  const idle=next.filter(x=>x.id!==userId&&x.id!==opponentId).sort(()=>r()-.5);
  for(let i=0;i<idle.length;i+=2){const a=idle[i],b=idle[i+1];const edge=(a.strength-b.strength)/18;const ag=Math.max(0,Math.floor(r()*3+Math.max(0,edge)));const bg=Math.max(0,Math.floor(r()*3+Math.max(0,-edge)));apply(a,ag,bg);apply(b,bg,ag);}
  return next.sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
}

function demand(game){
  const brand=game.club.brand/100; const success=Math.max(.72,game.fanSentiment/70); const reach=game.localFans+game.nationalFans*.42+game.globalFans*.08;
  const cmo=1+(game.staff.cmo?.rating??0)/460; const channels=(game.merch.channels.matchday?.25:0)+(game.merch.channels.ecommerce?.35:0)+(game.merch.channels.clubShop?.32:0)+(game.merch.channels.distributors?.7:0);
  return reach*.00125*success*(.65+brand)*cmo*Math.max(.18,channels);
}
function sellMerch(game,attendance){
  const base=demand(game)+(attendance*.018); let inventory={...game.merch.inventory},revenue=0,sold={};
  const weights={shirt:.25,scarf:.47,cap:.28};
  for(const key of Object.keys(weights)){const price=game.merch.prices[key],elastic=Math.max(.35,1-(price-({shirt:45,scarf:18,cap:22}[key]))*.018);const q=Math.min(inventory[key],Math.max(0,Math.round(base*weights[key]*elastic)));inventory[key]-=q;sold[key]=q;revenue+=q*price;}
  return {inventory,revenue,sold};
}

const unitDefs={
  kiosk:{name:'Kiosco F&B',build:70000,weeklyBase:220,perFan:.65,upkeep:90},
  clubShop:{name:'Tienda oficial',build:210000,weeklyBase:180,perFan:.34,upkeep:180},
  restaurant:{name:'Restaurante',build:480000,weeklyBase:420,perFan:1.05,upkeep:620},
  rental:{name:'Local comercial alquilado',build:155000,weeklyBase:750,perFan:.05,upkeep:80},
  hospitality:{name:'Lounge hospitality',build:690000,weeklyBase:520,perFan:1.45,upkeep:900},
};
export const commercialUnitCatalog=unitDefs;

function stadiumBusiness(game,attendance){
  let rev=0,cost=0;
  for(const u of game.stadium.units){const d=unitDefs[u.type];if(!d)continue;rev+=d.weeklyBase+(game.lastMatch||attendance?attendance*d.perFan:0);cost+=d.upkeep;}
  return {revenue:Math.round(rev),cost:Math.round(cost)};
}
function supplierWeekly(game){return Object.values(game.suppliers).filter(Boolean).reduce((s,x)=>s+x.weekly,0);}
function supplierQuality(game,cat){return game.suppliers[cat]?.quality??40;}

export function advanceWeek(game){
  if(game.week>38)return game; const match=game.schedule[game.week-1]; const opponent=primeraFederacionClubs.find(c=>c.id===match.opponentId); const r=rng(hashString(`${game.club.id}-${game.season}-${game.week}-v2`));
  const strength=teamStrength(game),oppStrength=44+opponent.sporting*.38; const tactical=getFanTacticalSatisfaction(game); const homeEdge=match.home?2.4:0; const diff=(strength-oppStrength+homeEdge)/6.5;
  const xgFor=clamp(1.12+diff*.42+(match.home?.12:0),.28,3.2);const xgAgainst=clamp(1.08-diff*.36,.28,3.0);
  const goalsFor=poisson(xgFor,r); const goalsAgainst=poisson(xgAgainst,r); const win=goalsFor>goalsAgainst,draw=goalsFor===goalsAgainst;
  const accessFactor=.82+game.stadium.accessRating/180; const securityFactor=.9+supplierQuality(game,'Seguridad')/500;
  const priceElastic=Math.max(.38,1-(game.ticket.price-18)*.021); const resultBuzz=.72+game.fanSentiment/130;
  const attendance=match.home?Math.min(game.stadium.capacity,Math.round((game.localFans*.255+500)*priceElastic*resultBuzz*accessFactor*securityFactor)):0;
  const sellout=match.home&&attendance>=game.stadium.capacity*.98; const ticketRevenue=attendance*game.ticket.price;
  const stadiumBiz=stadiumBusiness(game,attendance); const merchResult=sellMerch(game,attendance);
  const sponsorRevenue=game.sponsors.reduce((s,x)=>s+x.annual/52+(win?x.bonusWin:0),0);
  const broadcastRevenue=game.club.tier===3?18000:game.club.tier===2?65000:210000;
  const wages=(game.players.reduce((s,p)=>s+p.salary,0)+Object.values(game.staff).filter(Boolean).reduce((s,x)=>s+x.salary,0)+game.gm.salary)/52;
  const suppliers=supplierWeekly(game); const facilities=game.stadium.capacity*.055+game.stadium.concourse*450+game.stadium.gates*85;
  const revenue=Math.round(ticketRevenue+stadiumBiz.revenue+merchResult.revenue+sponsorRevenue+broadcastRevenue); const costs=Math.round(wages+suppliers+facilities+stadiumBiz.cost); const cash=game.cash+revenue-costs;
  const styleBonus=tactical>=78?1:tactical<45?-2:0; const sentiment=clamp(game.fanSentiment+(win?3:draw?0:-3)+styleBonus+(sellout?1:0),15,98);
  const localGrowth=Math.max(-90,Math.round((win?game.localFans*.0018:draw?game.localFans*.00045:-game.localFans*.0007)+(sellout?85:0)+(tactical>80?28:0)));
  const globalGrowth=Math.max(-25,Math.round((win?game.globalFans*.00045:-game.globalFans*.00008)+(game.club.prestige>58&&win?70:0)));
  const table=updateTable(game.table,game.club.id,opponent.id,goalsFor,goalsAgainst,hashString(`${game.club.id}-table-${game.week}-v2`)); const position=table.findIndex(x=>x.id===game.club.id)+1;
  const boardConfidence=clamp(game.boardConfidence+(win?2:draw?0:-2)+(cash<0?-2:0)+(position<=6?1:0),10,98);
  const fitnessCoach=game.staff.fitnessCoach?.rating??42,physio=game.staff.physio?.rating??38;
  const academy=game.staff.academyDirector?.rating??38;
  const players=game.players.map(p=>{const load=match?5+r()*5:2;const recovery=3+fitnessCoach/35;const injuryRisk=Math.max(.002,.014-physio/9000);const injuredWeeks=(p.injuredWeeks??0)>0?(p.injuredWeeks-1):(r()<injuryRisk?1+Math.floor(r()*3):0);let overall=p.overall;const developmentWeek=game.week%4===0&&p.age<=22&&overall<p.potential;const devChance=.05+academy/260+(p.potential-overall)/180+(p.academy?.05:0);if(developmentWeek&&r()<devChance)overall=Math.min(p.potential,overall+1);const value=overall>p.overall?Math.round(p.value*1.09/10000)*10000:p.value;return {...p,overall,value,fitness:clamp(Math.round(p.fitness-load+recovery),48,99),sharpness:clamp(Math.round(p.sharpness+(match?2:-1)),45,99),injuredWeeks};});
  const finance={...game.finance,revenue:game.finance.revenue+revenue,costs:game.finance.costs+costs,ticket:game.finance.ticket+ticketRevenue,merch:game.finance.merch+merchResult.revenue,sponsor:game.finance.sponsor+sponsorRevenue,broadcast:game.finance.broadcast+broadcastRevenue,hospitality:game.finance.hospitality+stadiumBiz.revenue,wages:game.finance.wages+wages,facilities:game.finance.facilities+facilities,suppliers:game.finance.suppliers+suppliers,weekly:[...game.finance.weekly,{week:game.week,revenue,costs,cash}].slice(-14)};
  const achievements={...game.achievements};if(sellout)achievements.sellouts++;if(boardConfidence>=90)achievements.boardEliteWeeks++;else achievements.boardEliteWeeks=0;
  const gm={...game.gm,stats:{...game.gm.stats}};const news=[...game.news];const award=(stat,why,points=1)=>{gm.stats[stat]=Math.min(MAX_GM_STAT,gm.stats[stat]+points);gm.xp+=points*100;news.unshift({week:game.week,title:`Hito de carrera: ${why} (+${points} ${statLabelsShort[stat]})`,tone:'positive'});};
  const merchRevenue=game.merch.revenueSeason+merchResult.revenue;
  if(!achievements.merch1&&merchRevenue>=1000000){achievements.merch1=true;award('commercial','1 M€ de merchandising en una temporada');}
  if(!achievements.merch5&&merchRevenue>=5000000){achievements.merch5=true;award('commercial','5 M€ de merchandising',2);}
  if(!achievements.selloutSkill&&achievements.sellouts>=10){achievements.selloutSkill=true;award('fans','10 llenos en casa');}
  if(!achievements.boardSkill&&achievements.boardEliteWeeks>=8){achievements.boardSkill=true;award('board','8 semanas con confianza ≥90');}
  if(!achievements.staffEdge&&game.staff.fitnessCoach?.rating>=75&&position<=5){achievements.staffEdge=true;award('football','convertir staff de élite en ventaja deportiva');}
  news.unshift({week:game.week,title:`${game.club.name} ${goalsFor}-${goalsAgainst} ${opponent.name}${match.home?'':' (fuera)'}`,tone:win?'positive':draw?'neutral':'negative'});
  return {...game,week:game.week+1,dateLabel:weekLabel(game.week+1),cash,boardConfidence,fanSentiment:sentiment,localFans:game.localFans+localGrowth,globalFans:game.globalFans+globalGrowth,nationalFans:game.nationalFans+Math.max(0,Math.round(localGrowth*.35)),table,players,finance,achievements,gm,merch:{...game.merch,inventory:merchResult.inventory,revenueSeason:merchRevenue},lastMatch:{...match,opponent:opponent.name,goalsFor,goalsAgainst,attendance,ticketRevenue,hospitalityRevenue:stadiumBiz.revenue,merchRevenue:merchResult.revenue,position,tacticalSatisfaction:tactical},news:news.slice(0,36),history:[...game.history,{week:game.week,opponent:opponent.name,home:match.home,gf:goalsFor,ga:goalsAgainst,attendance}]};
}
function weekLabel(w){const m=w<5?'Agosto':w<9?'Septiembre':w<14?'Octubre':w<18?'Noviembre':w<22?'Diciembre':w<27?'Enero':w<31?'Febrero':w<35?'Marzo':'Abril';return `${m} · Semana ${w}`;}

export function produceMerch(game,key,qty){const unitCost={shirt:17,scarf:6,cap:8}[key];const cmoDiscount=1-((game.staff.cmo?.rating??0)/900);const cost=Math.round(unitCost*qty*cmoDiscount);if(qty<=0||game.cash<cost)return game;return {...game,cash:game.cash-cost,merch:{...game.merch,inventory:{...game.merch.inventory,[key]:game.merch.inventory[key]+qty},produced:{...game.merch.produced,[key]:game.merch.produced[key]+qty}},finance:{...game.finance,costs:game.finance.costs+cost}};}

const roleKeyMap={'Entrenador':'coach','Director deportivo':'sportingDirector','Preparador físico':'fitnessCoach','Segundo entrenador':'assistantCoach','Fisioterapia':'physio','Chief Merchandising Officer':'cmo','CFO':'cfo','Jefe de scouting':'scout','Director de cantera':'academyDirector'};
export function hireStaff(game,role,candidate){const signing=Math.round(candidate.salary*.12);if(game.cash<signing)return game;const key=roleKeyMap[role];return {...game,cash:game.cash-signing,staff:{...game.staff,[key]:candidate},news:[{week:game.week,title:`${candidate.name} se incorpora como ${role}`,tone:'positive'},...game.news]};}

export function signSupplier(game,category,candidate){return {...game,suppliers:{...game.suppliers,[category]:candidate},news:[{week:game.week,title:`Proveedor ${category}: acuerdo con ${candidate.name}`,tone:'info'},...game.news]};}

export function acceptSponsor(game,offer){if(game.sponsors.some(s=>s.type===offer.type))return game;return {...game,sponsors:[...game.sponsors,offer],sponsorOffers:game.sponsorOffers.filter(x=>x.id!==offer.id),news:[{week:game.week,title:`Acuerdo con ${offer.brand}: ${offer.type}`,tone:'positive'},...game.news]};}
export function submitSponsorOffer(game,offer,annual){
  const ask=offer.targetAnnual;const skill=game.gm.stats.finance;const floor=ask*(.92-skill*.009);let status='counter',next=offer;
  if(annual>=floor)status='accepted';else if(annual<ask*.7)status='rejected';
  else next={...offer,targetAnnual:Math.round((ask*(.96-skill*.002))/5000)*5000,negotiatedRounds:(offer.negotiatedRounds||0)+1};
  return {status,offer:next,message:status==='accepted'?'Aceptan tus condiciones.':status==='rejected'?'La oferta está demasiado lejos. No ceden.':`Contraoferta: ${money(next.targetAnnual)} al año.`};
}
export function negotiateSponsor(game,offer){const result=submitSponsorOffer(game,offer,offer.annual*(1.02+game.gm.stats.finance*.006));if(result.status==='accepted')return {...game,sponsorOffers:game.sponsorOffers.map(x=>x.id===offer.id?{...x,annual:Math.round(offer.annual*(1.02+game.gm.stats.finance*.006)),negotiated:true}:x)};return {...game,sponsorOffers:game.sponsorOffers.map(x=>x.id===offer.id?{...result.offer,annual:Math.round(offer.annual*1.02)}:x)};}

export function evaluateClubOffer(game,player,amount,round=1){
  if(player.club==='Libre')return {status:'accepted',counter:0,message:'El jugador es libre: no hay club vendedor.'};
  const ask=player.seller.asking;const skill=game.gm.stats.players;const relationship=player.seller.relationship;const min=ask*(.84-skill*.009-(player.seller.needCash?.05:0)-(relationship-50)/1000);
  if(amount>=min)return {status:'accepted',counter:amount,message:'El club acepta la estructura económica.'};
  if(round>=player.seller.patience&&amount<ask*.82)return {status:'walked',counter:null,message:'El club da por terminadas las conversaciones.'};
  if(amount<ask*.62)return {status:'rejected',counter:ask,message:'Consideran la propuesta poco seria.'};
  const counter=Math.round((ask*(1-.025*round-skill*.003))/50000)*50000;
  return {status:'counter',counter,message:`Rechazan, pero contraofertan ${money(counter)}.`};
}
export function evaluatePlayerOffer(game,player,salary,signing,round=1){
  const skill=game.gm.stats.players;const target=player.agent.salaryAsk*(1-skill*.006);const signingTarget=player.agent.signingAsk*(1-skill*.007);const score=(salary/target)*.68+(signing/signingTarget)*.32;
  if(score>=.985)return {status:'accepted',salary,signing,message:'El agente da el visto bueno.'};
  if(round>=player.agent.patience&&score<.82)return {status:'walked',message:'El agente rompe las conversaciones.'};
  if(score<.68)return {status:'rejected',salary:player.agent.salaryAsk,signing:player.agent.signingAsk,message:'La propuesta está muy lejos de sus expectativas.'};
  return {status:'counter',salary:Math.round(target*(.99-.02*round)/5000)*5000,signing:Math.round(signingTarget*(.98-.025*round)/5000)*5000,message:'El agente presenta una contraoferta.'};
}
export function completeTransfer(game,player,clubFee,salary,signing){
  const total=clubFee+signing;if(game.cash<total||game.players.length>=30)return game;
  const achievements={...game.achievements},gm={...game.gm,stats:{...game.gm.stats}},news=[...game.news];
  if(player.star&&!achievements.star){achievements.star=true;gm.stats.players=Math.min(MAX_GM_STAT,gm.stats.players+1);gm.xp+=100;news.unshift({week:game.week,title:'Hito: fichaste una estrella para el nivel del club (+1 negociación)',tone:'positive'});}
  news.unshift({week:game.week,title:`Fichaje cerrado: ${player.name} · ${money(clubFee)} + contrato ${money(salary)}/año`,tone:'positive'});
  return {...game,cash:game.cash-total,players:[...game.players,{...player,id:`signed-${player.id}`,club:game.club.name,salary,morale:80,contract:3}],market:game.market.filter(p=>p.id!==player.id),achievements,gm,news,finance:{...game.finance,transfersIn:game.finance.transfersIn+total,costs:game.finance.costs+total}};
}
export function signPlayer(game,player){const fee=player.club==='Libre'?0:player.seller?.asking||player.value;return completeTransfer(game,player,fee,player.agent?.salaryAsk||player.salary,player.agent?.signingAsk||Math.round(player.salary*.12));}

export function buildCommercialUnit(game,slot,type){const d=unitDefs[type];if(!d||slot>=game.stadium.commercialSlots||game.stadium.units.some(u=>u.slot===slot)||game.cash<d.build)return game;return {...game,cash:game.cash-d.build,stadium:{...game.stadium,units:[...game.stadium.units,{slot,type,name:d.name}]},news:[{week:game.week,title:`Estadio: abre ${d.name}`,tone:'positive'},...game.news]};}
export function stadiumUpgrade(game,id){
  const s={...game.stadium};let cost=0,title='';
  if(id==='barcode'&&s.access==='Manual'){cost=160000;s.access='Código de barras';s.accessRating=55;title='Accesos con código de barras';}
  else if(id==='automatic'&&s.access!=='Automático'){cost=680000;s.access='Automático';s.accessRating=84;title='Accesos automáticos';}
  else if(id==='gates'){cost=120000+s.gates*8000;s.gates+=2;s.accessRating=clamp(s.accessRating+4,0,95);title='Dos nuevos tornos/accesos';}
  else if(id==='concourse'){cost=320000*s.concourse;s.concourse+=1;s.commercialSlots+=1;title='Ampliación de galería comercial';}
  else if(id==='transport'){cost=420000+Math.max(0,s.transport-40)*9000;s.transport=clamp(s.transport+14,0,95);title='Mejora de accesos y transporte';}
  else if(id==='seats'){cost=Math.round(s.capacity*430);s.capacity+=Math.max(500,Math.round(s.capacity*.14));s.condition=clamp(s.condition-3,0,100);title='Ampliación de aforo';}
  if(!cost||game.cash<cost)return game;return {...game,cash:game.cash-cost,stadium:s,finance:{...game.finance,costs:game.finance.costs+cost,facilities:game.finance.facilities+cost},news:[{week:game.week,title:`Proyecto completado: ${title} (${money(cost)})`,tone:'positive'},...game.news]};
}
