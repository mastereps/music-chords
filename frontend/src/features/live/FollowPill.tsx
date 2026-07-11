import { useLive } from './LiveProvider';

export function FollowPill() {
  const { liveState, isPresenting, isFollowing, setFollowing, stopPresenting } = useLive();

  if (!liveState?.active) {
    return null;
  }

  if (isPresenting) {
    return (
      <div className="fixed bottom-5 left-4 z-50 flex items-center gap-2 rounded-full border border-red-300/60 bg-white/95 py-2 pl-4 pr-2 text-xs font-semibold text-stone-800 shadow-[0_14px_34px_rgba(18,27,12,0.28)] backdrop-blur dark:border-red-500/40 dark:bg-stone-900/95 dark:text-stone-100 sm:bottom-6 sm:left-6">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        You are live
        <button
          type="button"
          onClick={() => void stopPresenting()}
          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
        >
          End
        </button>
      </div>
    );
  }

  if (isFollowing) {
    return (
      <div className="fixed bottom-5 left-4 z-50 flex items-center gap-2 rounded-full border border-red-300/60 bg-white/95 py-2 pl-4 pr-2 text-xs font-semibold text-stone-800 shadow-[0_14px_34px_rgba(18,27,12,0.28)] backdrop-blur dark:border-red-500/40 dark:bg-stone-900/95 dark:text-stone-100 sm:bottom-6 sm:left-6">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        Following live
        <button
          type="button"
          onClick={() => setFollowing(false)}
          className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-red-500 hover:text-red-600 dark:border-stone-700 dark:text-stone-200"
        >
          Stop
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setFollowing(true)}
      className="fixed bottom-5 left-4 z-50 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_14px_34px_rgba(120,20,20,0.4)] transition hover:bg-red-700 sm:bottom-6 sm:left-6"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
      Rejoin live
    </button>
  );
}
