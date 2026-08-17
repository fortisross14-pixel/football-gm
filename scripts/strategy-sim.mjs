import {primeraFederacionClubs} from '../src/data/clubs.js';
import {acceptSponsor,advanceWeek,completeTransfer,createGame,facilityScore,getBrandScore,hireStaff,produceMerch,startFacilityProject,upgradeMerchChannel,setBusinessPolicy} from '../src/game/engine.js';
const club=primeraFederacionClubs.find(c=>c.name==='CD Lugo')||primeraFederacionClubs[0];
const gmBase={name:'QA GM',archetype:'business',salary:92000,stats:{finance:9,players:8,fans:7,board:8,football:8,tactics:7,commercial:9}};
const clone=x=>structuredClone(x);
function signSponsors(g,n=2){let x=g;for(const o of g.sponsorOffers.slice(0,n))x=acceptSponsor(x,o);return x;}
function season(g){let x=g;while(x.week<=38)x=advanceWeek(x);return x;}
function startIf(g,group,id){const x=startFacilityProject(g,group,id);return x;}
function report(strategy,g,startCash){const young=g.players.filter(p=>p.age<=22);return {strategy,position:g.table.findIndex(x=>x.id===g.club.id)+1,cash:Math.round(g.cash),cashDelta:Math.round(g.cash-startCash),fans:g.localFans,fanGrowthPct:+(((g.localFans-g.club.localFans)/g.club.localFans)*100).toFixed(1),brand:getBrandScore(g),commercialRevenue:Math.round(g.finance.sponsor+g.finance.merch+g.finance.hospitality+g.finance.events+g.finance.media+g.finance.membership),merch:Math.round(g.merch.revenueSeason),stadiumScore:facilityScore(g,'stadium'),clubScore:facilityScore(g,'club'),sportScore:facilityScore(g,'sport'),youngAvg:+(young.reduce((s,p)=>s+p.overall,0)/Math.max(1,young.length)).toFixed(1),injuryWeeks:g.players.reduce((s,p)=>s+(p.injuredWeeks||0),0),squadValue:Math.round(g.players.reduce((s,p)=>s+p.value,0)),projectsLeft:g.infrastructure.projects.length};}
const results=[];
// 1) Aggressive transfer spend.
{
 let g=signSponsors(createGame(club,clone(gmBase)));const start=g.cash;for(const p of [...g.market].filter(p=>p.overall>=68).sort((a,b)=>b.overall-a.overall).slice(0,2)){const fee=p.club==='Libre'?0:p.seller.asking;if(g.cash>fee+p.agent.signingAsk+250000)g=completeTransfer(g,p,fee,p.agent.salaryAsk,p.agent.signingAsk)}g=season(g);results.push(report('Fichajes agresivos',g,start));
}
// 2) Staff + sporting campus.
{
 let g=signSponsors(createGame(club,clone(gmBase)));const start=g.cash;const fit=[...g.staffCandidates['Preparador físico']].sort((a,b)=>b.rating-a.rating)[0],as=[...g.staffCandidates['Segundo entrenador']].sort((a,b)=>b.rating-a.rating)[0];g=hireStaff(g,'Preparador físico',fit);g=hireStaff(g,'Segundo entrenador',as);g=startIf(g,'sport','gym');g=startIf(g,'sport','analysisRoom');g=season(g);results.push(report('Staff + rendimiento',g,start));
}
// 3) Stadium experience / ticket willingness.
{
 let g=signSponsors(createGame(club,clone(gmBase)));const start=g.cash;g=startIf(g,'stadium','toilets');g=startIf(g,'stadium','scoreboard');g=season(g);results.push(report('Experiencia estadio',g,start));
}
// 4) Commercial build: media, retail channels, stock.
{
 let g=signSponsors(createGame(club,clone(gmBase)),3);const start=g.cash;g=upgradeMerchChannel(g,'ecommerce');g=upgradeMerchChannel(g,'matchday');g=startIf(g,'club','commercialOffice');g=startIf(g,'club','mediaCenter');g=produceMerch(g,'shirt',300);g=produceMerch(g,'scarf',400);g=setBusinessPolicy(g,'media',{weeklyBudget:1800});g=season(g);results.push(report('Comercial & media',g,start));
}
// 5) Academy long-term foundation.
{
 let g=signSponsors(createGame(club,clone(gmBase)));const start=g.cash;const ad=[...g.staffCandidates['Director de cantera']].sort((a,b)=>b.rating-a.rating)[0];g=hireStaff(g,'Director de cantera',ad);g=startIf(g,'sport','academyGround');g=startIf(g,'sport','academyResidence');for(const p of [...g.market].filter(p=>p.age<=21&&p.potential>=78).sort((a,b)=>b.potential-a.potential).slice(0,2)){const fee=p.club==='Libre'?0:p.seller.asking;if(g.cash>fee+p.agent.signingAsk+150000)g=completeTransfer(g,p,fee,p.agent.salaryAsk,p.agent.signingAsk)}g=season(g);results.push(report('Cantera & potencial',g,start));
}
console.log(JSON.stringify({club:club.name,initialCash:club.cash,results},null,2));
