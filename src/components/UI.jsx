import React from 'react';
import { money } from '../game/engine.js';

export function Initials({name,size='md'}) {
  const letters=name.split(/\s+/).filter((x)=>!['CF','FC','CD','UD','SD','RC','RCD','Real','Club'].includes(x)).slice(0,2).map((x)=>x[0]).join('').toUpperCase() || name.slice(0,2).toUpperCase();
  return <div className={`crest crest-${size}`} aria-hidden="true">{letters}</div>;
}
export function Pill({children,tone='neutral'}) { return <span className={`pill ${tone}`}>{children}</span>; }
export function Metric({label,value,sub,tone}) { return <div className="metric"><span>{label}</span><strong className={tone?`text-${tone}`:''}>{value}</strong>{sub&&<small>{sub}</small>}</div>; }
export function Bar({value,max=100,label}) { const pct=Math.max(0,Math.min(100,(value/max)*100)); return <div className="bar-wrap">{label&&<div className="bar-label"><span>{label}</span><b>{Math.round(value)}</b></div>}<div className="bar"><i style={{width:`${pct}%`}} /></div></div>; }
export function Money({value}) { return <>{money(value)}</>; }
export function Empty({children}) { return <div className="empty">{children}</div>; }
export function SectionTitle({eyebrow,title,action}) { return <div className="section-title"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action}</div>; }
export function SortHeader({label,sortKey,current,onSort}) { return <button className="sort-head" onClick={()=>onSort(sortKey)}>{label}{current.key===sortKey?<span>{current.dir==='asc'?' ↑':' ↓'}</span>:null}</button>; }
