import React,{useState} from 'react';
import {SectionTitle,Metric,Pill} from '../components/UI.jsx';
import {money,facilityBonuses} from '../game/v4.js';
import {merchChannelDefs} from '../data/management.js';
import merchArt from '../assets/merch-stand.svg';

export default function MerchV4({game,produce,upgradeChannel,setPrice}){
  const [qty,setQty]=useState({shirt:100,scarf:100,cap:100});
  const products=[['shirt','Camiseta',17],['scarf','Bufanda',6],['cap','Gorra',8]];
  const inv=Object.values(game.merch.inventory).reduce((a,b)=>a+b,0),cap=facilityBonuses(game).inventoryCap||800;
  const share=game.kit?.manufacturer?.clubShare??100;
  return <><SectionTitle eyebrow="Negocio · Merchandising" title="Producto, stock y canales" action={<Pill>{inv.toLocaleString('es-ES')}/{cap.toLocaleString('es-ES')} uds almacén</Pill>}/>
    <div className="merch-v3-hero"><img src={merchArt} alt=""/><div><span>OPERACIÓN DE RETAIL</span><h2>Fabricar más no significa vender más</h2><p>El capital queda inmovilizado en inventario. La demanda depende de aficionados, resultados, diseño de la equipación y capacidad de los canales.</p></div><Metric label="Ventas temporada" value={money(game.merch.revenueSeason)} sub={game.kit?.manufacturer?`${share}% para el club según fabricante`:'Sin fabricante contratado'}/></div>
    <h3 className="minor-title">Catálogo y producción</h3><div className="product-v3-grid">{products.map(([id,name,cost])=><article key={id}><div className={`product-visual pv-${id}`}><span>{name}</span></div><h3>{name}</h3><div className="product-stats"><span>Stock <b>{game.merch.inventory[id]}</b></span><span>Coste base <b>{money(cost)}</b></span></div><label>Precio de venta<input type="number" min="1" value={game.merch.prices[id]} onChange={e=>setPrice(id,e.target.value)}/></label><label>Lote a fabricar<input type="number" min="1" step="50" value={qty[id]} onChange={e=>setQty({...qty,[id]:Number(e.target.value)})}/></label><button className="primary wide" onClick={()=>produce(id,qty[id])}>Producir {qty[id]} uds</button></article>)}</div>
    <h3 className="minor-title">Canales de venta</h3><div className="channel-grid">{Object.entries(merchChannelDefs).map(([id,d])=>{const level=game.merch.channels[id]||0,current=d.levels[level],next=d.levels[level+1];return <article key={id}><span>CANAL</span><h3>{d.name}</h3><b>{current.name}</b><p>{current.description}</p><div className="channel-cap">Capacidad orientativa <strong>{current.capacity.toLocaleString('es-ES')} uds/sem.</strong></div>{next?<div className="channel-next"><small>Siguiente</small><b>{next.name}</b><span>{next.description}</span><button onClick={()=>upgradeChannel(id)}>Invertir {money(next.cost)}</button></div>:<Pill tone="positive">Máximo desarrollo</Pill>}</article>})}</div>
  </>;
}
