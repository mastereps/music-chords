import type { Request, Response } from 'express';

import {
  createCategory as createCategoryRecord,
  deleteCategory as deleteCategoryRecord,
  listCategories,
  updateCategory as updateCategoryRecord
} from './categories.service.js';
import { categorySchema } from './categories.schemas.js';

export async function getCategories(_req: Request, res: Response) {
  const categories = await listCategories();
  res.status(200).json({ items: categories });
}

export async function createCategory(req: Request, res: Response) {
  const payload = categorySchema.parse(req.body);
  const category = await createCategoryRecord({
    name: payload.name,
    slug: payload.slug,
    parentId: payload.parentId ?? null,
    sortOrder: payload.sortOrder
  });

  res.status(201).json({ item: category });
}

export async function updateCategory(req: Request, res: Response) {
  const payload = categorySchema.parse(req.body);
  const category = await updateCategoryRecord(Number(req.params.id), {
    name: payload.name,
    slug: payload.slug,
    parentId: payload.parentId ?? null,
    sortOrder: payload.sortOrder
  });

  res.status(200).json({ item: category });
}

export async function deleteCategory(req: Request, res: Response) {
  await deleteCategoryRecord(Number(req.params.id));
  res.status(200).json({ message: 'Category deleted' });
}
