import React,{useEffect,useState} from 'react';
import StartFlow from './components/StartFlow.jsx';import Shell from './components/Shell.jsx';
import Dashboard from './screens/Dashboard.jsx';import Squad from './screens/Squad.jsx';import Coach from './screens/Coach.jsx';import Transfers from './screens/Transfers.jsx';import Competitions from './screens/Competitions.jsx';import Staff from './screens/Staff.jsx';import Board from './screens/Board.jsx';import GM from './screens/GM.jsx';import Finance from './screens/Finance.jsx';import Sponsors from './screens/Sponsors.jsx';import Merch from './screens/Merch.jsx';import Stadium from './screens/Stadium.jsx';import Tickets from './screens/Tickets.jsx';import Fans from './screens/Fans.jsx';import Suppliers from './screens/Suppliers.jsx';
import {acceptSponsor,advanceWeek,applyTacticalPreset,buildCommercialUnit,completeTransfer,createGame,evaluateClubOffer,evaluatePlayerOffer,hireStaff,negotiateSponsor,produceMerch,setTactic,signSupplier,stadiumUpgrade,submitSponsorOffer} from './game/engine.js';
const SAVE_KEY='football-director-poc-v2';
export default function App(){
  const [game,setGame]=useState(()=>{try{return JSON.parse(localStorage.getItem(SAVE_KEY))||null}catch{return null}});const [screen,setScreen]=useState('dashboard');const [category,setCategory]=useState(null);
  useEffect(()=>{if(game)localStorage.setItem(SAVE_KEY,JSON.stringify(game));},[game]);
  if(!game)return <StartFlow onStart={(club,gm)=>setGame(createGame(club,gm))}/>;
  const openCategory=(cat)=>{setCategory(cat);setScreen(cat==='sport'?'coach':cat==='club'?'staff':cat==='business'?'finance':'stadium')};
  const reset=()=>{localStorage.removeItem(SAVE_KEY);setGame(null);setScreen('dashboard');setCategory(null)};const props={game,setGame};let content=<Dashboard game={game} onOpen={openCategory} setScreen={setScreen} setCategory={setCategory}/>;
  if(screen==='squad')content=<Squad {...props}/>;if(screen==='coach')content=<Coach {...props} hire={(r,c)=>setGame(hireStaff(game,r,c))} setTactic={(p)=>setGame(setTactic(game,p))} preset={(id)=>setGame(applyTacticalPreset(game,id))}/>;
  if(screen==='transfers')content=<Transfers {...props} evaluateClub={(p,a,r)=>evaluateClubOffer(game,p,a,r)} evaluatePlayer={(p,s,b,r)=>evaluatePlayerOffer(game,p,s,b,r)} complete={(p,f,s,b)=>setGame(completeTransfer(game,p,f,s,b))}/>;
  if(screen==='competitions')content=<Competitions {...props}/>;if(screen==='staff')content=<Staff {...props} hire={(r,c)=>setGame(hireStaff(game,r,c))}/>;if(screen==='board')content=<Board {...props}/>;if(screen==='gm')content=<GM {...props}/>;
  if(screen==='finance')content=<Finance {...props}/>;if(screen==='sponsors')content=<Sponsors {...props} accept={(s)=>setGame(acceptSponsor(game,s))} quickNegotiate={(s)=>setGame(negotiateSponsor(game,s))} submit={(s,a)=>submitSponsorOffer(game,s,a)}/>;if(screen==='merch')content=<Merch {...props} produce={(k,q)=>setGame(produceMerch(game,k,q))}/>;if(screen==='suppliers')content=<Suppliers {...props} sign={(cat,c)=>setGame(signSupplier(game,cat,c))}/>;
  if(screen==='stadium')content=<Stadium {...props} upgrade={(id)=>setGame(stadiumUpgrade(game,id))} buildUnit={(slot,type)=>setGame(buildCommercialUnit(game,slot,type))}/>;if(screen==='tickets')content=<Tickets {...props}/>;if(screen==='fans')content=<Fans {...props}/>;
  return <Shell game={game} screen={screen} setScreen={setScreen} category={category} setCategory={setCategory} onAdvance={()=>setGame(advanceWeek(game))} onReset={reset}>{content}</Shell>;
}
