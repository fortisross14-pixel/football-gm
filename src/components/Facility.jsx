import React from 'react';
import { money } from '../game/engine.js';
import { facilityDefs, maxLevel } from '../data/management.js';
import { Pill } from './UI.jsx';

export function FacilityVisual({code,level=0}){
  return <div className={`facility-visual fv-${code.toLowerCase()}`} aria-hidden="true">
    <div className="facility-glow"/><div className="facility-building"><i/><i/><i/></div><div className="facility-code">{code}</div><div className="facility-level-bars">{Array.from({length:5}).map((_,i)=><span key={i} className={i<Math.min(5,level+1)?'on':''}/>)}</div>
  </div>;
}

export function FacilityCard({game,group,id,onBuild}){
  const def=facilityDefs[group][id],level=game.infrastructure.levels[group][id]||0,current=def.levels[level],next=def.levels[level+1],project=game.infrastructure.projects.find(p=>p.group===group&&p.assetId===id),max=maxLevel(group,id);
  const blockers=[];if(next?.requires?.minCapacity&&game.stadium.capacity<next.requires.minCapacity)blockers.push(`Requiere ${next.requires.minCapacity.toLocaleString('es-ES')} plazas`);if(next?.requires?.minBrand&&game.brandScore<next.requires.minBrand)blockers.push(`Requiere marca ${next.requires.minBrand}`);if(game.infrastructure.projects.length>=game.infrastructure.maxProjects&&!project)blockers.push('Equipo de obras ocupado');if(next&&game.cash<next.cost)blockers.push('Caja insuficiente');
  return <article className="facility-card">
    <FacilityVisual code={def.icon} level={level}/>
    <div className="facility-card-top"><div><span>{def.category}</span><h3>{def.name}</h3></div><Pill tone={level===max?'positive':'neutral'}>Nivel {level}/{max}</Pill></div>
    <div className="facility-current"><small>INSTALACIÓN ACTUAL</small><b>{current.name}</b><p>{current.description}</p></div>
    <div className="facility-path">{def.levels.map((l,i)=><i key={l.name} className={i<=level?'done':i===level+1?'next':''} title={l.name}/>)}</div>
    {project?<div className="facility-project"><span>EN OBRA</span><b>{project.name}</b><small>{project.remainingWeeks}/{project.totalWeeks} semanas restantes</small><div className="project-progress"><i style={{width:`${Math.round((1-project.remainingWeeks/project.totalWeeks)*100)}%`}}/></div></div>:next?<div className="facility-next"><small>SIGUIENTE PROYECTO</small><b>{next.name}</b><p>{next.description}</p><div className="facility-cost"><span>{money(next.cost)}</span><span>{next.weeks} sem.</span><span>{next.upkeep>0?`+${money(next.upkeep)}/sem`:next.upkeep<0?`${money(next.upkeep)}/sem`:'sin coste fijo'}</span></div>{blockers.length?<div className="facility-blockers">{blockers.map(x=><span key={x}>{x}</span>)}</div>:<button className="primary wide" onClick={()=>onBuild(group,id)}>Aprobar proyecto</button>}</div>:<div className="facility-max"><b>Instalación al máximo nivel</b><span>Has llegado al extremo comercial/técnico de este activo.</span></div>}
  </article>;
}

export function ProjectStrip({game}){
  return <div className="project-strip"><div><span>PLAN DE INVERSIONES</span><b>{game.infrastructure.projects.length}/{game.infrastructure.maxProjects} proyectos activos</b></div>{game.infrastructure.projects.length?game.infrastructure.projects.map(p=><div className="project-chip" key={p.id}><b>{p.name}</b><span>{p.remainingWeeks} semanas</span></div>):<div className="project-empty">Sin obras en curso. Mantener la caja también es una decisión.</div>}</div>;
}
