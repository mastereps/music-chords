const SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SCALE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_INDEX: Record<string, number> = {
  C: 0,
  'B#': 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  'E#': 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11
};

const WRAPPER_PATTERN = /^([([{]*)(.*?)([)\]},.;:]*)$/;
const CHORD_PATTERN = /^([A-G](?:#|b)?)([^/\s]*?)(?:\/([A-G](?:#|b)?))?$/;
const CHORD_QUALITY_PATTERN = /^(?:(?:maj|min|dim|aug|sus|add|omit|no|m|M|\+|-)|[0-9]|[#b])*$/;
const REPEAT_MARKER_PATTERN = /^(?:\d+x|x\d+)$/i;

function parseChordCore(token: string) {
  const chordMatch = token.match(CHORD_PATTERN);

  if (!chordMatch) {
    return null;
  }

  const [, root, quality, bass] = chordMatch;

  if (!CHORD_QUALITY_PATTERN.test(quality)) {
    return null;
  }

  return { root, quality, bass };
}

function transposeChordCore(token: string, steps: number): string {
  const parsedChord = parseChordCore(token);

  if (!parsedChord) {
    return token;
  }

  const transposedRoot = transposeRoot(parsedChord.root, steps);
  const transposedBass = parsedChord.bass ? transposeRoot(parsedChord.bass, steps) : '';
  const slashPart = transposedBass ? `/${transposedBass}` : '';

  return `${transposedRoot}${parsedChord.quality}${slashPart}`;
}

function transposeChordSequence(token: string, steps: number) {
  const segments = token.split('-');

  if (segments.length < 2 || segments.some((segment) => !segment.length)) {
    return null;
  }

  if (!segments.every((segment) => parseChordCore(segment))) {
    return null;
  }

  return segments.map((segment) => transposeChordCore(segment, steps)).join('-');
}

function shouldUseFlats(root: string, steps: number, targetIndex: number): boolean {
  if (root.includes('b')) {
    return true;
  }

  if (root.includes('#')) {
    return false;
  }

  return steps < 0 && FLAT_SCALE[targetIndex].includes('b');
}

function isChordToken(token: string): boolean {
  const wrapperMatch = token.match(WRAPPER_PATTERN);

  if (!wrapperMatch) {
    return false;
  }

  return Boolean(parseChordCore(wrapperMatch[2]) ?? transposeChordSequence(wrapperMatch[2], 0));
}

function isChordAnnotationToken(token: string): boolean {
  const wrapperMatch = token.match(WRAPPER_PATTERN);

  if (!wrapperMatch) {
    return false;
  }

  return REPEAT_MARKER_PATTERN.test(wrapperMatch[2]);
}

function shouldTransposeLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);

  if (!tokens.length) {
    return false;
  }

  const chordCount = tokens.filter(isChordToken).length;
  const annotationCount = tokens.filter(isChordAnnotationToken).length;

  if (!chordCount) {
    return false;
  }

  if (chordCount + annotationCount === tokens.length) {
    return true;
  }

  return chordCount >= 2 && chordCount / tokens.length >= 0.5;
}

export function transposeRoot(root: string, steps: number): string {
  const index = NOTE_INDEX[root];

  if (index === undefined) {
    return root;
  }

  const nextIndex = (index + (steps % 12) + 12) % 12;
  const scale = shouldUseFlats(root, steps, nextIndex) ? FLAT_SCALE : SHARP_SCALE;
  return scale[nextIndex];
}

export function transposeChordToken(token: string, steps: number): string {
  const wrapperMatch = token.match(WRAPPER_PATTERN);

  if (!wrapperMatch) {
    return token;
  }

  const [, prefix, core, suffix] = wrapperMatch;
  const transposedSequence = transposeChordSequence(core, steps);

  if (transposedSequence) {
    return `${prefix}${transposedSequence}${suffix}`;
  }

  if (!parseChordCore(core)) {
    return token;
  }

  return `${prefix}${transposeChordCore(core, steps)}${suffix}`;
}

export function transposeContent(content: string, steps: number): string {
  if (!steps) {
    return content;
  }

  return content
    .split('\n')
    .map((line) => {
      if (!shouldTransposeLine(line)) {
        return line;
      }

      return line
        .split(/(\s+)/)
        .map((part) => (part.trim().length ? transposeChordToken(part, steps) : part))
        .join('');
    })
    .join('\n');
}
