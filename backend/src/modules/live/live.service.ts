import type { Response } from 'express';

import type { LiveState, LiveStateInput } from '@music-chords/shared';

const HEARTBEAT_INTERVAL_MS = 25_000;

let liveState: LiveState = {
  active: false,
  path: '/',
  scrollPct: 0,
  songView: null,
  updatedAt: new Date(0).toISOString()
};

const clients = new Set<Response>();
let heartbeatTimer: NodeJS.Timeout | null = null;

function writeState(res: Response) {
  res.write(`data: ${JSON.stringify(liveState)}\n\n`);
}

function startHeartbeat() {
  if (heartbeatTimer) {
    return;
  }

  heartbeatTimer = setInterval(() => {
    for (const client of clients) {
      client.write(': ping\n\n');
    }
  }, HEARTBEAT_INTERVAL_MS);

  // Do not keep the process alive just for heartbeats.
  heartbeatTimer.unref();
}

function stopHeartbeatIfIdle() {
  if (clients.size === 0 && heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

export function getLiveState(): LiveState {
  return liveState;
}

export function addLiveClient(res: Response) {
  clients.add(res);
  startHeartbeat();
  writeState(res);
}

export function removeLiveClient(res: Response) {
  clients.delete(res);
  stopHeartbeatIfIdle();
}

export function updateLiveState(input: LiveStateInput): LiveState {
  liveState = {
    active: input.active,
    path: input.path ?? liveState.path,
    scrollPct: input.scrollPct ?? liveState.scrollPct,
    songView: input.songView === undefined ? liveState.songView : input.songView,
    updatedAt: new Date().toISOString()
  };

  for (const client of clients) {
    writeState(client);
  }

  return liveState;
}
