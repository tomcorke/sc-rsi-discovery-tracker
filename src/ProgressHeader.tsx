import { useEffect, useState, type CSSProperties, type RefObject } from 'react';
import {
  formatPoints,
  OVERALL_REWARDS,
  TOTAL_CAP,
  totalProgress,
  TRACKS,
  TRACK_CAP,
  type Progress,
} from './event';
import STYLES from './ProgressHeader.module.css';

export default function ProgressHeader({
  progress,
  trackerRef,
}: {
  progress: Progress;
  trackerRef: RefObject<HTMLElement | null>;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const tracker = trackerRef.current;

    if (!tracker) {
      return;
    }

    const updateVisibility = () => {
      setVisible(tracker.getBoundingClientRect().bottom <= 0);
    };
    const observer = new ResizeObserver(updateVisibility);

    observer.observe(tracker);
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, [trackerRef]);

  if (!visible) {
    return null;
  }

  const summaries = [
    ...TRACKS.map((track) => ({
      id: track.id,
      name: track.name,
      points: progress[track.id],
      cap: TRACK_CAP,
      rewards: track.rewards,
      color: `var(--color-${track.id})`,
    })),
    {
      id: 'overall',
      name: 'Overall',
      points: totalProgress(progress),
      cap: TOTAL_CAP,
      rewards: OVERALL_REWARDS,
      color: 'var(--color-cyan)',
    },
  ];

  return (
    <aside className={STYLES.header} aria-label="Progress summary">
      <div className={STYLES.trackers}>
        {summaries.map((summary) => (
          <a
            key={summary.id}
            className={STYLES.tracker}
            href="#tracker"
            style={{ '--summary-color': summary.color } as CSSProperties}
          >
            <span className={STYLES.name}>{summary.name}</span>
            <span className={STYLES.points}>
              {formatPoints(summary.points)}
              <span className={STYLES.cap}>/ {formatPoints(summary.cap)}</span>
            </span>
            <span
              className={STYLES.bar}
              role="progressbar"
              aria-label={`${summary.name} summary`}
              aria-valuemin={0}
              aria-valuemax={summary.cap}
              aria-valuenow={summary.points}
              aria-valuetext={`${formatPoints(summary.points)} of ${formatPoints(summary.cap)} points, ${summary.rewards.filter((reward) => summary.points >= reward.points).length} of 4 reward milestones reached`}
            >
              <span
                className={STYLES.fill}
                style={{ width: `${(summary.points / summary.cap) * 100}%` }}
              />
              {summary.rewards.map((reward, index) => (
                <span
                  key={reward.points}
                  className={STYLES.milestone}
                  style={{ left: `${(reward.points / summary.cap) * 100}%` }}
                  data-unlocked={summary.points >= reward.points}
                  title={`Tier ${index + 1}: ${formatPoints(reward.points)} points (${summary.points >= reward.points ? 'reached' : 'locked'})\n${reward.items.join(', ')}`}
                  aria-hidden="true"
                />
              ))}
            </span>
          </a>
        ))}
      </div>
    </aside>
  );
}
