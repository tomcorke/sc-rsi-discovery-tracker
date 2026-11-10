import { useRef, useState, type CSSProperties } from 'react';
import {
  clampPoints,
  EMPTY_PROGRESS,
  formatPoints,
  GUIDE_URL,
  nextReward,
  OVERALL_REWARDS,
  parseProgress,
  STORAGE_KEY,
  TOTAL_CAP,
  totalProgress,
  TRACKS,
  type Progress,
  type TrackId,
} from './event';
import Icon from './Icon';
import MissionCatalogue from './MissionCatalogue';
import { MISSIONS, MISSION_CHECKED_AT } from './missionData';
import ProgressHeader from './ProgressHeader';
import TrackCard from './TrackCard';
import STYLES from './App.module.css';

function readSavedProgress() {
  try {
    return {
      progress: parseProgress(localStorage.getItem(STORAGE_KEY)),
      saveStatus: 'Saved on this device',
    };
  } catch {
    return {
      progress: { ...EMPTY_PROGRESS },
      saveStatus: 'Storage unavailable · progress lasts for this session',
    };
  }
}

function Orbit({ total }: { total: number }) {
  return (
    <div className={STYLES.orbit} aria-hidden="true">
      <svg viewBox="0 0 300 250" fill="none">
        <path
          className={STYLES.orbitGrid}
          d="M150 0v250 M0 125h300 M46 21l208 208 M46 229 254 21"
        />
        <circle className={STYLES.orbitGrid} cx="150" cy="125" r="100" />
        <circle className={STYLES.orbitGrid} cx="150" cy="125" r="70" />
        <circle className={STYLES.orbitDashes} cx="150" cy="125" r="111" />
        <circle
          className={STYLES.orbitProgress}
          cx="150"
          cy="125"
          r="100"
          pathLength="100"
          strokeDasharray={`${(total / TOTAL_CAP) * 100} 100`}
          transform="rotate(-90 150 125)"
        />
        <path
          className={STYLES.constellation}
          d="m85 151 35-72 46 34 40-49 18 88-58-39-13 67-68-29Z M120 79l33 101"
        />
        {[
          [85, 151],
          [120, 79],
          [166, 113],
          [206, 64],
          [224, 152],
          [153, 180],
        ].map(([cx, cy]) => (
          <circle
            key={cx}
            className={STYLES.orbitStar}
            cx={cx}
            cy={cy}
            r={cx === 166 ? 4 : 2.5}
          />
        ))}
        <path
          className={STYLES.orbitCross}
          d="M144 14h12 M150 8v12 M144 236h12 M150 230v12 M33 125h12 M39 119v12 M255 125h12 M261 119v12"
        />
      </svg>
      <span className={STYLES.orbitLabel}>
        {total === TOTAL_CAP ? 'Mission accomplished' : 'Chart your own course'}
      </span>
    </div>
  );
}

function OverallProgress({ progress }: { progress: Progress }) {
  const total = totalProgress(progress);
  const next = nextReward(OVERALL_REWARDS, total);
  const tier = OVERALL_REWARDS.filter(
    (reward) => total >= reward.points,
  ).length;

  return (
    <section className={STYLES.overall} aria-labelledby="overall-title">
      <div className={STYLES.overallHeading}>
        <div className={STYLES.overallTitle}>
          <span className={STYLES.overallIcon}>
            <Icon name="star" />
          </span>
          <div>
            <h2 id="overall-title">Your overall progress</h2>
            <p>Three pursuits. One journey.</p>
          </div>
        </div>
        <span className={STYLES.automatic}>
          <span /> Automatically calculated
        </span>
      </div>
      <div className={STYLES.overallScore}>
        <p>
          <strong data-testid="overall-points">{formatPoints(total)}</strong>
          <span>/ 30,000 points</span>
        </p>
        <span>
          {next ? (
            <>
              <strong>{formatPoints(next.points - total)}</strong> points to
              tier {tier + 1}
            </>
          ) : (
            <>
              <Icon name="check" /> All overall tiers reached
            </>
          )}
        </span>
      </div>
      <div
        className={STYLES.totalBar}
        role="progressbar"
        aria-label="Overall progress"
        aria-valuemin={0}
        aria-valuemax={TOTAL_CAP}
        aria-valuenow={total}
        aria-valuetext={`${formatPoints(total)} of 30,000 points`}
      >
        {TRACKS.map((track) => (
          <span
            key={track.id}
            style={{
              width: `${(progress[track.id] / TOTAL_CAP) * 100}%`,
              background: `var(--color-${track.id})`,
            }}
          />
        ))}
        {OVERALL_REWARDS.slice(0, -1).map((reward) => (
          <i
            key={reward.points}
            style={{ left: `${(reward.points / TOTAL_CAP) * 100}%` }}
          />
        ))}
      </div>
      <div className={STYLES.barLegend}>
        <div>
          {TRACKS.map((track) => (
            <span
              key={track.id}
              style={
                {
                  '--legend-color': `var(--color-${track.id})`,
                } as CSSProperties
              }
            >
              <i />
              {track.name}
              <b>{formatPoints(progress[track.id])}</b>
            </span>
          ))}
        </div>
        <span>{Math.round((total / TOTAL_CAP) * 100)}% complete</span>
      </div>
      <ol className={STYLES.overallRewards}>
        {OVERALL_REWARDS.map((reward, index) => {
          const unlocked = total >= reward.points;
          const nextLabel = next?.points === reward.points ? 'Up next' : '';

          return (
            <li
              key={reward.points}
              data-unlocked={unlocked}
              data-next={next?.points === reward.points}
            >
              <div className={STYLES.milestoneHeader}>
                <span className={STYLES.milestoneIcon}>
                  <Icon name={unlocked ? 'check' : 'lock'} />
                </span>
                <span>
                  Tier {index + 1}
                  <strong>{formatPoints(reward.points)} pts</strong>
                </span>
                <span className={STYLES.milestoneState}>
                  {unlocked ? 'Reached' : nextLabel}
                </span>
              </div>
              <ul>
                {reward.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function FieldNotes() {
  return (
    <section
      id="field-guide"
      className={STYLES.fieldSection}
      aria-labelledby="field-title"
    >
      <div className={STYLES.sectionHeading}>
        <div>
          <h2 id="field-title">Before you launch</h2>
          <p>A few things worth knowing before your next contract.</p>
        </div>
      </div>
      <div className={STYLES.fieldGrid}>
        <aside className={STYLES.rental}>
          <span className={STYLES.rentalIcon}>
            <Icon name="star" />
          </span>
          <span className={STYLES.rentalTag}>Historical one-time offer</span>
          <h3>A five-day test flight.</h3>
          <p>
            The <strong>Constellation Rental Offer</strong> described delivering
            a gold box between RSI Event Platforms for a{' '}
            <strong>
              five-day Constellation Mk V Centaurus and Skylark rental
            </strong>
            .
          </p>
          <p>
            Community tables list 250 Transport points, while an older guide
            describes it outside progression. Availability is disputed: one
            source reports removal on 14 October. Check for the actual offer
            in-game; the mission record does not establish a current rental.
          </p>
          <div className={STYLES.rentalFoot}>
            <span>5 days</span>
            <span>Historical rental duration</span>
          </div>
        </aside>
        <div className={STYLES.notes}>
          <details open>
            <summary>How does the overall track work?</summary>
            <p>
              This tracker adds Transport, Collection, and Defense together, up
              to 30,000 points. No separate Overall mission is needed. Drag a
              slider or enter your exact points above.
            </p>
            <p>
              In-game totals can differ: shared Procure Refined Quantainium, UCM
              Order (M), and UCM Order (L) divide only their Overall
              contribution across the party. Each member’s Collection points
              still advance in full. This app’s calculated total does not model
              that split.
            </p>
          </details>
          <details>
            <summary>Should I bring a crew?</summary>
            <p>
              Community guides report full activity and Overall points on shared
              Transport and Defense contracts, plus Beryl and Iron. Game-data
              shareability flags conflict with those reports for some missions;
              confirm sharing in mobiGlas. The three Collection exceptions above
              reportedly divide only Overall contributions.
            </p>
          </details>
          <details>
            <summary>Where do I start with a small ship?</summary>
            <p>
              Courier Run (Exp. E) and Package Recovery (Exp. E) have reported
              zero-point unlock thresholds and small package requirements.
              Recover Package from Site is a ground-combat alternative. Compare
              the catalogue's cargo and equipment requirements before choosing.
            </p>
            <p>
              Eliminate Known Outlaw, Yellow Lvl. - Patrol System, and Yellow
              Lvl. - Support Ship are reported entry Defense missions. Important
              Supply Haul has a reported 417-point Transport unlock threshold;
              the older advice to complete any one easy contract is less
              precise.
            </p>
          </details>
          <details>
            <summary>How do I equip a reward livery?</summary>
            <p>
              Claim the matching ship at a terminal, choose its paint under ship
              customisation, then spawn it. Ursa, Aurora Mk II, and
              Constellation Starwalker liveries each require their matching
              hull.
            </p>
          </details>
          <details>
            <summary>Why has my in-game total stopped?</summary>
            <p>
              A slower total while sharing the three Collection contracts is
              expected. The guide also records reports of a stuck Overall bar.
              If it stops entirely while activity tracks advance, compare your
              mobiGlas values; this manual tracker cannot detect or fix game
              issues.
            </p>
          </details>
        </div>
      </div>
      <div className={STYLES.resources}>
        <span>Plan your next run</span>
        <a
          href="https://citizen-starter-guide.com/star-citizen-mining-material-finder/"
          target="_blank"
          rel="noreferrer"
        >
          Mining materials <Icon name="external" />
        </a>
        <a
          href="https://citizen-starter-guide.com/star-citizen-salvage-material-finder/"
          target="_blank"
          rel="noreferrer"
        >
          Salvage materials <Icon name="external" />
        </a>
        <a
          href="https://citizen-starter-guide.com/star-citizen-ship-loadout-builder/"
          target="_blank"
          rel="noreferrer"
        >
          Ship loadouts <Icon name="external" />
        </a>
        <a
          href="https://citizen-starter-guide.com/what-fits-in-star-citizen-ships/"
          target="_blank"
          rel="noreferrer"
        >
          Cargo fit checker <Icon name="external" />
        </a>
        <a
          href="https://citizen-starter-guide.com/star-citizen-ship-comparison/"
          target="_blank"
          rel="noreferrer"
        >
          Compare ships <Icon name="external" />
        </a>
      </div>
    </section>
  );
}

export default function App() {
  const trackerRef = useRef<HTMLElement>(null);
  const [{ progress, saveStatus }, setSession] = useState(readSavedProgress);
  const [resetPending, setResetPending] = useState(false);
  const total = totalProgress(progress);

  const setProgress = (next: Progress) => {
    let status = 'Saved on this device';

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      status = 'Storage unavailable · progress lasts for this session';
    }

    setSession({ progress: next, saveStatus: status });
  };

  const updateTrack = (id: TrackId, points: number) => {
    setProgress({ ...progress, [id]: points });
    setResetPending(false);
  };

  return (
    <>
      <a href="#tracker" className={STYLES.skipLink}>
        Skip to progress tracker
      </a>
      <header className={STYLES.header}>
        <a
          className={STYLES.brand}
          href="#"
          aria-label="Discovery tracker home"
        >
          <span className={STYLES.brandMark}>
            RSI<span>✦</span>
          </span>
          <span>
            Discovery <b>Tracker</b>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#tracker">Progress tracker</a>
          <a href="#contracts">Contracts</a>
          <a href="#field-guide">Field guide</a>
        </nav>
        <a
          className={STYLES.sourceLink}
          href={GUIDE_URL}
          target="_blank"
          rel="noreferrer"
        >
          Read the source guide <Icon name="external" />
        </a>
      </header>
      <ProgressHeader progress={progress} trackerRef={trackerRef} />
      <main className={STYLES.page}>
        <section className={STYLES.hero} aria-labelledby="page-title">
          <div className={STYLES.heroText}>
            <div className={STYLES.eventLabel}>
              <span className={STYLES.eventDot} />
              Stanton system <span className={STYLES.labelDivider}>/</span>{' '}
              Alpha 4.10.2 event guide
            </div>
            <h1 id="page-title">
              RSI Discovery
              <br />
              Month
            </h1>
            <p>
              Your next mission. Your next milestone.
              <br />
              Track all three pursuits and see the bigger picture come together.
            </p>
            <a href="#tracker" className={STYLES.heroLink}>
              Chart your progress <Icon name="arrow" />
            </a>
          </div>
          <Orbit total={total} />
        </section>
        <OverallProgress progress={progress} />
        <section
          id="tracker"
          ref={trackerRef}
          className={STYLES.tracker}
          aria-labelledby="tracker-title"
        >
          <div className={STYLES.sectionHeading}>
            <div>
              <h2 id="tracker-title">Your three pursuits</h2>
              <p>
                Drag to match your mobiGlas. Click a point total to enter an
                exact value.
              </p>
            </div>
            <div className={STYLES.trackerActions}>
              <span
                className={STYLES.saveStatus}
                role="status"
                aria-label="Progress storage"
              >
                {saveStatus}
              </span>
              {resetPending ? (
                <div className={STYLES.resetConfirm}>
                  <span>Clear all progress?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setProgress({ ...EMPTY_PROGRESS });
                      setResetPending(false);
                    }}
                  >
                    Clear
                  </button>
                  <button type="button" onClick={() => setResetPending(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={STYLES.reset}
                  disabled={total === 0}
                  onClick={() => setResetPending(true)}
                >
                  <Icon name="reset" />
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className={STYLES.trackGrid}>
            {TRACKS.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                points={progress[track.id]}
                onChange={(points) => updateTrack(track.id, points)}
              />
            ))}
          </div>
          <p className={STYLES.trackerNote}>
            <Icon name="lock" /> Manual, private tracking. Progress stays in
            this browser; no RSI sign-in required.{' '}
            <span>
              “Reached” reflects the values you enter, not an account reward
              claim.
            </span>
          </p>
        </section>
        <MissionCatalogue
          missions={MISSIONS}
          checkedAt={MISSION_CHECKED_AT}
          progress={progress}
          onComplete={(id, points) =>
            updateTrack(id, clampPoints(progress[id] + points))
          }
        />
        <FieldNotes />
        <footer className={STYLES.footer}>
          <div>
            <span className={STYLES.footerBrand}>RSI Discovery Tracker</span>
            <p>
              An independent fan tool. Not affiliated with Cloud Imperium Games
              or Roberts Space Industries.
            </p>
          </div>
          <div>
            <a href={GUIDE_URL} target="_blank" rel="noreferrer">
              Original guide by Citizen Starter Guide <Icon name="external" />
            </a>
            <p>
              Sources checked 10 November 2026. Mission catalogue: Alpha 4.10.2,
              not verified live availability. Details may change with patches.
              <br />
              Timings and rental prices are community estimates; confirm
              in-game.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
