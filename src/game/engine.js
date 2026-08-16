import { primeraFederacionClubs, hashString } from '../data/clubs.js';
import { generateMarket, generatePlayers, generateSponsorOffers, generateStaff, rng } from './generator.js';

export const archetypes = {
  business: {
    name:'Hombre de negocios',
    blurb:'Capital, ingresos y estructura profesional antes que romanticismo.',
    stats:{ finance:6, players:3, fans:4, board:5, football:2, tactics:2, commercial:6 },
  },
  player: {
    name:'Exfutbolista',
    blurb:'Vestuario, fútbol y credibilidad deportiva desde el primer día.',
    stats:{ finance:2, players:4, fans:5, board:4, football:7, tactics:6, commercial:2 },
  },
  agent: {
    name:'Exagente',
    blurb:'Mercado, relaciones y negociación. Sabes cómo se mueve el talento.',
    stats:{ finance:4, players:7, fans:3, board:4, football:5, tactics:3, commercial:4 },
  },
};

export const statLabels = {
  finance:'Negociación financiera', players:'Negociación de jugadores', fans:'Gestión de afición',
  board:'Gestión de directiva', football:'Conocimiento de fútbol', tactics:'Conocimiento táctico', commercial:'Visión comercial',
};

export function money(v) {
  if (Math.abs(v) >= 1000000) return `${(v/1000000).toFixed(v >= 10000000 ? 1 : 2)} M€`;
  if (Math.abs(v) >= 1000) return `${Math.round(v/1000)} k€`;
  return `${Math.round(v)} €`;
}

function matchSchedule(club) {
  const peers = primeraFederacionClubs.filter((c) => c.group === club.group && c.id !== club.id);
  const r = rng(hashString(`${club.name}-schedule`));
  const shuffled = [...peers].sort(() => r() - .5);
  const first = shuffled.map((opp, i) => ({ round:i+1, opponentId:opp.id, opponent:opp.name, home:i%2===0 }));
  const second = shuffled.map((opp, i) => ({ round:i+20, opponentId:opp.id, opponent:opp.name, home:i%2!==0 }));
  return [...first, ...second];
}

function seedTable(club) {
  return primeraFederacionClubs.filter((c) => c.group === club.group).map((c) => ({
    id:c.id, name:c.name, p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0, strength:c.sporting,
  }));
}

export function getJobOffers(gmStats, archetypeId) {
  const r = rng(260816 + Object.values(gmStats).reduce((a,b)=>a+b,0) + hashString(archetypeId));
  const eligible = primeraFederacionClubs
    .filter((c) => c.prestige < 66 || gmStats.board >= 6)
    .sort(() => r() - .5)
    .slice(0, 6);
  return eligible.map((c, i) => ({
    ...c,
    salary: Math.round((52000 + c.prestige*2300 + i*3000)/1000)*1000,
    expectation: c.sporting > 63 ? 'Pelear por el playoff' : c.sporting > 51 ? 'Top 10 y crecer ingresos' : 'Estabilidad deportiva y financiera',
    patience: 45 + (hashString(c.name+'patience')%45),
  }));
}

export function createGame(club, gm) {
  const players = generatePlayers(club);
  const coaches = generateStaff(club,'Entrenador',6);
  const currentCoach = coaches[0];
  const schedule = matchSchedule(club);
  return {
    version:1, club:{...club}, gm:{...gm, reputation:34, level:1, xp:0, unspent:0},
    week:1, season:1, dateLabel:'Agosto · Semana 1',
    cash:club.cash,
    boardConfidence:68,
    fanSentiment:65,
    localFans:club.localFans,
    globalFans:club.globalFans,
    nationalFans:Math.round(club.localFans*.55),
    stadium:{ capacity:club.capacity, condition:72, restaurants:0, kiosks:1, vipSeats:Math.round(club.capacity*.03), training:1 },
    ticket:{ price: club.tier===3 ? 18 : 28, seasonTickets:Math.min(Math.round(club.localFans*.12), Math.round(club.capacity*.55)) },
    players,
    market:generateMarket(club),
    staff:{
      coach:currentCoach,
      sportingDirector:null,
      cmo:null,
      cfo:null,
      scout:null,
    },
    coachCandidates:coaches.slice(1),
    staffCandidates:{
      'Director deportivo':generateStaff(club,'Director deportivo'),
      'Chief Merchandising Officer':generateStaff(club,'Chief Merchandising Officer'),
      'CFO':generateStaff(club,'CFO'),
      'Jefe de scouting':generateStaff(club,'Jefe de scouting'),
    },
    controlMode:'coach',
    fanStyle:['vertical','press','control'][hashString(club.name)%3],
    sponsors:[], sponsorOffers:generateSponsorOffers(club,gm.stats.finance),
    merch:{
      inventory:{ shirt:0, scarf:0, cap:0 },
      prices:{ shirt:45, scarf:18, cap:22 },
      produced:{ shirt:0, scarf:0, cap:0 },
      revenueSeason:0,
      channels:{ matchday:true, ecommerce:false, clubShop:false, distributors:false },
    },
    finance:{ revenue:0, costs:0, ticket:0, merch:0, sponsor:0, hospitality:0, wages:0, facilities:0, transfersIn:0, transfersOut:0, weekly:[] },
    schedule, lastMatch:null,
    table:seedTable(club),
    objectives:[
      { id:'league', label:club.sporting>60?'Terminar Top 6':'Terminar en la mitad superior', progress:0, target:club.sporting>60?6:10, kind:'position' },
      { id:'cash', label:'Cerrar la temporada con caja positiva', progress:club.cash, target:1, kind:'cash' },
      { id:'fans', label:'Aumentar la afición local un 8%', progress:0, target:8, kind:'percent' },
    ],
    achievements:{ merch1:false, merch5:false, star:false, sellouts:0, selloutSkill:false, profit:false, boardEliteWeeks:0, boardSkill:false, tacticsSkill:false },
    history:[], news:[
      { week:1, title:`${club.name} presenta a su nuevo Director General`, tone:'info' },
      { week:1, title:'La directiva exige profesionalizar el área comercial sin descuidar el césped', tone:'neutral' },
    ],
  };
}

function styleFit(game) {
  if (game.controlMode === 'self') return 60 + game.gm.stats.tactics*4;
  const coach = game.staff.coach;
  if (!coach?.style) return 50;
  const fanMap = { vertical:'vertical', press:'press', control:'control' };
  return coach.style.id === fanMap[game.fanStyle] ? 92 : 58 + coach.rating*.2;
}

function teamStrength(game) {
  const top = [...game.players].sort((a,b)=>b.overall-a.overall).slice(0,11);
  const avg = top.reduce((a,p)=>a+p.overall,0)/11;
  const coach = game.controlMode === 'self' ? 40 + game.gm.stats.tactics*6 : (game.staff.coach?.rating ?? 50);
  return avg*.72 + coach*.18 + game.gm.stats.football*.75 + styleFit(game)*.04;
}

function updateTable(table, userId, opponentId, userGoals, oppGoals, seed) {
  const r = rng(seed);
  const next = table.map((row) => ({...row}));
  const apply = (row,gf,ga) => {
    row.p += 1; row.gf += gf; row.ga += ga; row.gd = row.gf-row.ga;
    if (gf>ga) { row.w+=1; row.pts+=3; } else if (gf===ga) { row.d+=1; row.pts+=1; } else row.l+=1;
  };
  const u = next.find((x)=>x.id===userId); const o=next.find((x)=>x.id===opponentId);
  apply(u,userGoals,oppGoals); apply(o,oppGoals,userGoals);
  const others = next.filter((x)=>x.id!==userId && x.id!==opponentId);
  for (let i=0;i<others.length-1;i+=2) {
    const a=others[i], b=others[i+1];
    const edge=(a.strength-b.strength)/18 + (r()-.5);
    const ag=Math.max(0,Math.min(5,Math.round(1.25+edge+r()*1.5-.7)));
    const bg=Math.max(0,Math.min(5,Math.round(1.25-edge+r()*1.5-.7)));
    apply(a,ag,bg); apply(b,bg,ag);
  }
  return next.sort((a,b)=>b.pts-a.pts || b.gd-a.gd || b.gf-a.gf);
}

function merchandiseSales(game, attendance, resultFactor, r) {
  const cmo = game.staff.cmo?.rating ?? 32;
  const channel = 1 + (game.merch.channels.ecommerce ? .35 : 0) + (game.merch.channels.clubShop ? .45 : 0) + (game.merch.channels.distributors ? .8 : 0);
  const reach = attendance*.026 + game.localFans*.006 + game.nationalFans*.0012 + game.globalFans*.00012;
  const demand = Math.max(0, reach*channel*resultFactor*(.55+cmo/150)*(0.82+r()*.35));
  const mix = { shirt:.42, scarf:.38, cap:.20 };
  let revenue=0, units=0;
  const inventory={...game.merch.inventory};
  Object.keys(mix).forEach((key)=>{
    const sell=Math.min(inventory[key],Math.floor(demand*mix[key]));
    inventory[key]-=sell; units+=sell; revenue+=sell*game.merch.prices[key];
  });
  return { revenue, units, inventory };
}

export function advanceWeek(game) {
  if (game.week > 38) return game;
  const match = game.schedule[game.week-1];
  const opponent = primeraFederacionClubs.find((c)=>c.id===match.opponentId);
  const r = rng(hashString(`${game.club.id}-${game.season}-${game.week}-${game.cash}`));
  const strength = teamStrength(game);
  const oppStrength = opponent.sporting + 7 + r()*9;
  const homeAdv = match.home ? 3.5 : -1.5;
  const edge = (strength + homeAdv - oppStrength)/13;
  const goalsFor=Math.max(0,Math.min(6,Math.round(1.25+edge+r()*1.9-.75)));
  const goalsAgainst=Math.max(0,Math.min(6,Math.round(1.2-edge+r()*1.9-.75)));
  const win=goalsFor>goalsAgainst, draw=goalsFor===goalsAgainst;
  const resultFactor=win?1.14:draw?1.02:.88;
  const priceElasticity=Math.max(.42,1-(game.ticket.price-18)*.022);
  const demandBase=game.localFans*.26*priceElasticity*(.78+game.fanSentiment/150)*resultFactor;
  const attendance=match.home ? Math.min(game.stadium.capacity,Math.round(demandBase + 200 + r()*900)) : 0;
  const sellout=match.home && attendance >= game.stadium.capacity*.985;
  const ticketRevenue=attendance*game.ticket.price;
  const hospitalityRevenue=match.home ? Math.round(attendance*(2.2+game.stadium.restaurants*4.4+game.stadium.kiosks*.75)) : 0;
  const merchResult=merchandiseSales(game,attendance,resultFactor,r);
  const sponsorRevenue=game.sponsors.reduce((sum,s)=>sum+s.annual/52,0) + (win?game.sponsors.reduce((sum,s)=>sum+s.bonusWin,0):0);
  const annualPlayerWages=game.players.reduce((sum,p)=>sum+p.salary,0);
  const annualStaffWages=Object.values(game.staff).filter(Boolean).reduce((sum,s)=>sum+(s.salary||0),0) + game.gm.salary;
  const wages=(annualPlayerWages+annualStaffWages)/52;
  const facilities=(game.stadium.capacity*2.2 + game.stadium.restaurants*9500 + game.stadium.kiosks*3200)/52;
  const revenue=ticketRevenue+hospitalityRevenue+merchResult.revenue+sponsorRevenue;
  const costs=wages+facilities;
  const cash=game.cash+revenue-costs;
  const sentiment=Math.max(15,Math.min(98,game.fanSentiment+(win?3:draw?0:-3)+(sellout?1:0)+(styleFit(game)>80?1:0)));
  const localGrowth=Math.max(-80,Math.round((win?game.localFans*.0018:draw?game.localFans*.0005:-game.localFans*.00065)+(sellout?90:0)));
  const globalGrowth=Math.max(-25,Math.round((win?game.globalFans*.00045:-game.globalFans*.00007)+(game.club.prestige>58&&win?75:0)));
  const table=updateTable(game.table,game.club.id,opponent.id,goalsFor,goalsAgainst,hashString(`${game.club.id}-table-${game.week}`));
  const position=table.findIndex((x)=>x.id===game.club.id)+1;
  const boardDelta=(win?2:draw?0:-2) + (cash>0?0:-2) + (position<=6?1:0);
  const boardConfidence=Math.max(10,Math.min(98,game.boardConfidence+boardDelta));
  const finance={...game.finance,
    revenue:game.finance.revenue+revenue, costs:game.finance.costs+costs,
    ticket:game.finance.ticket+ticketRevenue, merch:game.finance.merch+merchResult.revenue,
    sponsor:game.finance.sponsor+sponsorRevenue, hospitality:game.finance.hospitality+hospitalityRevenue,
    wages:game.finance.wages+wages, facilities:game.finance.facilities+facilities,
    weekly:[...game.finance.weekly,{week:game.week,revenue,costs,cash}].slice(-12),
  };
  const achievements={...game.achievements};
  if (sellout) achievements.sellouts+=1;
  if (boardConfidence>=90) achievements.boardEliteWeeks+=1; else achievements.boardEliteWeeks=0;
  const gm={...game.gm,stats:{...game.gm.stats}};
  const news=[...game.news];
  const merchRevenue=game.merch.revenueSeason+merchResult.revenue;
  const award=(stat,why)=>{ gm.stats[stat]=Math.min(10,gm.stats[stat]+1); gm.xp+=100; news.unshift({week:game.week,title:`Hito de carrera: ${why} (+1 ${statLabelsShort[stat]})`,tone:'positive'}); };
  if (!achievements.merch1 && merchRevenue>=1000000) { achievements.merch1=true; award('commercial','1 M€ de merchandising en una temporada'); }
  if (!achievements.merch5 && merchRevenue>=5000000) { achievements.merch5=true; gm.stats.commercial=Math.min(10,gm.stats.commercial+2); gm.xp+=200; news.unshift({week:game.week,title:'Hito de carrera: 5 M€ en merchandising (+2 visión comercial)',tone:'positive'}); }
  if (!achievements.selloutSkill && achievements.sellouts>=10) { achievements.selloutSkill=true; award('fans','10 llenos en casa'); }
  if (!achievements.boardSkill && achievements.boardEliteWeeks>=8) { achievements.boardSkill=true; award('board','8 semanas con confianza de directiva ≥90'); }
  news.unshift({week:game.week,title:`${game.club.name} ${goalsFor}-${goalsAgainst} ${opponent.name}${match.home?'':' (fuera)'}`,tone:win?'positive':draw?'neutral':'negative'});
  return {
    ...game, week:game.week+1, dateLabel:`${game.week+1<5?'Agosto':game.week+1<9?'Septiembre':game.week+1<14?'Octubre':game.week+1<18?'Noviembre':game.week+1<22?'Diciembre':game.week+1<27?'Enero':game.week+1<31?'Febrero':game.week+1<35?'Marzo':'Abril'} · Semana ${game.week+1}`,
    cash, boardConfidence, fanSentiment:sentiment,
    localFans:game.localFans+localGrowth, globalFans:game.globalFans+globalGrowth,
    nationalFans:game.nationalFans+Math.max(0,Math.round(localGrowth*.35)),
    table, finance, achievements, gm,
    merch:{...game.merch,inventory:merchResult.inventory,revenueSeason:merchRevenue},
    lastMatch:{...match,opponent:opponent.name,goalsFor,goalsAgainst,attendance,ticketRevenue,hospitalityRevenue,merchRevenue:merchResult.revenue,position},
    news:news.slice(0,30),
    history:[...game.history,{week:game.week,opponent:opponent.name,home:match.home,gf:goalsFor,ga:goalsAgainst,attendance}]
  };
}

const statLabelsShort={finance:'finanzas',players:'negociación jugadores',fans:'afición',board:'directiva',football:'fútbol',tactics:'táctica',commercial:'comercial'};

export function produceMerch(game, key, qty) {
  const unitCost={shirt:17,scarf:6,cap:8}[key];
  const cmoDiscount=1-((game.staff.cmo?.rating ?? 0)/1000);
  const cost=Math.round(unitCost*qty*cmoDiscount);
  if (qty<=0 || game.cash<cost) return game;
  return {...game,cash:game.cash-cost,merch:{...game.merch,
    inventory:{...game.merch.inventory,[key]:game.merch.inventory[key]+qty},
    produced:{...game.merch.produced,[key]:game.merch.produced[key]+qty},
  },finance:{...game.finance,costs:game.finance.costs+cost}};
}

export function hireStaff(game, role, candidate) {
  const signing=Math.round(candidate.salary*.15);
  if (game.cash<signing) return game;
  const key = role==='Entrenador'?'coach':role==='Director deportivo'?'sportingDirector':role==='Chief Merchandising Officer'?'cmo':role==='CFO'?'cfo':'scout';
  return {...game,cash:game.cash-signing,staff:{...game.staff,[key]:candidate},news:[{week:game.week,title:`${candidate.name} se incorpora como ${role}`,tone:'positive'},...game.news]};
}

export function acceptSponsor(game, offer) {
  if (game.sponsors.some((s)=>s.type===offer.type)) return game;
  return {...game,sponsors:[...game.sponsors,offer],sponsorOffers:game.sponsorOffers.filter((x)=>x.id!==offer.id),news:[{week:game.week,title:`Acuerdo con ${offer.brand}: ${offer.type}`,tone:'positive'},...game.news]};
}

export function negotiateSponsor(game, offer) {
  const skill=game.gm.stats.finance;
  const bump=.02+skill*.012;
  return {...game,sponsorOffers:game.sponsorOffers.map((x)=>x.id===offer.id?{...x,annual:Math.round(x.annual*(1+bump)/1000)*1000,negotiated:true}:x)};
}

export function signPlayer(game, player) {
  const fee=player.club==='Libre'?Math.round(player.value*.08):player.value;
  const signing=Math.round(player.salary*.12);
  const skillDiscount=1-game.gm.stats.players*.012;
  const cost=Math.round((fee+signing)*skillDiscount);
  if (game.cash<cost || game.players.length>=30) return game;
  const achievements={...game.achievements}; const gm={...game.gm,stats:{...game.gm.stats}}; const news=[...game.news];
  if (player.star && !achievements.star) { achievements.star=true; gm.stats.players=Math.min(10,gm.stats.players+1); gm.xp+=100; news.unshift({week:game.week,title:'Hito de carrera: fichaste una estrella para el nivel del club (+1 negociación de jugadores)',tone:'positive'}); }
  news.unshift({week:game.week,title:`Fichaje cerrado: ${player.name} por ${money(cost)}`,tone:'positive'});
  return {...game,cash:game.cash-cost,players:[...game.players,{...player,id:`signed-${player.id}`,morale:78,contract:3}],market:game.market.filter((p)=>p.id!==player.id),achievements,gm,news,finance:{...game.finance,transfersIn:game.finance.transfersIn+cost,costs:game.finance.costs+cost}};
}
