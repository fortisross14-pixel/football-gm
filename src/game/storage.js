const INDEX_KEY = 'football-director-save-slots-v1';
const LEGACY_KEY = 'football-director-poc-v4';
const SLOT_PREFIX = 'football-director-save-v1-slot-';
export const SLOT_IDS = [1, 2, 3];

function storageAvailable() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const key = '__fdg_storage_test__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function safeGet(key) {
  try { return storageAvailable() ? window.localStorage.getItem(key) : null; }
  catch { return null; }
}
function safeSet(key, value) {
  try {
    if (!storageAvailable()) return {ok:false,error:'El navegador no permite almacenamiento local.'};
    window.localStorage.setItem(key, value);
    return {ok:true};
  } catch (error) {
    return {ok:false,error:error?.message || 'No se pudo escribir la partida.'};
  }
}
function safeRemove(key) {
  try { if (storageAvailable()) window.localStorage.removeItem(key); return {ok:true}; }
  catch (error) { return {ok:false,error:error?.message || 'No se pudo borrar la partida.'}; }
}
function parse(value, fallback) {
  try { return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}
function emptyIndex() { return {version:1,slots:{}}; }
function readIndexRaw() { return parse(safeGet(INDEX_KEY), emptyIndex()); }
function writeIndex(index) { return safeSet(INDEX_KEY, JSON.stringify(index)); }
function slotKey(id) { return `${SLOT_PREFIX}${id}`; }
function backupKey(id) { return `${SLOT_PREFIX}${id}-backup`; }
function metaFromGame(id, slotName, game) {
  return {
    id,
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

function migrateLegacy() {
  const index = readIndexRaw();
  if (Object.keys(index.slots || {}).length) return;
  const legacyText = safeGet(LEGACY_KEY);
  if (!legacyText) return;
  const legacyGame = parse(legacyText, null);
  if (!legacyGame?.club) return;
  const slotName = `${legacyGame.club.name} · ${legacyGame.gm?.name || 'GM'}`;
  const gameWrite = safeSet(slotKey(1), JSON.stringify(legacyGame));
  if (!gameWrite.ok) return;
  index.slots = {1: metaFromGame(1, slotName, legacyGame)};
  writeIndex(index);
}

export function getSlotSummaries() {
  migrateLegacy();
  const index = readIndexRaw();
  let repaired=false;
  for(const id of SLOT_IDS){
    if(index.slots?.[id]) continue;
    const recovered=parse(safeGet(slotKey(id)),null);
    if(recovered?.club&&recovered?.gm){index.slots={...(index.slots||{}),[id]:metaFromGame(id,`Partida ${id}`,recovered)};repaired=true;}
  }
  if(repaired) writeIndex(index);
  return SLOT_IDS.map(id => index.slots?.[id] ? {...index.slots[id], empty:false} : {id,empty:true,slotName:`Partida ${id}`});
}

export function loadGameFromSlot(id) {
  const text = safeGet(slotKey(id));
  if (!text) return {ok:false,error:'No se encontró la partida guardada.'};
  let game = parse(text, null);
  if (!game?.club || !game?.gm) game=parse(safeGet(backupKey(id)),null);
  if (!game?.club || !game?.gm) return {ok:false,error:'La partida está dañada o incompleta.'};
  const meta = readIndexRaw().slots?.[id] || metaFromGame(id, `Partida ${id}`, game);
  return {ok:true,game,meta};
}

export function saveGameToSlot(id, slotName, game) {
  if (!SLOT_IDS.includes(Number(id)) || !game) return {ok:false,error:'Slot de guardado inválido.'};
  const payload = JSON.stringify(game);
  const previous=safeGet(slotKey(id));
  if(previous) safeSet(backupKey(id),previous);
  const gameWrite = safeSet(slotKey(id), payload);
  if (!gameWrite.ok) return gameWrite;
  const index = readIndexRaw();
  const meta = metaFromGame(Number(id), slotName || index.slots?.[id]?.slotName, game);
  index.slots = {...(index.slots || {}), [id]:meta};
  const indexWrite = writeIndex(index);
  if (!indexWrite.ok) return indexWrite;
  return {ok:true,meta,bytes:payload.length};
}

export function renameSaveSlot(id, slotName) {
  const clean = String(slotName || '').trim();
  if (!clean) return {ok:false,error:'Escribe un nombre para la partida.'};
  const index = readIndexRaw();
  if (!index.slots?.[id]) return {ok:false,error:'Ese slot está vacío.'};
  index.slots[id] = {...index.slots[id],slotName:clean,updatedAt:new Date().toISOString()};
  return writeIndex(index);
}

export function deleteSaveSlot(id) {
  const removed = safeRemove(slotKey(id));
  safeRemove(backupKey(id));
  if (!removed.ok) return removed;
  const index = readIndexRaw();
  if (index.slots) delete index.slots[id];
  return writeIndex(index);
}

export function persistenceStatus() {
  return storageAvailable()
    ? {ok:true,label:'Guardado local disponible'}
    : {ok:false,label:'Este navegador está bloqueando el guardado local'};
}
