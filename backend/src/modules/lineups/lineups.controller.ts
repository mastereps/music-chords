import type { Request, Response } from 'express';

import type { LineupInput } from '@music-chords/shared';

import { AppError, assertFound } from '../../utils/http';
import {
  createLineup as createLineupRecord,
  deleteLineup as deleteLineupRecord,
  getLineupById,
  listLineups,
  updateLineup as updateLineupRecord
} from './lineups.service';
import { lineupParamsSchema, lineupSchema } from './lineups.schemas';

export async function getLineups(_req: Request, res: Response) {
  const items = await listLineups();
  res.status(200).json({ items });
}

export async function getLineup(req: Request, res: Response) {
  const { id } = lineupParamsSchema.parse(req.params);
  const item = await getLineupById(id);
  res.status(200).json({ item: assertFound(item, 'Lineup not found') });
}

export async function createLineup(req: Request, res: Response) {
  if (!req.authUser) {
    throw new AppError('Authentication required', 401);
  }

  const payload = lineupSchema.parse(req.body);
  const item = await createLineupRecord(payload as LineupInput, req.authUser);
  res.status(201).json({ item });
}

export async function updateLineup(req: Request, res: Response) {
  if (!req.authUser) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = lineupParamsSchema.parse(req.params);
  const payload = lineupSchema.parse(req.body);
  const item = await updateLineupRecord(id, payload as LineupInput, req.authUser);
  res.status(200).json({ item });
}

export async function deleteLineup(req: Request, res: Response) {
  const { id } = lineupParamsSchema.parse(req.params);
  await deleteLineupRecord(id);
  res.status(200).json({ message: 'Lineup deleted' });
}
