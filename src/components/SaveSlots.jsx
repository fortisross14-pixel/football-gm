import React,{useMemo,useState} from 'react';
import {deleteSaveSlot,getSlotSummaries,persistenceStatus,renameSaveSlot} from '../game/storage.js';
import {money} from '../game/v4.js';

function prettyDate(iso){if(!iso)return 'Sin fecha';try{return new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${iso}T12:00:00Z`));}catch{return iso;}}

export default function SaveSlots({onContinue,onNew}){
  const [slots,setSlots]=useState(()=>getSlotSummaries());
  const [names,setNames]=useState(()=>Object.fromEntries([1,2,3].map(id=>[id,`Mi carrera ${id}`])));
  const [renaming,setRenaming]=useState(null);
  const [renameValue,setRenameValue]=useState('');
  const storage=useMemo(()=>persistenceStatus(),[]);
  const refresh=()=>setSlots(getSlotSummaries());
  const beginRename=s=>{setRenaming(s.id);setRenameValue(s.slotName)};
  const commitRename=id=>{const result=renameSaveSlot(id,renameValue);if(result.ok){setRenaming(null);refresh();}};
  const remove=s=>{if(window.confirm(`¿Borrar “${s.slotName}”? Esta acción no se puede deshacer.`)){deleteSaveSlot(s.id);refresh();}};
  return <div className="save-shell"><header className="save-brand"><div className="brand-mark">DG</div><div><b>FÚTBOL</b><span>DIRECTOR GENERAL</span></div><small>v0.4.1 · mobile stability</small></header><main className="save-home"><div className="save-home-head"><div><span>PARTIDAS</span><h1>Elige tu carrera</h1><p>Tres slots independientes. La partida se guarda automáticamente después de cada decisión y también puedes guardarla manualmente desde el despacho.</p></div><div className={`storage-state ${storage.ok?'ok':'bad'}`}><b>{storage.ok?'● Guardado activo':'● Guardado bloqueado'}</b><span>{storage.label}</span></div></div><div className="save-slot-grid">{slots.map(s=><article className={`save-slot ${s.empty?'empty-slot':''}`} key={s.id}><div className="save-slot-number">{s.id}</div>{s.empty?<><span>SLOT VACÍO</span><h2>Nueva carrera</h2><label>Nombre de esta partida<input value={names[s.id]} maxLength={32} onChange={e=>setNames({...names,[s.id]:e.target.value})}/></label><button className="primary wide" disabled={!names[s.id].trim()} onClick={()=>onNew(s.id,names[s.id].trim())}>Crear partida</button></>:<><span>PARTIDA GUARDADA</span>{renaming===s.id?<div className="rename-save"><input value={renameValue} maxLength={32} autoFocus onChange={e=>setRenameValue(e.target.value)}/><button onClick={()=>commitRename(s.id)}>OK</button></div>:<h2>{s.slotName}</h2>}<div className="save-club"><b>{s.clubName}</b><span>{s.gmName}</span></div><div className="save-meta"><div><small>Fecha</small><b>{prettyDate(s.gameDate)}</b></div><div><small>Posición</small><b>{s.position?`${s.position}º`:'—'}</b></div><div><small>Caja</small><b>{money(s.cash)}</b></div></div><button className="primary wide" onClick={()=>onContinue(s.id)}>Continuar</button><div className="save-slot-actions"><button onClick={()=>beginRename(s)}>Renombrar</button><button className="danger-ghost" onClick={()=>remove(s)}>Borrar</button></div></>}</article>)}</div></main></div>;
}
