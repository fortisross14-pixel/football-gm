// Coach passives. Values are the head-coach strength; an assistant gives 50%.

export const COACH_PASSIVES = {
  motivator: { name: 'Motivator', text: '+10% all stats in the second half.', value: 0.1 },
  counterMaster: { name: 'Counter-Attack Master', text: '+20% chance quality when trailing.', value: 0.2 },
  tactician: { name: 'Tactician', text: '+1 boost slot per match.', value: 1 },
  cupSpecialist: { name: 'Cup Specialist', text: '+10% all stats in cup matches.', value: 0.1 },
  ironDiscipline: { name: 'Iron Discipline', text: '+8% team DEF.', value: 0.08 },
  attackMinded: { name: 'Attack Minded', text: '+8% team ATT.', value: 0.08 },
  fitnessGuru: { name: 'Fitness Guru', text: 'Stamina drains 25% slower.', value: 0.25 },
};
