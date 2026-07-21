export type RoleName = 'admin' | 'editor' | 'viewer';
export type SongStatus = 'draft' | 'published';
export type SuggestionStatus = 'pending' | 'reviewed' | 'resolved';
export type ResourceKind = 'pdf' | 'text' | 'image';

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  role: RoleName;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  songCount?: number;
  childCount?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface SongSummary {
  id: number;
  title: string;
  artist: string | null;
  key: string;
  slug: string;
  isPinned: boolean;
  category: Category | null;
  tags: Tag[];
  language: string | null;
  status: SongStatus;
  updatedAt: string;
}

export interface SongDetail extends SongSummary {
  content: string;
  createdAt: string;
  createdBy: Pick<AuthUser, 'id' | 'displayName' | 'email'> | null;
  updatedBy: Pick<AuthUser, 'id' | 'displayName' | 'email'> | null;
}

export interface SongRevision {
  id: number;
  songId: number;
  revisionNote: string | null;
  previousContent: string;
  newContent: string;
  editor: Pick<AuthUser, 'id' | 'displayName' | 'email'>;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface SongInput {
  title: string;
  artist?: string | null;
  key: string;
  slug: string;
  content: string;
  categoryId?: number | null;
  tagIds: number[];
  language?: string | null;
  status: SongStatus;
  revisionNote?: string | null;
}

export interface SongPinInput {
  pinned: boolean;
}

export interface SuggestionInput {
  contactName?: string | null;
  message: string;
  proposedContent: string;
}

export interface LineupSong {
  id: number;
  slug: string;
  title: string;
  artist: string | null;
  key: string;
}

export interface LineupSummary {
  id: number;
  title: string;
  description: string | null;
  songCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LineupDetail extends LineupSummary {
  songs: LineupSong[];
}

export interface LineupInput {
  title: string;
  description?: string | null;
  songIds: number[];
}

export interface Resource {
  id: number;
  title: string;
  slug: string;
  kind: ResourceKind;
  bodyText: string | null;
  originalFilename: string | null;
  byteSize: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TextResourceInput {
  title: string;
  slug: string;
  bodyText: string;
}

export interface LiveSongView {
  offset: number;
  fontSize: number;
}

export interface LiveState {
  active: boolean;
  path: string;
  scrollPct: number;
  songView: LiveSongView | null;
  updatedAt: string;
}

export interface LiveStateInput {
  active: boolean;
  path?: string;
  scrollPct?: number;
  songView?: LiveSongView | null;
}

export type TrackerItemStatus = 'not_started' | 'lacking' | 'passed';
export type TrackerItemKind = 'skill' | 'piece' | 'passage';

export interface TrackerItem {
  id: number;
  kind: TrackerItemKind;
  name: string;
  status: TrackerItemStatus;
  attempts: number;
  notes: string;
  /** Doubles as the review clock — the tracker measures staleness from this. */
  updatedAt: string;
}

export interface TrackerChecklist {
  id: number;
  name: string;
  items: TrackerItem[];
}

export interface TrackerStudent {
  id: number;
  name: string;
  /** Free-form so the frontend instrument registry stays the only place instruments are declared. */
  instrument: string;
  checklists: TrackerChecklist[];
}

export interface TrackerStudentInput {
  name: string;
  instrument: string;
}

export interface TrackerItemInput {
  kind: TrackerItemKind;
  name: string;
  status: TrackerItemStatus;
  attempts: number;
  notes: string;
}

/** Every field optional: an empty patch just re-stamps `updatedAt`, which is how review re-confirmation works. */
export interface TrackerItemPatch {
  name?: string;
  status?: TrackerItemStatus;
  attempts?: number;
  notes?: string;
}
