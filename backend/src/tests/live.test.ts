import type { Response } from 'express';
import { describe, expect, it } from 'vitest';

import {
  addLiveClient,
  expireIfPresenterGone,
  getLiveState,
  removeLiveClient,
  updateLiveState
} from '../modules/live/live.service';

function createFakeClient() {
  const messages: string[] = [];
  const res = {
    write: (chunk: string) => {
      messages.push(chunk);
      return true;
    }
  } as unknown as Response;

  return { res, messages };
}

describe('live service', () => {
  it('sends the current state to a client as soon as it connects', () => {
    const { res, messages } = createFakeClient();

    addLiveClient(res);
    removeLiveClient(res);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toBe(`data: ${JSON.stringify(getLiveState())}\n\n`);
  });

  it('merges partial updates and broadcasts them to connected clients', () => {
    const { res, messages } = createFakeClient();
    addLiveClient(res);

    updateLiveState({ active: true, path: '/songs/alpha-song', scrollPct: 0.25, songView: { offset: 2, fontSize: 19 } });
    updateLiveState({ active: true, scrollPct: 0.75 });

    removeLiveClient(res);

    const lastEvent = JSON.parse(messages[messages.length - 1].replace(/^data: /, ''));
    expect(lastEvent).toMatchObject({
      active: true,
      path: '/songs/alpha-song',
      scrollPct: 0.75,
      songView: { offset: 2, fontSize: 19 }
    });

    const ended = updateLiveState({ active: false, songView: null });
    expect(ended.active).toBe(false);
    expect(ended.songView).toBeNull();
  });

  it('auto-ends the session when the presenter stops pinging', () => {
    updateLiveState({ active: true, path: '/', scrollPct: 0 });

    // Presenter still fresh: session stays live.
    expireIfPresenterGone(Date.now() + 5_000);
    expect(getLiveState().active).toBe(true);

    // No ping for longer than the timeout: session ends and is broadcast.
    const { res, messages } = createFakeClient();
    addLiveClient(res);
    expireIfPresenterGone(Date.now() + 60_000);
    removeLiveClient(res);

    expect(getLiveState().active).toBe(false);
    const lastEvent = JSON.parse(messages[messages.length - 1].replace(/^data: /, ''));
    expect(lastEvent.active).toBe(false);
  });
});
