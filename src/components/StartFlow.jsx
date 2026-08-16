import React, { useMemo, useState } from 'react';
import { archetypes, getJobOffers, statLabels, money } from '../game/engine.js';
import { Initials, Bar, Pill } from './UI.jsx';

export default function StartFlow({onStart}) {
  const [step,setStep]=useState(1); const [arch,setArch]=useState('business');
  const [stats,setStats]=useState({...archetypes.business.stats}); const [free,setFree]=useState(5);
  const [name,setName]=useState('Director General');
  const offers=useMemo(()=>getJobOffers(stats,arch),[stats,arch]);
  const chooseArch=(id)=>{setArch(id);setStats({...archetypes[id].stats});setFree(5);};
  const adjust=(k,d)=>{if(d>0&&free>0&&stats[k]<10){setStats({...stats,[k]:stats[k]+1});setFree(free-1);} if(d<0&&stats[k]>archetypes[arch].stats[k]){setStats({...stats,[k]:stats[k]-1});setFree(free+1);}};
  return <div className="onboarding-shell">
    <header className="brand-intro"><div className="brand-mark">DG</div><div><b>FÚTBOL</b><span>DIRECTOR GENERAL</span></div><small>POC · Temporada 2026/27</small></header>
    <main className="onboarding-card">
      {step===1&&<>
        <div className="kicker">Tu carrera empieza aquí</div><h1>¿Qué clase de General Manager eres?</h1><p className="lead">No entrenas necesariamente al equipo. Construyes el club: fútbol, personas, dinero, marca, estadio y relación con la afición.</p>
        <label className="field"><span>Nombre del GM</span><input value={name} onChange={(e)=>setName(e.target.value)} /></label>
        <div className="archetype-grid">{Object.entries(archetypes).map(([id,a])=><button key={id} className={`archetype ${arch===id?'selected':''}`} onClick={()=>chooseArch(id)}><span className="archetype-icon">{id==='business'?'€':id==='player'?'10':'↔'}</span><b>{a.name}</b><p>{a.blurb}</p></button>)}</div>
        <div className="stat-builder"><div className="builder-head"><div><b>Atributos iniciales</b><span>Reparte 5 puntos extra. Mejorarán mediante hitos durante tu carrera.</span></div><Pill tone={free===0?'positive':'warning'}>{free} puntos libres</Pill></div>
          <div className="stat-grid">{Object.entries(stats).map(([k,v])=><div className="stat-line" key={k}><span>{statLabels[k]}</span><button aria-label={`Restar punto a ${statLabels[k]}`} onClick={()=>adjust(k,-1)}>−</button><strong>{v}</strong><button aria-label={`Añadir punto a ${statLabels[k]}`} disabled={free===0||v>=10} onClick={()=>adjust(k,1)}>+</button><Bar value={v} max={10}/></div>)}</div>
        </div>
        <button className="primary wide" disabled={free!==0||!name.trim()} onClick={()=>setStep(2)}>Ver mis ofertas de trabajo →</button>
      </>}
      {step===2&&<>
        <button className="back" onClick={()=>setStep(1)}>← Volver al perfil</button><div className="kicker">Primera Federación · 2026/27</div><h1>Seis directivas quieren entrevistarte</h1><p className="lead">Los datos económicos de este POC son simulados. Elige el tipo de reto que quieres convertir en una carrera.</p>
        <div className="offer-grid">{offers.map((c)=><article className="offer" key={c.id}><div className="offer-top"><Initials name={c.name}/><div><h3>{c.name}</h3><span>{c.group} · Prestigio {c.prestige}</span></div></div><div className="offer-kpis"><div><span>Estadio</span><b>{c.capacity.toLocaleString('es-ES')}</b></div><div><span>Afición local</span><b>{c.localFans.toLocaleString('es-ES')}</b></div><div><span>Caja</span><b>{money(c.cash)}</b></div></div><p><b>Mandato:</b> {c.expectation}</p><div className="offer-bottom"><span>Tu salario: <b>{money(c.salary)}/año</b></span><button className="primary" onClick={()=>onStart(c,{name,archetype:arch,stats,salary:c.salary})}>Aceptar puesto</button></div></article>)}</div>
      </>}
    </main>
  </div>;
}
