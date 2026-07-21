/**
 * Sample roster for a fresh tracker, kept from the original design mock so a new install has
 * something honest to look at. Item dates are relative to seed time, which keeps the
 * "due for review" lens meaningful instead of showing everything as ancient.
 */
export interface TrackerSeedItem {
  kind: 'skill' | 'piece' | 'passage';
  name: string;
  status: 'not_started' | 'lacking' | 'passed';
  attempts: number;
  notes: string;
  /** How long ago this item was last touched, in days. */
  daysAgo: number;
}

export interface TrackerSeedStudent {
  name: string;
  instrument: string;
  checklists: { name: string; items: TrackerSeedItem[] }[];
}

export const trackerSeedStudents: TrackerSeedStudent[] = [
  {
    name: 'Hannah Lee',
    instrument: 'Piano',
    checklists: [
      {
        name: 'Music Reading',
        items: [
          { kind: 'skill', name: 'Can read whole notes', status: 'passed', attempts: 1, notes: 'Great job! Very consistent.', daysAgo: 140 },
          { kind: 'skill', name: 'Can read half notes', status: 'passed', attempts: 3, notes: 'Passed on 3rd try. Keep it up!', daysAgo: 3 },
          { kind: 'skill', name: 'Can read quarter notes', status: 'lacking', attempts: 2, notes: 'Needs more practice with rhythm.', daysAgo: 5 },
          { kind: 'skill', name: 'Can read eighth notes', status: 'not_started', attempts: 0, notes: '', daysAgo: 0 },
          { kind: 'piece', name: 'Piece No. 1', status: 'passed', attempts: 2, notes: 'Nicely done!', daysAgo: 52 },
          { kind: 'piece', name: 'Piece No. 2', status: 'lacking', attempts: 1, notes: 'Work on measure 7-12', daysAgo: 6 },
          { kind: 'piece', name: 'Piece No. 3', status: 'not_started', attempts: 0, notes: '', daysAgo: 0 },
          { kind: 'passage', name: 'Measures 1-18 of Piece No. 1', status: 'passed', attempts: 3, notes: 'Smooth and steady!', daysAgo: 46 },
          { kind: 'passage', name: 'Measures 19-32 of Piece No. 1', status: 'lacking', attempts: 2, notes: 'Watch the dynamics.', daysAgo: 5 },
        ]
      },
      {
        name: 'Scales & Technique',
        items: [
          { kind: 'skill', name: 'C major scale, two octaves', status: 'passed', attempts: 2, notes: 'Even tone throughout.', daysAgo: 8 },
          { kind: 'skill', name: 'G major scale, two octaves', status: 'passed', attempts: 4, notes: 'Thumb tuck is much smoother now.', daysAgo: 7 },
          { kind: 'skill', name: 'A minor scale, two octaves', status: 'lacking', attempts: 3, notes: 'Slow down on the descent.', daysAgo: 9 },
          { kind: 'skill', name: 'Contrary motion, hands together', status: 'not_started', attempts: 0, notes: '', daysAgo: 0 },
          { kind: 'piece', name: 'Hanon No. 1', status: 'passed', attempts: 2, notes: 'Steady at 80 bpm.', daysAgo: 10 },
          { kind: 'piece', name: 'Czerny Op. 599 No. 4', status: 'lacking', attempts: 1, notes: 'Keep the wrist relaxed.', daysAgo: 11 },
          { kind: 'passage', name: 'Measures 1-8 of Hanon No. 1', status: 'passed', attempts: 1, notes: 'Clean and articulate.', daysAgo: 10 },
          { kind: 'passage', name: 'Measures 9-16 of Hanon No. 1', status: 'lacking', attempts: 2, notes: 'Rushing slightly here.', daysAgo: 12 },
        ]
      },
      {
        name: 'Repertoire',
        items: [
          { kind: 'skill', name: 'Plays from memory', status: 'passed', attempts: 3, notes: 'No slips this week.', daysAgo: 1 },
          { kind: 'skill', name: 'Observes dynamic markings', status: 'lacking', attempts: 2, notes: 'More contrast between p and f.', daysAgo: 3 },
          { kind: 'piece', name: 'Minuet in G — Bach', status: 'passed', attempts: 4, notes: 'Ready for the recital.', daysAgo: 1 },
          { kind: 'piece', name: 'Für Elise — opening section', status: 'lacking', attempts: 2, notes: 'Left hand still heavy.', daysAgo: 4 },
          { kind: 'piece', name: 'Gymnopédie No. 1 — Satie', status: 'not_started', attempts: 0, notes: '', daysAgo: 0 },
          { kind: 'passage', name: 'Measures 1-16 of Minuet in G', status: 'passed', attempts: 2, notes: 'Lovely phrasing.', daysAgo: 2 },
          { kind: 'passage', name: 'Trio section of Minuet in G', status: 'passed', attempts: 3, notes: 'Much more confident.', daysAgo: 1 },
        ]
      },
    ]
  },
  {
    name: 'Ethan Park',
    instrument: 'Guitar',
    checklists: [
      {
        name: 'Music Reading',
        items: [
          { kind: 'skill', name: 'Can read whole notes', status: 'passed', attempts: 2, notes: 'Solid.', daysAgo: 10 },
          { kind: 'skill', name: 'Can read half notes', status: 'lacking', attempts: 3, notes: 'Counting out loud helps.', daysAgo: 8 },
          { kind: 'skill', name: 'Can read quarter notes', status: 'not_started', attempts: 0, notes: '', daysAgo: 0 },
          { kind: 'skill', name: 'Reads tablature fluently', status: 'passed', attempts: 1, notes: 'Prefers tab to notation.', daysAgo: 9 },
          { kind: 'piece', name: 'Piece No. 1', status: 'lacking', attempts: 2, notes: 'Losing the beat at the repeat.', daysAgo: 11 },
          { kind: 'piece', name: 'Piece No. 2', status: 'not_started', attempts: 0, notes: '', daysAgo: 0 },
          { kind: 'passage', name: 'Measures 1-12 of Piece No. 1', status: 'lacking', attempts: 1, notes: 'Take it at half speed next week.', daysAgo: 11 },
        ]
      },
      {
        name: 'Scales & Technique',
        items: [
          { kind: 'skill', name: 'E minor pentatonic, position 1', status: 'passed', attempts: 2, notes: 'Clean alternate picking.', daysAgo: 7 },
          { kind: 'skill', name: 'Open chord changes: G–C–D', status: 'passed', attempts: 5, notes: 'Passed on 5th try. Big improvement.', daysAgo: 6 },
          { kind: 'skill', name: 'Barre chord: F major', status: 'lacking', attempts: 4, notes: 'B string still buzzing.', daysAgo: 5 },
          { kind: 'skill', name: 'Palm muting control', status: 'not_started', attempts: 0, notes: '', daysAgo: 0 },
          { kind: 'piece', name: 'Chromatic warm-up', status: 'passed', attempts: 1, notes: 'Good hand position.', daysAgo: 8 },
          { kind: 'passage', name: 'G–C change, 60 bpm', status: 'lacking', attempts: 3, notes: 'Almost there — keep the metronome on.', daysAgo: 6 },
        ]
      },
      {
        name: 'Repertoire',
        items: [
          { kind: 'skill', name: 'Plays and sings together', status: 'lacking', attempts: 2, notes: 'Strumming drops when he sings.', daysAgo: 4 },
          { kind: 'piece', name: 'Horse with No Name', status: 'passed', attempts: 2, notes: 'Two chords, fully solid.', daysAgo: 63 },
          { kind: 'piece', name: 'Wonderwall — verse', status: 'passed', attempts: 3, notes: 'Capo on 2, sounds great.', daysAgo: 4 },
          { kind: 'piece', name: 'Blackbird — Beatles', status: 'not_started', attempts: 0, notes: '', daysAgo: 0 },
          { kind: 'passage', name: 'Chorus of Wonderwall', status: 'lacking', attempts: 1, notes: 'Work on the change into Cadd9.', daysAgo: 4 },
        ]
      },
    ]
  },
  {
    name: 'Sofia Martinez',
    instrument: 'Violin',
    checklists: [
      {
        name: 'Music Reading',
        items: [
          { kind: 'skill', name: 'Can read whole notes', status: 'passed', attempts: 1, notes: 'Effortless.', daysAgo: 2 },
          { kind: 'skill', name: 'Can read half notes', status: 'passed', attempts: 1, notes: 'Effortless.', daysAgo: 2 },
          { kind: 'skill', name: 'Can read quarter notes', status: 'passed', attempts: 2, notes: 'Very reliable now.', daysAgo: 3 },
          { kind: 'skill', name: 'Can read eighth notes', status: 'passed', attempts: 3, notes: 'Passed on 3rd try.', daysAgo: 1 },
          { kind: 'skill', name: 'Reads key signatures up to 3 sharps', status: 'lacking', attempts: 2, notes: 'Forgets the D# in E major.', daysAgo: 4 },
          { kind: 'piece', name: 'Piece No. 1', status: 'passed', attempts: 1, notes: 'Sight-read it perfectly.', daysAgo: 3 },
          { kind: 'piece', name: 'Piece No. 2', status: 'passed', attempts: 2, notes: 'Lovely tone.', daysAgo: 2 },
          { kind: 'passage', name: 'Measures 1-24 of Piece No. 2', status: 'passed', attempts: 2, notes: 'Beautiful phrasing.', daysAgo: 1 },
        ]
      },
      {
        name: 'Scales & Technique',
        items: [
          { kind: 'skill', name: 'D major scale, one octave', status: 'passed', attempts: 1, notes: 'Excellent intonation.', daysAgo: 6 },
          { kind: 'skill', name: 'A major scale, two octaves', status: 'passed', attempts: 2, notes: 'Shifts are clean.', daysAgo: 5 },
          { kind: 'skill', name: 'Détaché bowing', status: 'passed', attempts: 2, notes: 'Even bow distribution.', daysAgo: 7 },
          { kind: 'skill', name: 'Vibrato, sustained notes', status: 'lacking', attempts: 3, notes: 'Still a little tight in the wrist.', daysAgo: 4 },
          { kind: 'skill', name: 'Third position shifting', status: 'passed', attempts: 4, notes: 'Big win this month.', daysAgo: 3 },
          { kind: 'piece', name: 'Ševčík Op. 1 No. 1', status: 'passed', attempts: 2, notes: 'Accurate and steady.', daysAgo: 34 },
          { kind: 'passage', name: 'Shifting drill, 1st to 3rd position', status: 'passed', attempts: 3, notes: 'Landing in tune consistently.', daysAgo: 3 },
          { kind: 'passage', name: 'Vibrato drill, slow tempo', status: 'lacking', attempts: 2, notes: 'Keep practising away from the violin.', daysAgo: 4 },
        ]
      },
      {
        name: 'Repertoire',
        items: [
          { kind: 'skill', name: 'Plays from memory', status: 'passed', attempts: 2, notes: 'Whole concerto movement, no music.', daysAgo: 1 },
          { kind: 'skill', name: 'Performs with accompaniment', status: 'passed', attempts: 3, notes: 'Listens well to the pianist.', daysAgo: 2 },
          { kind: 'piece', name: 'Vivaldi Concerto in A minor, 1st mvt', status: 'passed', attempts: 5, notes: 'Recital ready.', daysAgo: 1 },
          { kind: 'piece', name: 'Meditation from Thaïs', status: 'lacking', attempts: 2, notes: 'The high register needs more bow.', daysAgo: 3 },
          { kind: 'piece', name: 'Bach Double, Violin I', status: 'passed', attempts: 3, notes: 'Ready to rehearse with a partner.', daysAgo: 2 },
          { kind: 'passage', name: 'Measures 1-32 of Vivaldi A minor', status: 'passed', attempts: 2, notes: 'Crisp and confident.', daysAgo: 1 },
          { kind: 'passage', name: 'Cadenza of Vivaldi A minor', status: 'passed', attempts: 4, notes: 'Tempo is finally settled.', daysAgo: 1 },
        ]
      },
    ]
  },
];
