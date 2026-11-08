// Milestone 2: one 8-club division. Ratings and colours are game values.

export const LEAGUE = {
  id: 'esp-3',
  name: 'Spain · Division 3',
  level: 3,
  prizes: [1000, 600, 400, 300, 200, 150, 100, 50],
};

export const AI_CLUBS = [
  { id: 'sporting', name: 'Sporting Gijón', short: 'SPO', rating: 71, formation: '3-2-1', colors: { primary: '#d71920', secondary: '#ffffff', away: '#1b2b4b' }, coach: { passive: 'ironDiscipline' } },
  { id: 'depor', name: 'Deportivo La Coruña', short: 'DEP', rating: 73, formation: '2-3-1', colors: { primary: '#1d4ea3', secondary: '#ffffff', away: '#101820' }, coach: { passive: 'attackMinded' } },
  { id: 'zaragoza', name: 'Real Zaragoza', short: 'ZAR', rating: 70, formation: '2-2-2', colors: { primary: '#f2f2f2', secondary: '#1e4fa0', away: '#1e4fa0' }, coach: { passive: 'motivator' } },
  { id: 'malaga', name: 'Málaga', short: 'MAL', rating: 69, formation: '3-1-2', colors: { primary: '#5eb3e4', secondary: '#ffffff', away: '#202020' }, coach: { passive: 'counterMaster' } },
  { id: 'valladolid', name: 'Real Valladolid', short: 'VLL', rating: 74, formation: '2-3-1', colors: { primary: '#5b2a86', secondary: '#ffffff', away: '#f2f2f2' }, coach: { passive: 'fitnessGuru' } },
  { id: 'granada', name: 'Granada', short: 'GRA', rating: 72, formation: '3-2-1', colors: { primary: '#c8102e', secondary: '#ffffff', away: '#0b2a5b' }, coach: { passive: 'motivator' } },
  { id: 'almeria', name: 'Almería', short: 'ALM', rating: 68, formation: '2-2-2', colors: { primary: '#e2231a', secondary: '#ffffff', away: '#111111' }, coach: { passive: 'attackMinded' } },
];
