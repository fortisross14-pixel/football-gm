import {primeraFederacionClubs} from '../src/data/clubs.js';
import {acceptSponsor,advanceWeek,buildCommercialUnit,completeTransfer,createGame,hireStaff,produceMerch,signSupplier,stadiumUpgrade} from '../src/game/engine.js';

const club=primeraFederacionClubs.find(c=>c.prestige>=48&&c.prestige<=56&&c.sporting>=50&&c.sporting<=65&&!c.name.includes(' B')&&!c.name.includes('Fabril')&&!c.name.includes('Castilla')) || primeraFederacionClubs[4];
const gmBase={name:'QA GM',archetype:'business',salary:92000,stats:{finance:9,players:8,fans:7,board:8,football:8,tactics:7,commercial:9}};
const clone=x=>structuredClone(x);
const signBasicSponsors=g=>{let x=g;for(const o of g.sponsorOffers.slice(0,2))x=acceptSponsor(x,o);return x;};
const season=g=>{let x=g;while(x.week<=38)x=advanceWeek(x);return x;};
const report=(name,g,startCash)=>({strategy:name,position:g.table.findIndex(x=>x.id===g.club.id)+1,cash:Math.round(g.cash),cashDelta:Math.round(g.cash-startCash),fans:g.localFans,fanGrowth:+(((g.localFans-g.club.localFans)/g.club.localFans)*100).toFixed(1),merch:Math.round(g.merch.revenueSeason),staffSpend:Object.values(g.staff).filter(Boolean).reduce((s,x)=>s+x.salary,0),stadiumCapacity:g.stadium.capacity,commercialUnits:g.stadium.units.length,avgYoung:+(g.players.filter(p=>p.age<=22).reduce((s,p)=>s+p.overall,0)/Math.max(1,g.players.filter(p=>p.age<=22).length)).toFixed(1),squadAvg:+(g.players.reduce((s,p)=>s+p.overall,0)/g.players.length).toFixed(1),squadValue:Math.round(g.players.reduce((s,p)=>s+p.value,0)),infrastructureIndex:g.stadium.accessRating+g.stadium.concourse*15+g.stadium.transport+g.stadium.units.length*12});

const results=[];
// 1. Mercado: usar caja en un jugador superior y estructura mínima.
{
 let g=signBasicSponsors(createGame(club,clone(gmBase)));const start=g.cash;const targets=[...g.market].filter(p=>p.overall>=68).sort((a,b)=>b.overall-a.overall).slice(0,2);for(const target of targets){const fee=target.club==='Libre'?0:target.seller.asking;if(g.cash>fee+target.agent.signingAsk)g=completeTransfer(g,target,fee,target.agent.salaryAsk,target.agent.signingAsk)}g=season(g);results.push(report('Fichajes primero',g,start));
}
// 2. Staff: ventaja física y táctica, sin fichaje caro.
{
 let g=signBasicSponsors(createGame(club,clone(gmBase)));const start=g.cash;const bestFit=[...g.staffCandidates['Preparador físico']].sort((a,b)=>b.rating-a.rating)[0];const bestAs=[...g.staffCandidates['Segundo entrenador']].sort((a,b)=>b.rating-a.rating)[0];g=hireStaff(g,'Preparador físico',bestFit);g=hireStaff(g,'Segundo entrenador',bestAs);g=season(g);results.push(report('Staff de rendimiento',g,start));
}
// 3. Infraestructura/negocio: modernizar accesos, abrir locales y retail.
{
 let g=signBasicSponsors(createGame(club,clone(gmBase)));const start=g.cash;g=stadiumUpgrade(g,'barcode');g=stadiumUpgrade(g,'concourse');g=buildCommercialUnit(g,1,'rental');g=buildCommercialUnit(g,2,'clubShop');if(g.cash>65000)g={...g,cash:g.cash-65000,merch:{...g.merch,channels:{...g.merch.channels,ecommerce:true}}};g=produceMerch(g,'shirt',900);g=produceMerch(g,'scarf',1200);const sec=g.supplierOffers['Seguridad'].sort((a,b)=>b.quality-a.quality)[0];g=signSupplier(g,'Seguridad',sec);g=season(g);results.push(report('Infraestructura y negocio',g,start));
}
// 4. Jóvenes: director de cantera + scouting + dos jugadores sub-22 con techo alto.
{
 let g=signBasicSponsors(createGame(club,clone(gmBase)));const start=g.cash;const ad=[...g.staffCandidates['Director de cantera']].sort((a,b)=>b.rating-a.rating)[0];const scout=[...g.staffCandidates['Jefe de scouting']].sort((a,b)=>b.rating-a.rating)[0];g=hireStaff(g,'Director de cantera',ad);g=hireStaff(g,'Jefe de scouting',scout);for(const p of [...g.market].filter(p=>p.age<=21&&p.potential>=78).sort((a,b)=>b.potential-a.potential).slice(0,2)){if(g.cash>p.seller.asking+p.agent.signingAsk)g=completeTransfer(g,p,p.club==='Libre'?0:p.seller.asking,p.agent.salaryAsk,p.agent.signingAsk)}g=season(g);results.push(report('Cantera y potencial',g,start));
}
console.log(JSON.stringify({club:club.name,results},null,2));
