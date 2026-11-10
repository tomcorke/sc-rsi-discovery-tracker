import { useState, type CSSProperties } from 'react';
import {
  formatPoints,
  runsToCap,
  TRACKS,
  TRACK_CAP,
  type Progress,
  type TrackId,
} from './event';
import { filterMissions, type Mission } from './missions';
import Icon from './Icon';
import STYLES from './MissionCatalogue.module.css';

type CompleteMission = (id: TrackId, points: number) => void;

function MissionCard({
  mission,
  progress,
  onComplete,
}: {
  mission: Mission;
  progress: number;
  onComplete: () => void;
}) {
  const canLog =
    mission.points !== null &&
    mission.points > 0 &&
    mission.availability !== 'removed';
  const complete = progress === TRACK_CAP;

  return (
    <article
      className={STYLES.mission}
      aria-labelledby={`mission-${mission.id}`}
    >
      {mission.category && (
        <span className={STYLES.category}>{mission.category}</span>
      )}
      <h4 id={`mission-${mission.id}`}>{mission.name}</h4>
      <div className={STYLES.stats}>
        <strong>
          {mission.points === null
            ? 'Points unverified'
            : `${formatPoints(mission.points)} pts`}
        </strong>
        {canLog && !mission.onceOnly && (
          <span>
            <b>{runsToCap(progress, mission.points!)}</b> runs left
          </span>
        )}
        {mission.availability === 'removed' && (
          <span>Historical / removed</span>
        )}
        {mission.availability === 'uncertain' && (
          <span>Availability uncertain</span>
        )}
        {mission.onceOnly && <span>One-time mission</span>}
        {Boolean(mission.conflicts?.length) && (
          <span title={mission.conflicts?.join('\n')}>Sources differ</span>
        )}
      </div>
      <p className={STYLES.requirements}>{mission.requirements}</p>
      <details className={STYLES.details}>
        <summary>Mission details</summary>
        {mission.fullName && <p>Mission name: {mission.fullName}</p>}
        {mission.creditReward !== null && (
          <p>
            Listed fee: {formatPoints(mission.creditReward)} aUEC, before costs
            or crew splits.
          </p>
        )}
        {mission.unlockPoints !== null &&
          mission.unlockPoints !== undefined && (
            <p>
              Reported unlock threshold: {formatPoints(mission.unlockPoints)}{' '}
              {mission.track} points. Confirm prerequisites in mobiGlas.
            </p>
          )}
        {mission.measuredMinutes && (
          <p>
            Guide completion estimate:{' '}
            {mission.measuredMinutes.min === mission.measuredMinutes.max
              ? mission.measuredMinutes.min
              : `${mission.measuredMinutes.min}–${mission.measuredMinutes.max}`}{' '}
            minutes. This is not a mission timer.
          </p>
        )}
        <p>{mission.notes}</p>
        <p>{mission.groupBehaviour}</p>
        {mission.sharingConflict && (
          <p>
            Sharing is disputed: community reports differ from game-data
            shareability flags. Check whether the contract can be shared
            in-game.
          </p>
        )}
        {mission.conflicts?.map((conflict) => (
          <p key={conflict}>{conflict}</p>
        ))}
        {mission.availabilityNote && <p>{mission.availabilityNote}</p>}
        <div className={STYLES.sources}>
          <span>Sources</span>
          {mission.sources.map((source, index) => (
            <a key={source} href={source} target="_blank" rel="noreferrer">
              {new URL(source).hostname.replace(/^www\./, '')}
              {mission.sources.length > 1 ? ` (${index + 1})` : ''}{' '}
              <Icon name="external" />
            </a>
          ))}
        </div>
      </details>
      <button
        type="button"
        className={STYLES.completeButton}
        aria-label={`Log ${mission.name} completion`}
        disabled={!canLog || complete}
        onClick={onComplete}
      >
        <Icon name="check" />
        {complete ? 'Track complete' : 'Log completion'}
        <span>
          {canLog ? `+${formatPoints(mission.points!)} pts` : 'Unavailable'}
        </span>
      </button>
    </article>
  );
}

export default function MissionCatalogue({
  missions,
  progress,
  checkedAt,
  onComplete,
}: {
  missions: Mission[];
  progress: Progress;
  checkedAt: string;
  onComplete: CompleteMission;
}) {
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState<TrackId | 'all'>('all');
  const [includeHistorical, setIncludeHistorical] = useState(false);
  const [lastCompletion, setLastCompletion] = useState('');
  const filtered = filterMissions(missions, {
    search,
    track: trackFilter,
    includeHistorical,
  });
  const tracks = TRACKS.filter(
    (track) =>
      (trackFilter === 'all' || track.id === trackFilter) &&
      filtered.some((mission) => mission.track === track.id),
  );
  const beryl = missions.find(
    (mission) => mission.name === 'Procure Refined Beryl',
  );
  const iron = missions.find(
    (mission) => mission.name === 'Procure Refined Iron',
  );
  const pairPoints = (beryl?.points ?? 0) + (iron?.points ?? 0);
  const logCompletion = (
    mission: Pick<Mission, 'name' | 'track' | 'points' | 'availability'>,
  ) => {
    if (
      mission.points === null ||
      mission.points <= 0 ||
      mission.availability === 'removed'
    ) {
      return;
    }

    const added = Math.min(mission.points, TRACK_CAP - progress[mission.track]);

    onComplete(mission.track, mission.points);
    setLastCompletion(
      `${mission.name} logged. Added ${formatPoints(added)} ${mission.track} points; track now ${formatPoints(progress[mission.track] + added)} / 10,000.`,
    );
  };

  return (
    <section
      id="contracts"
      className={STYLES.section}
      aria-labelledby="contracts-title"
    >
      <div className={STYLES.heading}>
        <div>
          <h2 id="contracts-title">Mission catalogue</h2>
          <p>Browse the mission catalogue and log each completed contract.</p>
        </div>
        <span>Source check: {checkedAt}</span>
      </div>
      <div className={STYLES.filters}>
        <label className={STYLES.search}>
          Find a mission
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search names, cargo, ships…"
          />
        </label>
        <label className={STYLES.trackFilter}>
          Pursuit
          <select
            value={trackFilter}
            onChange={(event) =>
              setTrackFilter(event.target.value as TrackId | 'all')
            }
          >
            <option value="all">All pursuits</option>
            {TRACKS.map((track) => (
              <option value={track.id} key={track.id}>
                {track.name}
              </option>
            ))}
          </select>
        </label>
        <label className={STYLES.historical}>
          <input
            type="checkbox"
            checked={includeHistorical}
            onChange={(event) => setIncludeHistorical(event.target.checked)}
          />
          Include uncertain / historical records
        </label>
      </div>
      <p className={STYLES.scope}>
        Alpha 4.10.2 catalogue, not a live mission board. Published event end
        dates precede this source check; current activation has not been
        verified. Points, payouts, and unlocks are community-reported and may
        change.
      </p>
      <p className={STYLES.count} role="status" aria-label="Mission results">
        {filtered.length} {filtered.length === 1 ? 'mission' : 'missions'} shown
      </p>
      {filtered.length > 0 ? (
        <div className={STYLES.grid} data-single-track={tracks.length === 1}>
          {tracks.map((track) => {
            const options = filtered.filter(
              (mission) => mission.track === track.id,
            );

            return (
              <div
                className={STYLES.column}
                key={track.id}
                style={
                  {
                    '--track-color': `var(--color-${track.id})`,
                  } as CSSProperties
                }
              >
                <h3>
                  <Icon name={track.id} />
                  {track.name}
                  <span>{options.length}</span>
                </h3>
                {options.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    progress={progress[track.id]}
                    onComplete={() => logCompletion(mission)}
                  />
                ))}
                {options.length === 0 && (
                  <p className={STYLES.emptyColumn}>
                    No {track.name.toLowerCase()} missions match.
                  </p>
                )}
                {track.id === 'collection' &&
                  options.some(
                    (mission) =>
                      mission.id === beryl?.id || mission.id === iron?.id,
                  ) &&
                  pairPoints > 0 && (
                    <div className={STYLES.pair}>
                      <p>
                        Completed both mining orders? Log the Beryl + Iron pair
                        together.
                      </p>
                      <button
                        type="button"
                        className={STYLES.completeButton}
                        aria-label="Log Beryl + Iron pair completion"
                        disabled={progress.collection === TRACK_CAP}
                        onClick={() =>
                          logCompletion({
                            name: 'Beryl + Iron pair',
                            track: 'collection',
                            points: pairPoints,
                            availability: 'reported',
                          })
                        }
                      >
                        <Icon name="check" />
                        Log pair<span>+{formatPoints(pairPoints)} pts</span>
                      </button>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={STYLES.empty}>
          <h3>No missions match your filters</h3>
          <p>Try a different mission name, resource, or ship.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setTrackFilter('all');
              setIncludeHistorical(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <p
        className={STYLES.completionStatus}
        aria-live="polite"
        aria-atomic="true"
      >
        {lastCompletion}
      </p>
    </section>
  );
}
