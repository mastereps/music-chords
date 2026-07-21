import type { Request, Response } from 'express';

import {
  createItem as createItemRecord,
  createStudent as createStudentRecord,
  deleteItem as deleteItemRecord,
  deleteStudent as deleteStudentRecord,
  listStudents,
  updateItem as updateItemRecord,
  updateStudent as updateStudentRecord
} from './tracker.service';
import { trackerIdParamsSchema, trackerItemPatchSchema, trackerItemSchema, trackerStudentSchema } from './tracker.schemas';

export async function getTrackerStudents(_req: Request, res: Response) {
  const students = await listStudents();
  res.status(200).json({ items: students });
}

export async function createTrackerStudent(req: Request, res: Response) {
  const payload = trackerStudentSchema.parse(req.body);
  const student = await createStudentRecord(payload);
  res.status(201).json({ item: student });
}

export async function updateTrackerStudent(req: Request, res: Response) {
  const { id } = trackerIdParamsSchema.parse(req.params);
  const payload = trackerStudentSchema.parse(req.body);
  const student = await updateStudentRecord(id, payload);
  res.status(200).json({ item: student });
}

export async function deleteTrackerStudent(req: Request, res: Response) {
  const { id } = trackerIdParamsSchema.parse(req.params);
  await deleteStudentRecord(id);
  res.status(200).json({ message: 'Student deleted' });
}

export async function createTrackerItem(req: Request, res: Response) {
  const { id } = trackerIdParamsSchema.parse(req.params);
  const payload = trackerItemSchema.parse(req.body);
  const item = await createItemRecord(id, payload);
  res.status(201).json({ item });
}

export async function updateTrackerItem(req: Request, res: Response) {
  const { id } = trackerIdParamsSchema.parse(req.params);
  const payload = trackerItemPatchSchema.parse(req.body ?? {});
  const item = await updateItemRecord(id, payload);
  res.status(200).json({ item });
}

export async function deleteTrackerItem(req: Request, res: Response) {
  const { id } = trackerIdParamsSchema.parse(req.params);
  await deleteItemRecord(id);
  res.status(200).json({ message: 'Checklist item deleted' });
}
