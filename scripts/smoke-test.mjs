import {clubs,primeraFederacionClubs} from '../src/data/clubs.js';
import {facilityDefs,maxLevel} from '../src/data/management.js';
import {
  createGame,advanceDays,startSponsorSearch,submitSponsorNegotiation,signSponsor,
  fireCoach,takeControl,createStaffPosition,startStaffSearch,submitStaffNegotiation,signStaffAgreement,
  commissionFacilityProject,startManufacturerSearch,signManufacturer,saveKitDesign,
  submitClubOffer,submitPlayerOffer,completeTransfer,scheduleEvent,startInvestment,
  ticketProjection,bestXI,unreadMail
} from '../src/game/v4.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const club=primeraFederacionClubs.find(c=>c.name==='CD Lugo')||primeraFederacionClubs[0];
const gm={name:'QA GM',archetype:'business',salary:90000,stats:{finance:12,players:11,fans:8,board:10,football:9,tactics:9,commercial:12}};
let game=createGame(club,gm);
assert(clubs.length===100,`Expected 100 clubs, got ${clubs.length}`);
assert(primeraFederacionClubs.length===40,`Expected 40 1RFEF clubs, got ${primeraFederacionClubs.length}`);
assert(game.version===4,'Expected v4 game state');
assert(game.sponsorOffers.length===0,'Sponsors must not be pre-generated');
assert(game.inbox.length>=3&&unreadMail(game)>=3,'Inbox initialization failed');
assert(game.players.length>=22&&bestXI(game).length===11,'Squad/XI generation failed');
assert(game.schedule.length===38,'Competition calendar failed');
assert(new Set(Object.values(game.infrastructure.levels.stadium)).size>1,'Stadium initial levels should vary');

// Time + sporting result/statistics.
game=advanceDays(game,5);
assert(game.history.length===1,'Daily calendar did not trigger first match');
assert(game.players.some(p=>p.stats.apps>0),'Player match statistics were not allocated');
const tp=ticketProjection(game);assert(tp.attendance>=0&&tp.attendance<=game.stadium.capacity,'Ticket projection invalid');

// Sponsors are a timed search, followed by next-day negotiation.
game=startSponsorSearch(game,'shirtMain','local',60);
assert(game.processes.some(p=>p.type==='sponsorSearch'),'Sponsor search did not start');
game=advanceDays(game,60);
const sponsorOffer=game.sponsorOffers.find(o=>o.slotId==='shirtMain');
assert(sponsorOffer,'Long local sponsor search should produce at least one deterministic offer');
game=submitSponsorNegotiation(game,sponsorOffer.id,sponsorOffer.currentAnnual);
assert(game.sponsorNegotiations[sponsorOffer.id].status==='waiting','Sponsor negotiation should wait for response');
game=advanceDays(game,1);
assert(game.sponsorNegotiations[sponsorOffer.id].status==='accepted','Baseline sponsor offer should be acceptable');
game=signSponsor(game,sponsorOffer.id);
assert(game.sponsors.some(s=>s.slotId==='shirtMain'),'Sponsor signing failed');

// Coach can only be self-controlled after dismissal.
const coachBefore=game.staff.coach;assert(coachBefore,'Initial coach missing');
const forbidden=takeControl(game);assert(forbidden.controlMode==='coach','GM should not seize control while coach exists');
game=fireCoach({...game,cash:game.cash+2_000_000});
assert(!game.staff.coach&&game.controlMode==='vacant','Coach dismissal flow failed');
game=takeControl(game);assert(game.controlMode==='self','GM control should be allowed only in vacancy');

// Staff positions are created explicitly and searches are timed.
game=createStaffPosition(game,'Preparador físico');
game=startStaffSearch(game,'Preparador físico',14);
game=advanceDays(game,14);
const phys=game.staffCandidatePools['Preparador físico']?.[0];assert(phys,'Staff search returned no candidates');
game=submitStaffNegotiation(game,'Preparador físico',phys.id,phys.salary,[]);game=advanceDays(game,1);
assert(game.staffNegotiations[`Preparador físico:${phys.id}`].status==='accepted','Staff negotiation failed');
game=signStaffAgreement({...game,cash:game.cash+500_000},'Preparador físico',phys.id);
assert(game.staff.fitnessCoach,'Staff signing failed');

// Kit manufacturer + designer constraints.
game=startManufacturerSearch(game,14);game=advanceDays(game,14);
const manufacturer=game.kit.manufacturerOffers[0];assert(manufacturer,'Kit manufacturer search failed');
game=signManufacturer(game,manufacturer.id);assert(game.kit.manufacturer,'Manufacturer signing failed');
const oldAppeal=game.kit.appeal;game=saveKitDesign(game,{style:'Banda diagonal',collar:'Pico',sleeve:'Manga completa'});
assert(game.kit.appeal>=35&&game.kit.appeal<=98&&Number.isFinite(oldAppeal),'Kit designer appeal invalid');

// Descriptive infrastructure projects can jump to a future target and accumulate time/cost.
const assetId='scoreboard',current=game.infrastructure.levels.stadium[assetId]||0,target=Math.min(maxLevel('stadium',assetId),current+2);
if(target>current){
  let totalWeeks=0;for(let i=current+1;i<=target;i++)totalWeeks+=facilityDefs.stadium[assetId].levels[i].weeks;
  game=commissionFacilityProject({...game,cash:game.cash+20_000_000},'stadium',assetId,target);
  assert(game.processes.some(p=>p.type==='facility'&&p.payload.assetId===assetId),'Facility project did not commission');
  game=advanceDays(game,totalWeeks*7);
  assert(game.infrastructure.levels.stadium[assetId]===target,'Facility project did not reach selected target');
}

// Transfer negotiation has asynchronous club and player stages.
let player=game.market.find(p=>p.club!=='Libre')||game.market[0];
const fee=player.club==='Libre'?0:player.seller.asking;
game=submitClubOffer(game,player.id,fee);assert(game.transferNegotiations[player.id].status==='waiting','Club offer should be asynchronous');
game=advanceDays(game,1);
assert(game.transferNegotiations[player.id].stage==='player','Club negotiation did not advance to contract stage');
game=submitPlayerOffer(game,player.id,player.agent.salaryAsk,player.agent.signingAsk);game=advanceDays(game,1);
assert(game.transferNegotiations[player.id].stage==='ready','Player negotiation did not reach ready stage');
const beforeCount=game.players.length;game=completeTransfer({...game,cash:game.cash+20_000_000},player.id);assert(game.players.length===beforeCount+1,'Transfer completion failed');

// Event scheduling causes future mail, economics and pitch wear.
const future=new Date(`${game.calendarISO}T12:00:00Z`);future.setUTCDate(future.getUTCDate()+7);const date=future.toISOString().slice(0,10);
const conditionBefore=game.stadium.condition;game=scheduleEvent({...game,cash:game.cash+1_000_000},'concert',date);game=advanceDays(game,7);
assert(game.events.some(e=>e.type==='concert'&&e.status==='completed'),'Event did not complete');
assert(game.stadium.condition<conditionBefore+2,'Concert did not materially affect pitch condition');

// Treasury low-risk product is fixed at +5% annual.
game=startInvestment({...game,cash:game.cash+1_000_000},'low',100_000,365);game=advanceDays(game,365);
const matured=game.financeV4.investments.find(i=>i.type==='low'&&i.status==='matured');assert(matured&&Math.abs(matured.returnRate-.05)<1e-9,'Low-risk investment must return fixed +5% annually');

console.log('v0.4 smoke tests passed',{
  club:game.club.name,day:game.day,matches:game.history.length,sponsors:game.sponsors.length,
  staffPositions:game.staffPositions.length,scoreboard:game.infrastructure.levels.stadium.scoreboard,
  inbox:game.inbox.length,cash:Math.round(game.cash)
});
