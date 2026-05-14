export const MUSCLE_TAG_COLORS = (muscle: string): string => {
  if (['Chest', 'Delts', 'Triceps'].includes(muscle))
    return 'bg-red-950 text-red-400 hover:bg-red-950'
  if (['Back', 'Biceps'].includes(muscle))
    return 'bg-blue-950 text-blue-400 hover:bg-blue-950'
  if (['Quads', 'Hamstrings', 'Glutes', 'Calves'].includes(muscle))
    return 'bg-emerald-950 text-emerald-400 hover:bg-emerald-950'
  return 'bg-yellow-950 text-yellow-400 hover:bg-yellow-950'
}

export const MUSCLE_GROUPS = {
  Chest: ['Upper', 'Middle', 'Lower'],
  Delts: ['Front', 'Side', 'Rear'],
  Back: ['Traps', 'Rhomboids', 'Teres major', 'Lats'],
  Biceps: [],
  Triceps: ['Long', 'Lateral and medial'],
  Quads: [],
  Hamstrings: [],
  Glutes: [],
  Calves: [],
  Core: [],
}
