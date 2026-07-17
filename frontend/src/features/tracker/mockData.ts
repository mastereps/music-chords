import type { Student } from './trackerTypes';

/** Dates are relative to load time so the sample never goes stale and the review flags stay meaningful. */
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

/**
 * Design-time sample data. Percentages are never stored here — they are computed from
 * these statuses by `progress.ts`, so editing a row in the UI moves the bars for real.
 *
 * A few passed items are deliberately aged past their review threshold (see `review.ts`)
 * so the "Review due" lens has something honest to show on first load.
 */
export const mockStudents: Student[] = [
  {
    id: 'hannah-lee',
    name: 'Hannah Lee',
    instrument: 'Piano',
    avatarInitials: 'HL',
    checklists: [
      {
        id: 'hannah-music-reading',
        name: 'Music Reading',
        items: [
          {
            id: 'hannah-mr-1',
            kind: 'skill',
            name: 'Can read whole notes',
            status: 'passed',
            attempts: 1,
            notes: 'Great job! Very consistent.',
            updatedAt: daysAgo(140)
          },
          {
            id: 'hannah-mr-2',
            kind: 'skill',
            name: 'Can read half notes',
            status: 'passed',
            attempts: 3,
            notes: 'Passed on 3rd try. Keep it up!',
            updatedAt: daysAgo(3)
          },
          {
            id: 'hannah-mr-3',
            kind: 'skill',
            name: 'Can read quarter notes',
            status: 'lacking',
            attempts: 2,
            notes: 'Needs more practice with rhythm.',
            updatedAt: daysAgo(5)
          },
          {
            id: 'hannah-mr-4',
            kind: 'skill',
            name: 'Can read eighth notes',
            status: 'not_started',
            attempts: 0,
            notes: '',
            updatedAt: null
          },
          {
            id: 'hannah-mr-5',
            kind: 'piece',
            name: 'Piece No. 1',
            status: 'passed',
            attempts: 2,
            notes: 'Nicely done!',
            updatedAt: daysAgo(52)
          },
          {
            id: 'hannah-mr-6',
            kind: 'piece',
            name: 'Piece No. 2',
            status: 'lacking',
            attempts: 1,
            notes: 'Work on measure 7-12',
            updatedAt: daysAgo(6)
          },
          {
            id: 'hannah-mr-7',
            kind: 'piece',
            name: 'Piece No. 3',
            status: 'not_started',
            attempts: 0,
            notes: '',
            updatedAt: null
          },
          {
            id: 'hannah-mr-8',
            kind: 'passage',
            name: 'Measures 1-18 of Piece No. 1',
            status: 'passed',
            attempts: 3,
            notes: 'Smooth and steady!',
            updatedAt: daysAgo(46)
          },
          {
            id: 'hannah-mr-9',
            kind: 'passage',
            name: 'Measures 19-32 of Piece No. 1',
            status: 'lacking',
            attempts: 2,
            notes: 'Watch the dynamics.',
            updatedAt: daysAgo(5)
          }
        ]
      },
      {
        id: 'hannah-scales',
        name: 'Scales & Technique',
        items: [
          {
            id: 'hannah-st-1',
            kind: 'skill',
            name: 'C major scale, two octaves',
            status: 'passed',
            attempts: 2,
            notes: 'Even tone throughout.',
            updatedAt: daysAgo(8)
          },
          {
            id: 'hannah-st-2',
            kind: 'skill',
            name: 'G major scale, two octaves',
            status: 'passed',
            attempts: 4,
            notes: 'Thumb tuck is much smoother now.',
            updatedAt: daysAgo(7)
          },
          {
            id: 'hannah-st-3',
            kind: 'skill',
            name: 'A minor scale, two octaves',
            status: 'lacking',
            attempts: 3,
            notes: 'Slow down on the descent.',
            updatedAt: daysAgo(9)
          },
          {
            id: 'hannah-st-4',
            kind: 'skill',
            name: 'Contrary motion, hands together',
            status: 'not_started',
            attempts: 0,
            notes: '',
            updatedAt: null
          },
          {
            id: 'hannah-st-5',
            kind: 'piece',
            name: 'Hanon No. 1',
            status: 'passed',
            attempts: 2,
            notes: 'Steady at 80 bpm.',
            updatedAt: daysAgo(10)
          },
          {
            id: 'hannah-st-6',
            kind: 'piece',
            name: 'Czerny Op. 599 No. 4',
            status: 'lacking',
            attempts: 1,
            notes: 'Keep the wrist relaxed.',
            updatedAt: daysAgo(11)
          },
          {
            id: 'hannah-st-7',
            kind: 'passage',
            name: 'Measures 1-8 of Hanon No. 1',
            status: 'passed',
            attempts: 1,
            notes: 'Clean and articulate.',
            updatedAt: daysAgo(10)
          },
          {
            id: 'hannah-st-8',
            kind: 'passage',
            name: 'Measures 9-16 of Hanon No. 1',
            status: 'lacking',
            attempts: 2,
            notes: 'Rushing slightly here.',
            updatedAt: daysAgo(12)
          }
        ]
      },
      {
        id: 'hannah-repertoire',
        name: 'Repertoire',
        items: [
          {
            id: 'hannah-rp-1',
            kind: 'skill',
            name: 'Plays from memory',
            status: 'passed',
            attempts: 3,
            notes: 'No slips this week.',
            updatedAt: daysAgo(1)
          },
          {
            id: 'hannah-rp-2',
            kind: 'skill',
            name: 'Observes dynamic markings',
            status: 'lacking',
            attempts: 2,
            notes: 'More contrast between p and f.',
            updatedAt: daysAgo(3)
          },
          {
            id: 'hannah-rp-3',
            kind: 'piece',
            name: 'Minuet in G — Bach',
            status: 'passed',
            attempts: 4,
            notes: 'Ready for the recital.',
            updatedAt: daysAgo(1)
          },
          {
            id: 'hannah-rp-4',
            kind: 'piece',
            name: 'Für Elise — opening section',
            status: 'lacking',
            attempts: 2,
            notes: 'Left hand still heavy.',
            updatedAt: daysAgo(4)
          },
          {
            id: 'hannah-rp-5',
            kind: 'piece',
            name: 'Gymnopédie No. 1 — Satie',
            status: 'not_started',
            attempts: 0,
            notes: '',
            updatedAt: null
          },
          {
            id: 'hannah-rp-6',
            kind: 'passage',
            name: 'Measures 1-16 of Minuet in G',
            status: 'passed',
            attempts: 2,
            notes: 'Lovely phrasing.',
            updatedAt: daysAgo(2)
          },
          {
            id: 'hannah-rp-7',
            kind: 'passage',
            name: 'Trio section of Minuet in G',
            status: 'passed',
            attempts: 3,
            notes: 'Much more confident.',
            updatedAt: daysAgo(1)
          }
        ]
      }
    ]
  },
  {
    id: 'ethan-park',
    name: 'Ethan Park',
    instrument: 'Guitar',
    avatarInitials: 'EP',
    checklists: [
      {
        id: 'ethan-music-reading',
        name: 'Music Reading',
        items: [
          {
            id: 'ethan-mr-1',
            kind: 'skill',
            name: 'Can read whole notes',
            status: 'passed',
            attempts: 2,
            notes: 'Solid.',
            updatedAt: daysAgo(10)
          },
          {
            id: 'ethan-mr-2',
            kind: 'skill',
            name: 'Can read half notes',
            status: 'lacking',
            attempts: 3,
            notes: 'Counting out loud helps.',
            updatedAt: daysAgo(8)
          },
          {
            id: 'ethan-mr-3',
            kind: 'skill',
            name: 'Can read quarter notes',
            status: 'not_started',
            attempts: 0,
            notes: '',
            updatedAt: null
          },
          {
            id: 'ethan-mr-4',
            kind: 'skill',
            name: 'Reads tablature fluently',
            status: 'passed',
            attempts: 1,
            notes: 'Prefers tab to notation.',
            updatedAt: daysAgo(9)
          },
          {
            id: 'ethan-mr-5',
            kind: 'piece',
            name: 'Piece No. 1',
            status: 'lacking',
            attempts: 2,
            notes: 'Losing the beat at the repeat.',
            updatedAt: daysAgo(11)
          },
          {
            id: 'ethan-mr-6',
            kind: 'piece',
            name: 'Piece No. 2',
            status: 'not_started',
            attempts: 0,
            notes: '',
            updatedAt: null
          },
          {
            id: 'ethan-mr-7',
            kind: 'passage',
            name: 'Measures 1-12 of Piece No. 1',
            status: 'lacking',
            attempts: 1,
            notes: 'Take it at half speed next week.',
            updatedAt: daysAgo(11)
          }
        ]
      },
      {
        id: 'ethan-scales',
        name: 'Scales & Technique',
        items: [
          {
            id: 'ethan-st-1',
            kind: 'skill',
            name: 'E minor pentatonic, position 1',
            status: 'passed',
            attempts: 2,
            notes: 'Clean alternate picking.',
            updatedAt: daysAgo(7)
          },
          {
            id: 'ethan-st-2',
            kind: 'skill',
            name: 'Open chord changes: G–C–D',
            status: 'passed',
            attempts: 5,
            notes: 'Passed on 5th try. Big improvement.',
            updatedAt: daysAgo(6)
          },
          {
            id: 'ethan-st-3',
            kind: 'skill',
            name: 'Barre chord: F major',
            status: 'lacking',
            attempts: 4,
            notes: 'B string still buzzing.',
            updatedAt: daysAgo(5)
          },
          {
            id: 'ethan-st-4',
            kind: 'skill',
            name: 'Palm muting control',
            status: 'not_started',
            attempts: 0,
            notes: '',
            updatedAt: null
          },
          {
            id: 'ethan-st-5',
            kind: 'piece',
            name: 'Chromatic warm-up',
            status: 'passed',
            attempts: 1,
            notes: 'Good hand position.',
            updatedAt: daysAgo(8)
          },
          {
            id: 'ethan-st-6',
            kind: 'passage',
            name: 'G–C change, 60 bpm',
            status: 'lacking',
            attempts: 3,
            notes: 'Almost there — keep the metronome on.',
            updatedAt: daysAgo(6)
          }
        ]
      },
      {
        id: 'ethan-repertoire',
        name: 'Repertoire',
        items: [
          {
            id: 'ethan-rp-1',
            kind: 'skill',
            name: 'Plays and sings together',
            status: 'lacking',
            attempts: 2,
            notes: 'Strumming drops when he sings.',
            updatedAt: daysAgo(4)
          },
          {
            id: 'ethan-rp-2',
            kind: 'piece',
            name: 'Horse with No Name',
            status: 'passed',
            attempts: 2,
            notes: 'Two chords, fully solid.',
            updatedAt: daysAgo(63)
          },
          {
            id: 'ethan-rp-3',
            kind: 'piece',
            name: 'Wonderwall — verse',
            status: 'passed',
            attempts: 3,
            notes: 'Capo on 2, sounds great.',
            updatedAt: daysAgo(4)
          },
          {
            id: 'ethan-rp-4',
            kind: 'piece',
            name: 'Blackbird — Beatles',
            status: 'not_started',
            attempts: 0,
            notes: '',
            updatedAt: null
          },
          {
            id: 'ethan-rp-5',
            kind: 'passage',
            name: 'Chorus of Wonderwall',
            status: 'lacking',
            attempts: 1,
            notes: 'Work on the change into Cadd9.',
            updatedAt: daysAgo(4)
          }
        ]
      }
    ]
  },
  {
    id: 'sofia-martinez',
    name: 'Sofia Martinez',
    instrument: 'Violin',
    avatarInitials: 'SM',
    checklists: [
      {
        id: 'sofia-music-reading',
        name: 'Music Reading',
        items: [
          {
            id: 'sofia-mr-1',
            kind: 'skill',
            name: 'Can read whole notes',
            status: 'passed',
            attempts: 1,
            notes: 'Effortless.',
            updatedAt: daysAgo(2)
          },
          {
            id: 'sofia-mr-2',
            kind: 'skill',
            name: 'Can read half notes',
            status: 'passed',
            attempts: 1,
            notes: 'Effortless.',
            updatedAt: daysAgo(2)
          },
          {
            id: 'sofia-mr-3',
            kind: 'skill',
            name: 'Can read quarter notes',
            status: 'passed',
            attempts: 2,
            notes: 'Very reliable now.',
            updatedAt: daysAgo(3)
          },
          {
            id: 'sofia-mr-4',
            kind: 'skill',
            name: 'Can read eighth notes',
            status: 'passed',
            attempts: 3,
            notes: 'Passed on 3rd try.',
            updatedAt: daysAgo(1)
          },
          {
            id: 'sofia-mr-5',
            kind: 'skill',
            name: 'Reads key signatures up to 3 sharps',
            status: 'lacking',
            attempts: 2,
            notes: 'Forgets the D# in E major.',
            updatedAt: daysAgo(4)
          },
          {
            id: 'sofia-mr-6',
            kind: 'piece',
            name: 'Piece No. 1',
            status: 'passed',
            attempts: 1,
            notes: 'Sight-read it perfectly.',
            updatedAt: daysAgo(3)
          },
          {
            id: 'sofia-mr-7',
            kind: 'piece',
            name: 'Piece No. 2',
            status: 'passed',
            attempts: 2,
            notes: 'Lovely tone.',
            updatedAt: daysAgo(2)
          },
          {
            id: 'sofia-mr-8',
            kind: 'passage',
            name: 'Measures 1-24 of Piece No. 2',
            status: 'passed',
            attempts: 2,
            notes: 'Beautiful phrasing.',
            updatedAt: daysAgo(1)
          }
        ]
      },
      {
        id: 'sofia-scales',
        name: 'Scales & Technique',
        items: [
          {
            id: 'sofia-st-1',
            kind: 'skill',
            name: 'D major scale, one octave',
            status: 'passed',
            attempts: 1,
            notes: 'Excellent intonation.',
            updatedAt: daysAgo(6)
          },
          {
            id: 'sofia-st-2',
            kind: 'skill',
            name: 'A major scale, two octaves',
            status: 'passed',
            attempts: 2,
            notes: 'Shifts are clean.',
            updatedAt: daysAgo(5)
          },
          {
            id: 'sofia-st-3',
            kind: 'skill',
            name: 'Détaché bowing',
            status: 'passed',
            attempts: 2,
            notes: 'Even bow distribution.',
            updatedAt: daysAgo(7)
          },
          {
            id: 'sofia-st-4',
            kind: 'skill',
            name: 'Vibrato, sustained notes',
            status: 'lacking',
            attempts: 3,
            notes: 'Still a little tight in the wrist.',
            updatedAt: daysAgo(4)
          },
          {
            id: 'sofia-st-5',
            kind: 'skill',
            name: 'Third position shifting',
            status: 'passed',
            attempts: 4,
            notes: 'Big win this month.',
            updatedAt: daysAgo(3)
          },
          {
            id: 'sofia-st-6',
            kind: 'piece',
            name: 'Ševčík Op. 1 No. 1',
            status: 'passed',
            attempts: 2,
            notes: 'Accurate and steady.',
            updatedAt: daysAgo(34)
          },
          {
            id: 'sofia-st-7',
            kind: 'passage',
            name: 'Shifting drill, 1st to 3rd position',
            status: 'passed',
            attempts: 3,
            notes: 'Landing in tune consistently.',
            updatedAt: daysAgo(3)
          },
          {
            id: 'sofia-st-8',
            kind: 'passage',
            name: 'Vibrato drill, slow tempo',
            status: 'lacking',
            attempts: 2,
            notes: 'Keep practising away from the violin.',
            updatedAt: daysAgo(4)
          }
        ]
      },
      {
        id: 'sofia-repertoire',
        name: 'Repertoire',
        items: [
          {
            id: 'sofia-rp-1',
            kind: 'skill',
            name: 'Plays from memory',
            status: 'passed',
            attempts: 2,
            notes: 'Whole concerto movement, no music.',
            updatedAt: daysAgo(1)
          },
          {
            id: 'sofia-rp-2',
            kind: 'skill',
            name: 'Performs with accompaniment',
            status: 'passed',
            attempts: 3,
            notes: 'Listens well to the pianist.',
            updatedAt: daysAgo(2)
          },
          {
            id: 'sofia-rp-3',
            kind: 'piece',
            name: 'Vivaldi Concerto in A minor, 1st mvt',
            status: 'passed',
            attempts: 5,
            notes: 'Recital ready.',
            updatedAt: daysAgo(1)
          },
          {
            id: 'sofia-rp-4',
            kind: 'piece',
            name: 'Meditation from Thaïs',
            status: 'lacking',
            attempts: 2,
            notes: 'The high register needs more bow.',
            updatedAt: daysAgo(3)
          },
          {
            id: 'sofia-rp-5',
            kind: 'piece',
            name: 'Bach Double, Violin I',
            status: 'passed',
            attempts: 3,
            notes: 'Ready to rehearse with a partner.',
            updatedAt: daysAgo(2)
          },
          {
            id: 'sofia-rp-6',
            kind: 'passage',
            name: 'Measures 1-32 of Vivaldi A minor',
            status: 'passed',
            attempts: 2,
            notes: 'Crisp and confident.',
            updatedAt: daysAgo(1)
          },
          {
            id: 'sofia-rp-7',
            kind: 'passage',
            name: 'Cadenza of Vivaldi A minor',
            status: 'passed',
            attempts: 4,
            notes: 'Tempo is finally settled.',
            updatedAt: daysAgo(1)
          }
        ]
      }
    ]
  }
];
