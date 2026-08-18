const DB_NAME = 'football-director-saves';
const DB_VERSION = 1;
const STORE = 'slots';
const LEGACY_INDEX_KEY = 'football-director-save-slots-v1';
const LEGACY_GAME_KEY = 'football-director-poc-v4';
const LEGACY_SLOT_PREFIX = 'football-director-save-v1-slot-';
export const SLOT_IDS = [1, 2, 3];

let dbPromise = null;
let migrationPromise = null;

function hasWindow(){ return typeof window !== 'undefined'; }
function hasIndexedDB(){ return hasWindow() && 'indexedDB' in window && window.indexedDB; }
function hasLocalStorage(){
  try{
    if(!hasWindow() || !window.localStorage) return false;
    const k='__fdg_storage_probe__';
    window.localStorage.setItem(k,'1');
    window.localStorage.removeItem(k);
    return true;
  }catch{return false;}
}
function safeLocalGet(key){ try{return hasWindow()&&window.localStorage?window.localStorage.getItem(key):null;}catch{return null;} }
function safeLocalRemove(key){ try{if(hasWindow()&&window.localStorage)window.localStorage.removeItem(key);}catch{} }
function safeLocalSet(key,value){
  try{if(!hasWindow()||!window.localStorage)return false;window.localStorage.setItem(key,value);return true;}catch{return false;}
}
function parse(value,fallback=null){try{return value?JSON.parse(value):fallback;}catch{return fallback;}}

function metaFromGame(id, slotName, game) {
  return {
    id:Number(id),
    slotName: slotName?.trim() || `Partida ${id}`,
    gmName: game?.gm?.name || 'Director General',
    clubName: game?.club?.name || 'Club sin seleccionar',
    season: game?.season || 1,
    gameDate: game?.calendarISO || null,
    position: game?.table && game?.club ? Math.max(1, game.table.findIndex(x=>x.id===game.club.id)+1) : null,
    cash: Number(game?.cash || 0),
    updatedAt: new Date().toISOString(),
  };
}
function emptySummary(id){return {id,empty:true,slotName:`Partida ${id}`};}

function openDB(){
  if(!hasIndexedDB()) return Promise.resolve(null);
  if(dbPromise) return dbPromise;
  dbPromise = new Promise((resolve,reject)=>{
    const req=window.indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE,{keyPath:'id'});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error || new Error('No se pudo abrir IndexedDB.'));
    req.onblocked=()=>reject(new Error('El almacenamiento está bloqueado por otra pestaña.'));
  }).catch(error=>{dbPromise=null;throw error;});
  return dbPromise;
}

async function idbGet(id){
  const db=await openDB();if(!db)return null;
  return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(Number(id));req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});
}
async function idbGetAll(){
  const db=await openDB();if(!db)return [];
  return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});
}
async function idbPut(record){
  const db=await openDB();if(!db)return false;
  return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Guardado cancelado.'));tx.objectStore(STORE).put(record);});
}
async function idbDelete(id){
  const db=await openDB();if(!db)return false;
  return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);tx.objectStore(STORE).delete(Number(id));});
}

// Tiny localStorage fallback for environments without IndexedDB. It is not the
// primary browser save system; normal mobile/desktop play uses IndexedDB.
function fallbackKey(id){return `football-director-fallback-slot-${id}`;}
function fallbackLoad(id){return parse(safeLocalGet(fallbackKey(id)),null);}
function fallbackSave(record){
  if(!safeLocalSet(fallbackKey(record.id),JSON.stringify(record))) throw new Error('El navegador no ofrece espacio suficiente para guardar esta partida.');
}
function fallbackDelete(id){safeLocalRemove(fallbackKey(id));}

async function requestPersistentStorage(){
  try{
    if(hasWindow() && navigator?.storage?.persist) await navigator.storage.persist();
  }catch{}
}

async function migrateLegacyOnce(){
  if(migrationPromise)return migrationPromise;
  migrationPromise=(async()=>{
    if(!hasIndexedDB())return;
    const existing=await idbGetAll();
    const existingIds=new Set(existing.map(x=>Number(x.id)));
    const legacyIndex=parse(safeLocalGet(LEGACY_INDEX_KEY),{slots:{}})||{slots:{}};
    let migratedAny=false;
    for(const id of SLOT_IDS){
      if(existingIds.has(id))continue;
      let game=parse(safeLocalGet(`${LEGACY_SLOT_PREFIX}${id}`),null);
      if(!game?.club||!game?.gm)game=parse(safeLocalGet(`${LEGACY_SLOT_PREFIX}${id}-backup`),null);
      if(!game?.club||!game?.gm)continue;
      const slotName=legacyIndex?.slots?.[id]?.slotName || `Partida ${id}`;
      await idbPut({id,slotName,game,meta:metaFromGame(id,slotName,game),updatedAt:new Date().toISOString()});
      migratedAny=true;
    }
    if(!existingIds.size && !migratedAny){
      const legacyGame=parse(safeLocalGet(LEGACY_GAME_KEY),null);
      if(legacyGame?.club&&legacyGame?.gm){
        const slotName=`${legacyGame.club.name} · ${legacyGame.gm?.name||'GM'}`;
        await idbPut({id:1,slotName,game:legacyGame,meta:metaFromGame(1,slotName,legacyGame),updatedAt:new Date().toISOString()});
        migratedAny=true;
      }
    }
    // Once IndexedDB has the saves, delete the old bulky localStorage payloads.
    // This specifically frees users who already hit the localStorage quota.
    const after=await idbGetAll();
    if(after.length){
      for(const id of SLOT_IDS){safeLocalRemove(`${LEGACY_SLOT_PREFIX}${id}`);safeLocalRemove(`${LEGACY_SLOT_PREFIX}${id}-backup`);}
      safeLocalRemove(LEGACY_GAME_KEY);safeLocalRemove(LEGACY_INDEX_KEY);
    }
    await requestPersistentStorage();
  })().catch(error=>{migrationPromise=null;throw error;});
  return migrationPromise;
}

export async function getSlotSummaries(){
  try{
    await migrateLegacyOnce();
    let records;
    if(hasIndexedDB()) records=await idbGetAll();
    else records=SLOT_IDS.map(fallbackLoad).filter(Boolean);
    const map=new Map(records.map(r=>[Number(r.id),r]));
    return SLOT_IDS.map(id=>{
      const r=map.get(id);if(!r)return emptySummary(id);
      return {...(r.meta||metaFromGame(id,r.slotName,r.game)),slotName:r.slotName||r.meta?.slotName||`Partida ${id}`,empty:false};
    });
  }catch(error){
    return SLOT_IDS.map(emptySummary);
  }
}

export async function loadGameFromSlot(id){
  try{
    await migrateLegacyOnce();
    const r=hasIndexedDB()?await idbGet(id):fallbackLoad(id);
    if(!r?.game?.club||!r?.game?.gm)return {ok:false,error:'No se encontró una partida válida en ese slot.'};
    return {ok:true,game:r.game,meta:r.meta||metaFromGame(id,r.slotName,r.game)};
  }catch(error){return {ok:false,error:error?.message||'No se pudo cargar la partida.'};}
}

export async function saveGameToSlot(id,slotName,game){
  const numericId=Number(id);
  if(!SLOT_IDS.includes(numericId)||!game)return {ok:false,error:'Slot de guardado inválido.'};
  try{
    await migrateLegacyOnce();
    const existing=hasIndexedDB()?await idbGet(numericId):fallbackLoad(numericId);
    const cleanName=(slotName||existing?.slotName||`Partida ${numericId}`).trim();
    const meta=metaFromGame(numericId,cleanName,game);
    const record={id:numericId,slotName:cleanName,game,meta,updatedAt:meta.updatedAt};
    if(hasIndexedDB())await idbPut(record);else fallbackSave(record);
    return {ok:true,meta,backend:hasIndexedDB()?'IndexedDB':'localStorage'};
  }catch(error){
    const quota=error?.name==='QuotaExceededError'||/quota|space|espacio/i.test(String(error?.message||''));
    return {ok:false,error:quota?'El almacenamiento del navegador está lleno. Libera espacio del sitio o exporta la partida.':(error?.message||'No se pudo guardar la partida.')};
  }
}

export async function renameSaveSlot(id,slotName){
  const clean=String(slotName||'').trim();if(!clean)return {ok:false,error:'Escribe un nombre para la partida.'};
  try{
    await migrateLegacyOnce();
    const r=hasIndexedDB()?await idbGet(id):fallbackLoad(id);if(!r)return {ok:false,error:'Ese slot está vacío.'};
    r.slotName=clean;r.meta={...(r.meta||metaFromGame(id,clean,r.game)),slotName:clean,updatedAt:new Date().toISOString()};r.updatedAt=r.meta.updatedAt;
    if(hasIndexedDB())await idbPut(r);else fallbackSave(r);return {ok:true};
  }catch(error){return {ok:false,error:error?.message||'No se pudo renombrar la partida.'};}
}

export async function deleteSaveSlot(id){
  try{await migrateLegacyOnce();if(hasIndexedDB())await idbDelete(id);else fallbackDelete(id);return {ok:true};}
  catch(error){return {ok:false,error:error?.message||'No se pudo borrar la partida.'};}
}

export async function persistenceStatus(){
  const backend=hasIndexedDB()?'IndexedDB':(hasLocalStorage()?'localStorage':null);
  let usage=null,quota=null,persisted=null;
  try{
    if(hasWindow()&&navigator?.storage?.estimate){const est=await navigator.storage.estimate();usage=est.usage??null;quota=est.quota??null;}
    if(hasWindow()&&navigator?.storage?.persisted)persisted=await navigator.storage.persisted();
  }catch{}
  return backend
    ? {ok:true,label:backend==='IndexedDB'?'Guardado ampliado para móvil (IndexedDB)':'Guardado local de compatibilidad',backend,usage,quota,persisted}
    : {ok:false,label:'Este navegador está bloqueando el almacenamiento local',backend:null,usage,quota,persisted};
}
