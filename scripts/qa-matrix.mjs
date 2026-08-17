import {primeraFederacionClubs} from '../src/data/clubs.js';
import {acceptSponsor,advanceWeek,completeTransfer,createGame,facilityScore,getBrandScore,hireStaff,produceMerch,startFacilityProject,upgradeMerchChannel,setBusinessPolicy} from '../src/game/engine.js';
const gm={name:'QA Matrix',archetype:'business',salary:92000,stats:{finance:9,players:8,fans:7,board:8,football:8,tactics:7,commercial:9}};
const names=['Juventud de Torremolinos CF','CD Lugo','Real Murcia CF','Real Zaragoza'];
const clubs=names.map(n=>primeraFederacionClubs.find(c=>c.name===n)).filter(Boolean);
const sign=(g,n=2)=>{let x=g;for(const o of g.sponsorOffers.slice(0,n))x=acceptSponsor(x,o);return x};
const run=g=>{let x=g;while(x.week<=38)x=advanceWeek(x);return x};
const project=(g,a,b)=>startFacilityProject(g,a,b);
function setup(club,strategy){let g=sign(createGame(club,structuredClone(gm)),strategy==='commercial'?3:2);const start=g.cash;
 if(strategy==='transfers')for(const p of [...g.market].filter(p=>p.overall>=67).sort((a,b)=>b.overall-a.overall).slice(0,2)){const fee=p.club==='Libre'?0:p.seller.asking;if(g.cash>fee+p.agent.signingAsk+200000)g=completeTransfer(g,p,fee,p.agent.salaryAsk,p.agent.signingAsk)}
 if(strategy==='staff'){const fc=[...g.staffCandidates['Preparador físico']].sort((a,b)=>b.rating-a.rating)[0],as=[...g.staffCandidates['Segundo entrenador']].sort((a,b)=>b.rating-a.rating)[0];g=hireStaff(g,'Preparador físico',fc);g=hireStaff(g,'Segundo entrenador',as);g=project(g,'sport','gym');g=project(g,'sport','analysisRoom')}
 if(strategy==='stadium'){g=project(g,'stadium','toilets');g=project(g,'stadium','scoreboard')}
 if(strategy==='commercial'){g=upgradeMerchChannel(g,'ecommerce');g=upgradeMerchChannel(g,'matchday');g=project(g,'club','commercialOffice');g=project(g,'club','mediaCenter');g=produceMerch(g,'shirt',300);g=produceMerch(g,'scarf',400);g=setBusinessPolicy(g,'media',{weeklyBudget:1800})}
 if(strategy==='academy'){const ad=[...g.staffCandidates['Director de cantera']].sort((a,b)=>b.rating-a.rating)[0];g=hireStaff(g,'Director de cantera',ad);g=project(g,'sport','academyGround');g=project(g,'sport','academyResidence')}
 return {start,g:run(g)};
}
const strategies=['transfers','staff','stadium','commercial','academy'];const rows=[];let violations=[];
for(const club of clubs){const init=createGame(club,structuredClone(gm));if(init.sponsorOffers.some(o=>['national','global'].includes(o.scope)))violations.push(`${club.name}: large sponsor in 1RFEF`);for(const s of strategies){const {start,g}=setup(club,s);const young=g.players.filter(p=>p.age<=22);rows.push({club:club.name,strategy:s,pos:g.table.findIndex(r=>r.id===g.club.id)+1,cashDelta:Math.round(g.cash-start),brand:getBrandScore(g),commercial:Math.round(g.finance.sponsor+g.finance.merch+g.finance.hospitality+g.finance.events+g.finance.media+g.finance.membership),stadium:facilityScore(g,'stadium'),clubInfra:facilityScore(g,'club'),sportInfra:facilityScore(g,'sport'),youngAvg:+(young.reduce((a,p)=>a+p.overall,0)/Math.max(1,young.length)).toFixed(1),squadValue:Math.round(g.players.reduce((a,p)=>a+p.value,0))});}}
const summary=clubs.map(c=>{const r=rows.filter(x=>x.club===c.name);return {club:c.name,positions:r.map(x=>x.pos),positionSpread:Math.max(...r.map(x=>x.pos))-Math.min(...r.map(x=>x.pos)),cashSpread:Math.max(...r.map(x=>x.cashDelta))-Math.min(...r.map(x=>x.cashDelta)),commercialLeader:[...r].sort((a,b)=>b.commercial-a.commercial)[0].strategy,sportInfraLeader:[...r].sort((a,b)=>b.sportInfra-a.sportInfra)[0].strategy,stadiumLeader:[...r].sort((a,b)=>b.stadium-a.stadium)[0].strategy};});
if(violations.length)throw new Error(violations.join('; '));
console.log(JSON.stringify({seasonsSimulated:rows.length,violations,summary,rows},null,2));
