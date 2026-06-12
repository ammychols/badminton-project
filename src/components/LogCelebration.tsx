import { Z } from '../styles/overlay';

interface LogCelebrationProps {
  streak: number;
  monthGames: number;
}

/**
 * The reward moment after logging a session. Rendered at App level (driven by
 * the existing `justLogged` 5s timer) so it appears no matter which tab the
 * user logged from. Pointer-events none — purely celebratory, never blocks.
 */
export function LogCelebration({ streak, monthGames }: LogCelebrationProps) {
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ bottom: 'calc(76px + env(safe-area-inset-bottom))', zIndex: Z.toast }}
      role="status"
      aria-live="polite"
    >
      <style>{`
        @keyframes toast-up { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .log-toast { animation: toast-up .3s ease-out }
        @media (prefers-reduced-motion: reduce) { .log-toast { animation: none } }
      `}</style>
      <div
        className="log-toast flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-[var(--card-border)]"
        style={{ boxShadow: '0 8px 28px rgba(0,0,0,0.18)' }}
      >
        <span className="text-2xl">🎉</span>
        <div className="whitespace-nowrap">
          <div className="text-sm font-bold text-[var(--text-1)]">บันทึกแล้ว!</div>
          <div className="text-xs text-[var(--text-3)]">
            {streak >= 2 && <span>🔥 สตรีค {streak} วันติด · </span>}
            เดือนนี้ {monthGames} เกม
          </div>
        </div>
      </div>
    </div>
  );
}
