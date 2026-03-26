import type { Request, Response } from 'express';

import type { SongInput } from '@music-chords/shared';

import { AppError, assertFound } from '../../utils/http';
import {
  createSong as createSongRecord,
  createSuggestion,
  deleteSong as deleteSongRecord,
  getDashboardStats,
  getSongBySlug,
  getSongRevisions,
  listSongs,
  updateSong as updateSongRecord
} from './songs.service';
import { songSchema, songSearchSchema, suggestionSchema } from './songs.schemas';

function canViewDrafts(req: Request) {
  return req.authRole === 'admin' || req.authRole === 'editor';
}

export async function searchSongs(req: Request, res: Response) {
  const filters = songSearchSchema.parse(req.query);
  const result = await listSongs(filters, canViewDrafts(req));
  res.status(200).json(result);
}

export async function getSong(req: Request, res: Response) {
  const slug = String(req.params.slug);
  const song = await getSongBySlug(slug, canViewDrafts(req));
  res.status(200).json({ item: assertFound(song, 'Song not found') });
}

export async function createSong(req: Request, res: Response) {
  if (!req.authUser) {
    throw new AppError('Authentication required', 401);
  }

  const payload = songSchema.parse(req.body);
  const song = await createSongRecord(payload as SongInput, req.authUser);
  res.status(201).json({ item: song });
}

export async function updateSong(req: Request, res: Response) {
  if (!req.authUser) {
    throw new AppError('Authentication required', 401);
  }

  const payload = songSchema.parse(req.body);
  const song = await updateSongRecord(Number(req.params.id), payload as SongInput, req.authUser);
  res.status(200).json({ item: song });
}

export async function deleteSong(req: Request, res: Response) {
  await deleteSongRecord(Number(req.params.id));
  res.status(200).json({ message: 'Song deleted' });
}

export async function suggestSongCorrection(req: Request, res: Response) {
  const payload = suggestionSchema.parse(req.body);
  await createSuggestion(Number(req.params.id), payload, req.authUser);
  res.status(201).json({ message: 'Suggestion submitted' });
}

export async function listRevisions(req: Request, res: Response) {
  const revisions = await getSongRevisions(Number(req.params.id));
  res.status(200).json({ items: revisions });
}

export async function getAdminDashboard(_req: Request, res: Response) {
  const stats = await getDashboardStats();
  res.status(200).json({ item: stats });
}
