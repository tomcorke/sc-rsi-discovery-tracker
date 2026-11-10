import { useState, type CSSProperties } from 'react';
import {
  clampPoints,
  formatPoints,
  nextReward,
  TRACK_CAP,
  type Track,
} from './event';
import Icon from './Icon';
import STYLES from './TrackCard.module.css';

type Props = {
  track: Track;
  points: number;
  onChange: (points: number) => void;
};

function PointsInput({
  id,
  points,
  onChange,
}: {
  id: string;
  points: number;
  onChange: Props['onChange'];
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (
      draft !== null &&
      draft.trim() !== '' &&
      Number.isFinite(Number(draft))
    ) {
      onChange(clampPoints(Number(draft)));
    }

    setDraft(null);
  };

  return (
    <input
      id={`${id}-points`}
      className={STYLES.pointsInput}
      aria-label={`${id} points`}
      type="number"
      inputMode="numeric"
      min={0}
      max={TRACK_CAP}
      step={1}
      value={draft ?? points}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }

        if (event.key === 'Escape') {
          setDraft(null);
        }
      }}
    />
  );
}

export default function TrackCard({ track, points, onChange }: Props) {
  const next = nextReward(track.rewards, points);
  const tier = track.rewards.filter((reward) => points >= reward.points).length;
  const percent = points / 100;
  const style = {
    '--track-color': `var(--color-${track.id})`,
    '--progress': `${percent}%`,
  } as CSSProperties;

  return (
    <article
      className={STYLES.card}
      style={style}
      aria-labelledby={`${track.id}-title`}
    >
      <div className={STYLES.heading}>
        <div className={STYLES.icon}>
          <Icon name={track.id} />
        </div>
        <span>{track.specialty}</span>
        <span className={STYLES.tier}>
          {tier === 4 ? <Icon name="check" /> : `Tier ${tier} / 4`}
        </span>
      </div>
      <h3 id={`${track.id}-title`}>{track.name}</h3>
      <p className={STYLES.description}>{track.description}</p>
      <div className={STYLES.score}>
        <PointsInput id={track.id} points={points} onChange={onChange} />
        <span>/ 10,000 pts</span>
        <strong>{percent.toFixed(1).replace('.0', '')}%</strong>
      </div>
      <label className={STYLES.srOnly} htmlFor={`${track.id}-slider`}>
        {track.name} progress
      </label>
      <input
        className={STYLES.slider}
        id={`${track.id}-slider`}
        type="range"
        min={0}
        max={TRACK_CAP}
        step={1}
        value={points}
        aria-valuetext={`${formatPoints(points)} of 10,000 points, tier ${tier} of 4`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className={STYLES.ticks} aria-label={`${track.name} tier shortcuts`}>
        <button
          type="button"
          onClick={() => onChange(0)}
          aria-label={`Reset ${track.name} to zero`}
        >
          0
        </button>
        {track.rewards.map((reward, index) => (
          <button
            type="button"
            key={reward.points}
            onClick={() => onChange(reward.points)}
            aria-label={`Set ${track.name} to tier ${index + 1}, ${formatPoints(reward.points)} points`}
          >
            {reward.points === TRACK_CAP ? '10k' : `${reward.points / 1000}k`}
          </button>
        ))}
      </div>
      <p className={STYLES.nextReward}>
        {next ? (
          <>
            <strong>{formatPoints(next.points - points)} pts</strong> to tier{' '}
            {tier + 1}
          </>
        ) : (
          <>
            <Icon name="check" /> Track complete. Every tier reached.
          </>
        )}
      </p>
      <div className={STYLES.rewardHeading}>
        <span>Reward manifest</span>
        <span>Points</span>
      </div>
      <ol className={STYLES.rewards}>
        {track.rewards.map((reward, index) => {
          const unlocked = points >= reward.points;

          return (
            <li key={reward.points} data-unlocked={unlocked}>
              <span
                className={STYLES.rewardMarker}
                aria-label={unlocked ? 'Reached' : 'Locked'}
              >
                {unlocked ? <Icon name="check" /> : index + 1}
              </span>
              <div>
                {reward.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <span className={STYLES.rewardPoints}>
                {formatPoints(reward.points)}
              </span>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
