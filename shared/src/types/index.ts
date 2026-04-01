export type RoleName = 'admin' | 'editor' | 'viewer';
export type SongStatus = 'draft' | 'published';
export type SuggestionStatus = 'pending' | 'reviewed' | 'resolved';

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
