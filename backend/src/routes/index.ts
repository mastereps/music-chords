import { Router } from 'express';

import { login, logout, me } from '../modules/auth/auth.controller';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory
} from '../modules/categories/categories.controller';
import {
  createLineup,
  deleteLineup,
  getLineup,
  getLineups,
  updateLineup
} from '../modules/lineups/lineups.controller';
import {
  createSong,
  deleteSong,
  getAdminDashboard,
  getSong,
  listRevisions,
  searchSongs,
  suggestSongCorrection,
  updateSong,
  updateSongPin
} from '../modules/songs/songs.controller';
import { createTag, getTags } from '../modules/tags/tags.controller';
import { requireAuth, requireRole } from '../middleware/auth';

export const apiRouter = Router();

apiRouter.post('/auth/login', login);
apiRouter.get('/auth/me', requireAuth, me);
apiRouter.post('/auth/logout', requireAuth, logout);

apiRouter.get('/songs', searchSongs);
apiRouter.get('/songs/:slug', getSong);
apiRouter.post('/songs', requireAuth, requireRole('admin', 'editor'), createSong);
apiRouter.put('/songs/:id', requireAuth, requireRole('admin', 'editor'), updateSong);
apiRouter.patch('/songs/:id/pin', requireAuth, requireRole('admin'), updateSongPin);
apiRouter.delete('/songs/:id', requireAuth, requireRole('admin'), deleteSong);
apiRouter.post('/songs/:id/suggestions', suggestSongCorrection);
apiRouter.get('/songs/:id/revisions', requireAuth, requireRole('admin', 'editor'), listRevisions);

apiRouter.get('/lineups', getLineups);
apiRouter.get('/lineups/:id', getLineup);
apiRouter.post('/lineups', requireAuth, requireRole('admin', 'editor'), createLineup);
apiRouter.put('/lineups/:id', requireAuth, requireRole('admin', 'editor'), updateLineup);
apiRouter.delete('/lineups/:id', requireAuth, requireRole('admin', 'editor'), deleteLineup);

apiRouter.get('/categories', getCategories);
apiRouter.post('/categories', requireAuth, requireRole('admin'), createCategory);
apiRouter.put('/categories/:id', requireAuth, requireRole('admin'), updateCategory);
apiRouter.delete('/categories/:id', requireAuth, requireRole('admin'), deleteCategory);

apiRouter.get('/tags', getTags);
apiRouter.post('/tags', requireAuth, requireRole('admin', 'editor'), createTag);

apiRouter.get('/admin/dashboard', requireAuth, requireRole('admin', 'editor'), getAdminDashboard);
