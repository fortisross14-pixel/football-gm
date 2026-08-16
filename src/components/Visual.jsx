import React from 'react';

const formations={
  '4-3-3':[[50,90],[18,72],[38,74],[62,74],[82,72],[28,50],[50,45],[72,50],[20,20],[50,15],[80,20]],
  '4-2-3-1':[[50,90],[18,73],[39,74],[61,74],[82,73],[36,56],[64,56],[20,34],[50,31],[80,34],[50,13]],
  '4-4-2':[[50,90],[18,73],[39,74],[61,74],[82,73],[18,48],[39,50],[61,50],[82,48],[37,19],[63,19]],
  '5-3-2':[[50,90],[10,72],[30,76],[50,78],[70,76],[90,72],[27,48],[50,45],[73,48],[38,18],[62,18]],
  '3-4-2-1':[[50,90],[28,73],[50,77],[72,73],[15,50],[38,51],[62,51],[85,50],[35,30],[65,30],[50,12]],
  '4-1-4-1':[[50,90],[18,73],[39,74],[61,74],[82,73],[50,58],[18,39],[39,40],[61,40],[82,39],[50,14]],
};
export function TacticPitch({formation='4-4-2',compact=false}){
  const pts=formations[formation]||formations['4-4-2'];
  return <div className={`tactic-pitch ${compact?'compact':''}`}><div className="pitch-half"/><div className="pitch-circle"/>{pts.map(([x,y],i)=><span key={i} className={`pitch-player p${i}`} style={{left:`${x}%`,top:`${y}%`}}>{i===0?'P':i}</span>)}</div>;
}

export function MiniRadar({values,labels}){
  const n=values.length;const c=50,r=38;const points=values.map((v,i)=>{const a=(-Math.PI/2)+(Math.PI*2*i/n);const rr=r*(Math.max(0,Math.min(20,v))/20);return `${c+Math.cos(a)*rr},${c+Math.sin(a)*rr}`}).join(' ');
  const grid=[.33,.66,1].map(scale=>Array.from({length:n},(_,i)=>{const a=(-Math.PI/2)+(Math.PI*2*i/n);return `${c+Math.cos(a)*r*scale},${c+Math.sin(a)*r*scale}`}).join(' '));
  return <div className="radar-wrap"><svg viewBox="0 0 100 100" aria-label="Perfil de estilo">{grid.map((p,i)=><polygon key={i} points={p} className="radar-grid"/>)}<polygon points={points} className="radar-shape"/>{values.map((_,i)=>{const a=(-Math.PI/2)+(Math.PI*2*i/n);return <line key={i} x1="50" y1="50" x2={c+Math.cos(a)*r} y2={c+Math.sin(a)*r} className="radar-axis"/>})}</svg><div className="radar-labels">{labels.map((x,i)=><span key={x} className={`rl-${i}`}>{x}</span>)}</div></div>
}

export function ArtCard({image,eyebrow,title,children,className=''}){return <article className={`art-card ${className}`}><img src={image} alt=""/><div className="art-card-copy"><span>{eyebrow}</span><h3>{title}</h3>{children}</div></article>}
