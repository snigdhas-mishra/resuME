import { useEffect, useState } from 'react';

const MESSAGES = [
  { text: 'Reading your resume…', icon: '📄' },
  { text: 'Analyzing the job description…', icon: '🔍' },
  { text: 'Matching your skills…', icon: '🎯' },
  { text: 'Tailoring your experience…', icon: '✨' },
  { text: 'Polishing the final draft…', icon: '💎' },
];

export default function LoadingOverlay() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState('');

  // Cycle through messages every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const current = MESSAGES[msgIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card p-10 max-w-sm w-full mx-4 text-center" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}>
        {/* Spinner */}
        <div className="mx-auto w-16 h-16 mb-6 relative">
          <div
            className="absolute inset-0 rounded-full border-2 border-[var(--color-border)]"
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--color-accent)] border-r-[var(--color-accent-light)]"
            style={{ animation: 'spin-slow 1s linear infinite' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            {current.icon}
          </div>
        </div>

        {/* Message */}
        <p
          key={msgIndex}
          className="text-lg font-medium text-[var(--color-text-primary)] animate-fade-in-up"
        >
          {current.text}
        </p>

        <p className="text-sm text-[var(--color-text-muted)] mt-3">
          This may take 15-30 seconds{dots}
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {MESSAGES.map((_, i) => (
            <div
              key={i}
              className={`
                w-1.5 h-1.5 rounded-full transition-all duration-500
                ${i === msgIndex
                  ? 'bg-[var(--color-accent)] w-4'
                  : i < msgIndex
                    ? 'bg-[var(--color-accent)]/40'
                    : 'bg-[var(--color-border)]'
                }
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
