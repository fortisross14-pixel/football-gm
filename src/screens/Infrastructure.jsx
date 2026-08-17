import React from 'react';
import { SectionTitle, Metric, Bar, Pill } from '../components/UI.jsx';
import { FacilityCard, ProjectStrip } from '../components/Facility.jsx';
import { facilityDefs } from '../data/management.js';
import { facilityBonuses, facilityScore, money, commercialUnitCatalog } from '../game/engine.js';
import stadiumArt from '../assets/stadium-aerial.svg';
import infrastructureArt from '../assets/infrastructure.svg';

export function InfrastructureOverview({game,setScreen}){
  const b=facilityBonuses(game);const groups=[['stadium','Estadio','stadium','Partido, ticketing, experiencia y explotación'],['club','Instalaciones del club','clubFacilities','Medicina, medios, datos y oficinas'],['sport','Ciudad deportiva','sportFacilities','Entrenamiento, rendimiento y cantera']];
  return <><SectionTitle eyebrow="Infraestructura" title="El club también se construye con hormigón, tecnología y tiempo" action={<Pill>{game.infrastructure.projects.length}/{game.infrastructure.maxProjects} obras</Pill>}/>
  <div className="infra-hero panel"><img src={infrastructureArt} alt=""/><div><span>MASTER PLAN</span><h2>No existe un botón “mejorar instalaciones”</h2><p>Cada activo tiene una progresión física concreta. Puedes gastar antes de tiempo, construir demasiado pequeño o crear una ventaja que tarde años en amortizarse.</p></div><div className="infra-score-grid"><Metric label="Estadio" value={`${facilityScore(game,'stadium')}/100`}/><Metric label="Club" value={`${facilityScore(game,'club')}/100`}/><Metric label="Deportivo" value={`${facilityScore(game,'sport')}/100`}/><Metric label="Experiencia fan" value={`+${Math.round(b.fan||0)}`}/></div></div>
  <ProjectStrip game={game}/><div className="infra-area-grid">{groups.map(([id,name,screen,desc])=><button key={id} className="infra-area-card" onClick={()=>setScreen(screen)}><div className={`infra-area-art ${id}`}><img src={id==='stadium'?stadiumArt:infrastructureArt} alt=""/></div><span>{name.toUpperCase()}</span><h3>{desc}</h3><Bar value={facilityScore(game,id)} label="Desarrollo"/><i>Entrar →</i></button>)}</div></>;
}

export function StadiumV3({game,onBuild,onUnit}){
  const b=facilityBonuses(game);return <><SectionTitle eyebrow="Infraestructura · Estadio" title="El estadio como activo, producto y experiencia" action={<Pill>{game.stadium.capacity.toLocaleString('es-ES')} plazas</Pill>}/><ProjectStrip game={game}/>
  <div className="stadium-v3-hero"><div className="stadium-v3-art"><img src={stadiumArt} alt="Vista del estadio"/><div className="stadium-badge"><span>VALOR OPERATIVO</span><b>{facilityScore(game,'stadium')}/100</b></div></div><div className="stadium-kpi-stack"><Metric label="Aforo" value={game.stadium.capacity.toLocaleString('es-ES')}/><Metric label="Asientos VIP" value={game.stadium.vipSeats.toLocaleString('es-ES')}/><Metric label="Experiencia" value={`+${Math.round(b.fan||0)}`}/><Metric label="Disposición a pagar" value={`+${(b.ticketWtp||0).toFixed(1)}`}/><div className="stadium-warning"><b>CAPEX no es progreso automático</b><span>Un videomarcador de 7 M€ puede hacer feliz a la grada y destruir un club de Primera Federación.</span></div></div></div>
  <div className="facility-grid">{Object.keys(facilityDefs.stadium).map(id=><FacilityCard key={id} game={game} group="stadium" id={id} onBuild={onBuild}/>)}</div>
  <h3 className="minor-title">Locales: construir espacio no decide qué negocio opera dentro</h3><div className="commercial-slot-grid">{Array.from({length:game.stadium.commercialSlots}).map((_,slot)=>{const unit=(game.stadium.units||[]).find(u=>u.slot===slot);return <article key={slot} className={`commercial-slot-card ${unit?'occupied':''}`}><span>LOCAL {slot+1}</span>{unit?<><h3>{commercialUnitCatalog[unit.type]?.name||unit.name}</h3><p>{commercialUnitCatalog[unit.type]?.description}</p><Pill tone="positive">En operación</Pill></>:<><h3>Espacio vacío</h3><p>El hormigón ya existe. Ahora decide el modelo de explotación.</p><div className="unit-choice-list">{Object.entries(commercialUnitCatalog).map(([id,d])=><button key={id} disabled={game.cash<d.fitout} onClick={()=>onUnit(slot,id)}><b>{d.name}</b><span>{money(d.fitout)}</span><small>{d.description}</small></button>)}</div></>}</article>})}</div></>;
}

export function ClubFacilities({game,onBuild}){
  return <><SectionTitle eyebrow="Infraestructura · Club" title="Sede, medicina, medios, datos y operaciones"/><ProjectStrip game={game}/><div className="facility-grid">{Object.keys(facilityDefs.club).map(id=><FacilityCard key={id} game={game} group="club" id={id} onBuild={onBuild}/>)}</div></>;
}

export function SportFacilities({game,onBuild}){
  const b=facilityBonuses(game);return <><SectionTitle eyebrow="Infraestructura · Ciudad deportiva" title="Gasta aquí para ganar sin fichar una estrella" action={<Pill>Rendimiento +{Math.round(b.performance||0)}</Pill>}/><ProjectStrip game={game}/><div className="sports-facility-summary panel"><div><span>EFECTOS ACTUALES</span><h3>Ventajas acumuladas de la ciudad deportiva</h3></div><Metric label="Entrenamiento" value={`+${Math.round(b.training||0)}`}/><Metric label="Fitness" value={`+${Math.round(b.fitness||0)}`}/><Metric label="Recuperación" value={`+${Math.round(b.recovery||0)}`}/><Metric label="Cantera" value={`+${Math.round(b.youth||0)}`}/></div><div className="facility-grid">{Object.keys(facilityDefs.sport).map(id=><FacilityCard key={id} game={game} group="sport" id={id} onBuild={onBuild}/>)}</div></>;
}
