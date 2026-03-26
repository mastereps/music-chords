import { Router } from 'express';

import { login, logout, me } from '../modules/auth/auth.controller.js';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory
} from '../modules/categories/categories.controller.js';
import {
  createSong,
  deleteSong,
  getAdminDashboard,
  getSong,
  listRevisions,
  searchSongs,
  suggestSongCorrection,
  updateSong
} from '../modules/songs/songs.controller.js';
import { createTag, getTags } from '../modules/tags/tags.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const apiRouter = Router();

apiRouter.post('/auth/login', login);
apiRouter.get('/auth/me', requireAuth, me);
apiRouter.post('/auth/logout', requireAuth, logout);

apiRouter.get('/songs', searchSongs);
apiRouter.get('/songs/:slug', getSong);
apiRouter.post('/songs', requireAuth, requireRole('admin', 'editor'), createSong);
apiRouter.put('/songs/:id', requireAuth, requireRole('admin', 'editor'), updateSong);
apiRouter.delete('/songs/:id', requireAuth, requireRole('admin'), deleteSong);
apiRouter.post('/songs/:id/suggestions', suggestSongCorrection);
apiRouter.get('/songs/:id/revisions', requireAuth, requireRole('admin', 'editor'), listRevisions);

apiRouter.get('/categories', getCategories);
apiRouter.post('/categories', requireAuth, requireRole('admin'), createCategory);
apiRouter.put('/categories/:id', requireAuth, requireRole('admin'), updateCategory);
apiRouter.delete('/categories/:id', requireAuth, requireRole('admin'), deleteCategory);

apiRouter.get('/tags', getTags);
apiRouter.post('/tags', requireAuth, requireRole('admin', 'editor'), createTag);

apiRouter.get('/admin/dashboard', requireAuth, requireRole('admin', 'editor'), getAdminDashboard);
