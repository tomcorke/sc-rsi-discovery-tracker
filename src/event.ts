export const GUIDE_URL =
  'https://citizen-starter-guide.com/star-citizen-rsi-discovery-month-event-guide/';
export const TRACK_CAP = 10_000;
export const TOTAL_CAP = TRACK_CAP * 3;
export const STORAGE_KEY = 'rsi-discovery-progress-v1';

export type TrackId = 'transport' | 'collection' | 'defense';
export type Progress = Record<TrackId, number>;
export type Reward = { points: number; items: string[] };
export type Contract = {
  name: string;
  points: number;
  label: string;
  notes: string;
};
export type Track = {
  id: TrackId;
  name: string;
  specialty: string;
  description: string;
  rewards: Reward[];
  contracts: Contract[];
};

export const EMPTY_PROGRESS: Progress = {
  transport: 0,
  collection: 0,
  defense: 0,
};

export const OVERALL_REWARDS: Reward[] = [
  {
    points: 4_500,
    items: [
      'BriskAir IC-10 cooler',
      'Delphi RS-10 radar',
      'Sovereign IP-10 power plant',
    ],
  },
  { points: 9_900, items: ['Ursa Starwalker livery'] },
  {
    points: 24_000,
    items: [
      'Aurora Mk II Starwalker livery',
      'Aurora Mk II handling & speed blades',
    ],
  },
  {
    points: 30_000,
    items: [
      'Constellation Starwalker livery',
      'RSI armour',
      'Helios power plants (S1–S3)',
      'Andromeda handling & speed blades',
    ],
  },
];

export const TRACKS: Track[] = [
  {
    id: 'transport',
    name: 'Transport',
    specialty: 'Keep Stanton moving',
    description: 'Deliver supplies. Recover cargo. Go the distance.',
    rewards: [
      {
        points: 2_000,
        items: ['Zeus Keelback livery', 'BriskAir IC-20 cooler'],
      },
      { points: 4_000, items: ['Zeus Mk II handling & speed blades'] },
      { points: 6_500, items: ['BriskAir IC-30 cooler'] },
      { points: 10_000, items: ['MaxLift-II Keelback tractor beam'] },
    ],
    contracts: [
      {
        name: 'Important Supply Haul',
        points: 625,
        label: 'Cargo route',
        notes:
          '320 SCU required: Hull B or Railen. About 18 minutes per run (2,083 pts/hour). The guide lists a Hull B at 7,541,100 aUEC from New Deal, Lorville; no rental in this cargo class.',
      },
      {
        name: 'Package Recovery (Exp. E)',
        points: 313,
        label: 'Accessible alternative',
        notes:
          'Recover a 1 SCU box from a crash site. No specific hull required. Be ready for starter ships and light fighters.',
      },
    ],
  },
  {
    id: 'collection',
    name: 'Collection',
    specialty: 'Turn resources into rewards',
    description: 'Mine, refine, and salvage your way to the next tier.',
    rewards: [
      {
        points: 2_000,
        items: ['Salvation Glacier livery', 'Delphi RS-20 radar'],
      },
      { points: 4_000, items: ['Mantis handling & speed blades'] },
      { points: 6_500, items: ['Delphi RS-30 radar'] },
      { points: 10_000, items: ['Cambio-II Glacier SRT'] },
    ],
    contracts: [
      {
        name: 'Beryl',
        points: 669,
        label: 'Crew-friendly mining',
        notes:
          'Deliver 8 SCU of refined Beryl. Pair with Iron: 6 SCU earns 408 points. Mine both at Wala and refine before delivery. Neither contract divides points between party members.',
      },
      {
        name: 'UCM Order (L)',
        points: 486,
        label: 'Fast solo salvage',
        notes:
          'Reclaimer required. Disintegrate the hull; scraping is unnecessary. The guide estimates 8–10 minutes per large order, around 3,000 pts/hour. Medium orders use a MOTH (listed rental: 223,256 aUEC/day). Shared medium and large orders divide Overall contributions only.',
      },
    ],
  },
  {
    id: 'defense',
    name: 'Defense',
    specialty: 'Answer the call',
    description: 'Protect fellow pilots and clear the skies.',
    rewards: [
      {
        points: 2_000,
        items: ['Scorpius Echo livery', 'Sovereign IP-20 power plant'],
      },
      { points: 4_000, items: ['Meteor handling & speed blades'] },
      { points: 6_500, items: ['Sovereign IP-30 power plant'] },
      { points: 10_000, items: ['P8-SC Echo SMG'] },
    ],
    contracts: [
      {
        name: 'Orange Lvl. RSI Ship Under Attack',
        points: 417,
        label: 'Bring a crew',
        notes:
          'Expect three heavy fighters plus support, and a damaged friendly ship. Bring strong combat ships and gunners; the guide suggests a Perseus or Paladin.',
      },
      {
        name: 'Yellow Lvl. Support Ship',
        points: 146,
        label: 'Solo-friendly',
        notes:
          'Two starter-class hostiles. About five minutes per run, with no specific ship requirement. Roughly six hours to finish this track from zero.',
      },
    ],
  },
];

export function clampPoints(value: number): number {
  return Number.isFinite(value)
    ? Math.min(TRACK_CAP, Math.max(0, Math.round(value)))
    : 0;
}

export function parseProgress(raw: string | null): Progress {
  try {
    const value: unknown = JSON.parse(raw ?? 'null');

    if (!value || typeof value !== 'object') {
      return { ...EMPTY_PROGRESS };
    }

    const saved = value as Record<string, unknown>;
    const read = (id: TrackId) =>
      typeof saved[id] === 'number' ? clampPoints(saved[id]) : 0;

    return {
      transport: read('transport'),
      collection: read('collection'),
      defense: read('defense'),
    };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function totalProgress(progress: Progress): number {
  return progress.transport + progress.collection + progress.defense;
}

export function nextReward(rewards: Reward[], points: number) {
  return rewards.find((reward) => reward.points > points);
}

export function runsToCap(points: number, award: number): number {
  return Math.ceil((TRACK_CAP - points) / award);
}

export const formatPoints = (points: number) => points.toLocaleString('en-GB');
