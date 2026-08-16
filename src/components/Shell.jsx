import React from 'react';
import { Initials, Pill } from './UI.jsx';
import { money } from '../game/engine.js';

const categoryLabels={sport:'Deportivo',club:'Club y directiva',business:'Negocio',matchday:'Match day'};
const tabs={
  sport:[['dashboard','Inicio'],['squad','Plantilla'],['coach','Entrenador'],['transfers','Fichajes'],['competitions','Competiciones']],
  club:[['dashboard','Inicio'],['staff','Personal'],['board','Directiva'],['gm','Mi carrera']],
  business:[['dashboard','Inicio'],['finance','Finanzas'],['sponsors','Patrocinios'],['merch','Merchandising']],
  matchday:[['dashboard','Inicio'],['stadium','Estadio'],['tickets','Entradas'],['fans','Afición']],
};

export default function Shell({game,screen,setScreen,category,setCategory,onAdvance,onReset,children}) {
  const position=game.table.findIndex((x)=>x.id===game.club.id)+1;
  return <div className="app-shell">
    <header className="topbar"><button className="club-brand" onClick={()=>{setScreen('dashboard');setCategory(null)}}><Initials name={game.club.name}/><div><b>{game.club.name}</b><span>General Manager · Temporada {game.season}</span></div></button><div className="top-kpis"><span><small>Jornada</small><b>{Math.min(game.week,38)}/38</b></span><span><small>Posición</small><b>{position || '—'}º</b></span><span><small>Caja</small><b>{money(game.cash)}</b></span><span><small>Directiva</small><b>{Math.round(game.boardConfidence)}%</b></span></div><div className="top-actions"><Pill>{game.dateLabel}</Pill><button className="advance" onClick={onAdvance} disabled={game.week>38}>Avanzar semana ▶</button></div></header>
    {category&&<nav className="subnav" aria-label={categoryLabels[category]}><button className="subnav-title" onClick={()=>{setCategory(null);setScreen('dashboard')}}>← {categoryLabels[category]}</button>{tabs[category].slice(1).map(([id,label])=><button key={id} className={screen===id?'active':''} onClick={()=>setScreen(id)}>{label}</button>)}<button className="reset-link" onClick={onReset}>Nueva partida</button></nav>}
    <main className="content">{children}</main>
  </div>;
}
