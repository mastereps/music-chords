import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { apiClient } from '../../api/client';
import { useLive } from './LiveProvider';

const SCROLL_BROADCAST_MS = 200;
// Keepalive so the server knows the presenter is still here; if these stop
// arriving (closed tab, crash) the server auto-ends the session after ~35s.
const KEEPALIVE_MS = 10_000;

// Pages behind RequireRole (plus /login) are never broadcast: followers without
// an account would be redirected to the sign-in page. While the presenter is on
// one of these, followers simply stay on the last public page.
const RESTRICTED_PATHS = ['/admin', '/lineups/new', '/login'];

function isRestrictedPath(path: string) {
  return RESTRICTED_PATHS.some((restricted) => path === restricted || path.startsWith(`${restricted}/`));
}

function getScrollPct() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
}

function applyScrollPct(scrollPct: number) {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  // 'instant' overrides the global `scroll-behavior: smooth`; smooth scrolling
  // lags behind the presenter's rapid live updates.
  window.scrollTo({ top: scrollPct * Math.max(0, maxScroll), behavior: 'instant' });
}

export function LiveSync() {
  const { liveState, isPresenting, isFollowing, songView } = useLive();
  const location = useLocation();
  const navigate = useNavigate();

  // Presenter: broadcast page, scroll position, and song view while live.
  useEffect(() => {
    if (!isPresenting) {
      return;
    }

    let lastSentAt = 0;
    let pendingTimer: number | null = null;
    const restricted = isRestrictedPath(location.pathname);

    const send = () => {
      lastSentAt = Date.now();
      void apiClient
        .updateLiveState(
          restricted
            ? { active: true }
            : {
                active: true,
                path: location.pathname,
                scrollPct: getScrollPct(),
                songView
              }
        )
        .catch(() => {
          // Keep presenting even if a single broadcast fails.
        });
    };

    const sendThrottled = () => {
      const elapsed = Date.now() - lastSentAt;

      if (elapsed >= SCROLL_BROADCAST_MS) {
        send();
        return;
      }

      if (pendingTimer === null) {
        pendingTimer = window.setTimeout(() => {
          pendingTimer = null;
          send();
        }, SCROLL_BROADCAST_MS - elapsed);
      }
    };

    send();
    const keepaliveTimer = window.setInterval(send, KEEPALIVE_MS);

    if (!restricted) {
      window.addEventListener('scroll', sendThrottled, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', sendThrottled);
      window.clearInterval(keepaliveTimer);
      if (pendingTimer !== null) {
        window.clearTimeout(pendingTimer);
      }
    };
  }, [isPresenting, location.pathname, songView]);

  // Follower: mirror the presenter's page and scroll position.
  const shouldFollow = Boolean(liveState?.active) && !isPresenting && isFollowing;
  const targetPath = liveState?.path ?? '/';
  const targetScrollPct = liveState?.scrollPct ?? 0;

  useEffect(() => {
    if (!shouldFollow || isRestrictedPath(targetPath)) {
      return;
    }

    if (location.pathname !== targetPath) {
      navigate(targetPath);
      return;
    }

    applyScrollPct(targetScrollPct);

    // Content (song sheets, lists) may still be loading; re-apply once it settles.
    const retryTimer = window.setTimeout(() => applyScrollPct(targetScrollPct), 350);
    return () => window.clearTimeout(retryTimer);
  }, [shouldFollow, targetPath, targetScrollPct, location.pathname, navigate]);

  return null;
}
