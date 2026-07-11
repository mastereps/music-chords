import type { Request, Response } from 'express';

import { addLiveClient, removeLiveClient, updateLiveState as applyLiveState } from './live.service';
import { liveStateInputSchema } from './live.schemas';

export function streamLive(req: Request, res: Response) {
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  // Tell Nginx not to buffer this response so events arrive immediately.
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  addLiveClient(res);

  req.on('close', () => {
    removeLiveClient(res);
  });
}

export function updateLiveState(req: Request, res: Response) {
  const payload = liveStateInputSchema.parse(req.body);
  const state = applyLiveState(payload);
  res.status(200).json({ item: state });
}
