import { describe, expect, it } from 'vitest';

import { transposeChordToken, transposeContent, transposeRoot } from './chords';

describe('transposeRoot', () => {
  it('transposes sharp notes upward', () => {
    expect(transposeRoot('C', 2)).toBe('D');
    expect(transposeRoot('F#', 1)).toBe('G');
  });

  it('preserves flat naming when source note is flat', () => {
    expect(transposeRoot('Bb', 2)).toBe('C');
    expect(transposeRoot('Eb', -2)).toBe('Db');
  });
});

describe('transposeChordToken', () => {
  it('transposes complex chords with slash bass', () => {
    expect(transposeChordToken('G/B', 2)).toBe('A/C#');
    expect(transposeChordToken('Bbmaj7/D', -2)).toBe('Abmaj7/C');
  });

  it('transposes hyphen-joined chord runs', () => {
    expect(transposeChordToken('C-G', 1)).toBe('C#-G#');
    expect(transposeChordToken('C-G-D-G', 1)).toBe('C#-G#-D#-G#');
  });

  it('keeps surrounding wrappers', () => {
    expect(transposeChordToken('(Am7)', 1)).toBe('(A#m7)');
  });

  it('ignores non-chord tokens', () => {
    expect(transposeChordToken('Verse', 1)).toBe('Verse');
    expect(transposeChordToken('Chorus:', 1)).toBe('Chorus:');
    expect(transposeChordToken('Pre-Chorus', 1)).toBe('Pre-Chorus');
  });
});

describe('transposeContent', () => {
  it('preserves spacing and line breaks', () => {
    const input = 'Verse 1\nC   G/B   Am7\nF   G\n';
    const output = transposeContent(input, 2);

    expect(output).toBe('Verse 1\nD   A/C#   Bm7\nG   A\n');
  });

  it('handles downward transposition with flats', () => {
    const input = 'Bb   F/A\nEb   F\n';
    const output = transposeContent(input, -2);

    expect(output).toBe('Ab   Eb/G\nDb   Eb\n');
  });

  it('does not transpose lyric lines that contain normal words', () => {
    const input = 'Amazing grace how sweet the sound\nA still small voice\n';
    const output = transposeContent(input, 2);

    expect(output).toBe(input);
  });

  it('transposes chord-heavy lines while keeping section labels intact', () => {
    const input = 'Intro C   G   Am   F\nVerse 1\nC   G   Am   F\n';
    const output = transposeContent(input, 2);

    expect(output).toBe('Intro D   A   Bm   G\nVerse 1\nD   A   Bm   G\n');
  });

  it('does not transpose standalone section labels that begin with chord letters', () => {
    const input = 'Chorus\nPre-Chorus:\nC   G   Am   F\n';
    const output = transposeContent(input, 2);

    expect(output).toBe('Chorus\nPre-Chorus:\nD   A   Bm   G\n');
  });

  it('transposes hyphen-joined chord runs inside chord lines', () => {
    const input = 'G C-G D G\nG D G C G-D-G\n';
    const output = transposeContent(input, 1);

    expect(output).toBe('G# C#-G# D# G#\nG# D# G# C# G#-D#-G#\n');
  });
});
