import React from 'react';
import { Initials, Metric, Pill, Bar } from '../components/UI.jsx';
import { money } from '../game/engine.js';

export default function Dashboard({game,onOpen}) {
  const position=game.table.findIndex((x)=>x.id===game.club.id)+1;
  const next=game.schedule[game.week-1];
  const categories=[
    {id:'sport',icon:'⚽',title:'DEPORTIVO',desc:'Resultados · Entrenador · Plantilla · Fichajes',metrics:[`${position}º en ${game.club.group}`,`Plantilla ${game.players.length} jugadores`,game.controlMode==='self'?'Tú diriges al equipo':`DT: ${game.staff.coach?.name}`]},
    {id:'club',icon:'♜',title:'CLUB & DIRECTIVA',desc:'Personal · Confianza · Objetivos · Tu carrera',metrics:[`Confianza ${Math.round(game.boardConfidence)}%`,`GM nivel ${game.gm.level}`,`${game.gm.xp} XP de carrera`]},
    {id:'business',icon:'€',title:'FINANZAS & NEGOCIO',desc:'Patrocinadores · Merchandising · Caja',metrics:[`Caja ${money(game.cash)}`,`Merch ${money(game.merch.revenueSeason)}`,`${game.sponsors.length} acuerdos activos`]},
    {id:'matchday',icon:'▦',title:'MATCH DAY',desc:'Afición · Estadio · Entradas · Hospitality',metrics:[`${game.stadium.capacity.toLocaleString('es-ES')} asientos`,`${game.localFans.toLocaleString('es-ES')} fans locales`,`Entrada media ${game.ticket.price} €`]},
  ];
  return <>
    <section className="hero-dashboard"><div><div className="kicker">Despacho del Director General</div><h1>{game.gm.name}, este club es ahora tu empresa.</h1><p>Tu trabajo no es elegir el lateral derecho cada domingo. Tu trabajo es conseguir que todo el ecosistema —césped, caja, afición y organización— funcione durante años.</p></div><div className="next-match"><span>PRÓXIMO PARTIDO</span>{next?<><div><Initials name={game.club.name} size="sm"/><b>{next.home?game.club.name:next.opponent}</b></div><em>vs</em><div><Initials name={next.opponent} size="sm"/><b>{next.home?next.opponent:game.club.name}</b></div><Pill tone={next.home?'positive':'neutral'}>{next.home?'En casa':'Fuera'}</Pill></>:<b>Temporada regular completada</b>}</div></section>
    <section className="quadrants">{categories.map((c)=><button key={c.id} className={`quad quad-${c.id}`} onClick={()=>onOpen(c.id)}><div className="quad-head"><span className="quad-icon">{c.icon}</span><div><b>{c.title}</b><small>{c.desc}</small></div><span>↗</span></div><div className="quad-metrics">{c.metrics.map((m)=><span key={m}>{m}</span>)}</div></button>)}</section>
    <section className="dashboard-lower"><article className="panel"><div className="panel-head"><div><span>SEMANA EN EL CLUB</span><h3>Últimas noticias</h3></div></div><div className="news-list">{game.news.slice(0,6).map((n,i)=><div key={`${n.week}-${i}`}><span className={`news-dot ${n.tone}`}/><div><b>{n.title}</b><small>Semana {n.week}</small></div></div>)}</div></article>
      <article className="panel"><div className="panel-head"><div><span>PULSO</span><h3>Relaciones clave</h3></div></div><Bar label="Directiva" value={game.boardConfidence}/><Bar label="Afición" value={game.fanSentiment}/><Bar label="Marca del club" value={game.club.brand}/><div className="pulse-foot"><Metric label="Fans locales" value={game.localFans.toLocaleString('es-ES')}/><Metric label="Fans globales" value={game.globalFans.toLocaleString('es-ES')}/></div></article>
    </section>
  </>;
}
