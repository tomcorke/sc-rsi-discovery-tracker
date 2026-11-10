import { test } from 'node:test';
import { filterMissions, type Mission } from '../src/missions.ts';
import { MISSIONS } from '../src/missionData.ts';

const missions: Mission[] = [
  {
    id: 'haul',
    track: 'transport',
    name: 'Important Supply Haul',
    points: 625,
    creditReward: null,
    requirements: '320 SCU cargo capacity',
    notes: 'Hull B or Railen',
    groupBehaviour: 'Community reports full points for each crew member.',
    availability: 'reported',
    sources: [
      'https://citizen-starter-guide.com/star-citizen-rsi-discovery-month-event-guide/',
    ],
  },
  {
    id: 'uncertain-refuel',
    track: 'transport',
    name: 'Urgent Refuel Request',
    points: null,
    creditReward: null,
    requirements: 'Refuelling equipment',
    notes: 'Award not verified.',
    groupBehaviour: 'Unknown',
    availability: 'uncertain',
    sources: [],
  },
  {
    id: 'historical',
    track: 'collection',
    name: 'Scavenger Hunt',
    points: null,
    creditReward: null,
    requirements: 'Historical mission',
    notes: 'Unreleased record.',
    groupBehaviour: 'Unknown',
    availability: 'removed',
    sources: [],
  },
];

test('catalogue includes all 29 reported missions and separates the two disputed/historical records', (context) => {
  const reported = MISSIONS.filter(
    (mission) => mission.availability === 'reported',
  );

  context.assert.strictEqual(
    new Set(MISSIONS.map((mission) => mission.id)).size,
    31,
  );
  context.assert.strictEqual(reported.length, 29);
  context.assert.deepStrictEqual(
    ['transport', 'collection', 'defense'].map(
      (track) => reported.filter((mission) => mission.track === track).length,
    ),
    [14, 6, 9],
  );
  context.assert.deepStrictEqual(
    MISSIONS.filter((mission) => mission.availability !== 'reported')
      .map((mission) => mission.name)
      .toSorted(),
    ['Constellation Rental Offer', 'Scavenger Hunt'],
  );

  for (const mission of MISSIONS) {
    context.assert.ok(
      mission.sources.length > 0,
      `${mission.name} has public sources`,
    );
    context.assert.ok(
      mission.points !== null && mission.points > 0 && mission.points <= 10_000,
      `${mission.name} has a bounded award`,
    );
  }
});

test('catalogue retains corroborated corrections instead of older guide or table values', (context) => {
  const points = (name: string) =>
    MISSIONS.find((mission) => mission.name === name)?.points;

  context.assert.strictEqual(points('UCM Order (S)'), 183);
  context.assert.strictEqual(points('UCM Order (M)'), 255);
  context.assert.strictEqual(points('Urgent Refuel Request'), 104);
  context.assert.strictEqual(points('Clear Hostiles from Site'), 167);
});

test('mission search combines words across fields regardless of case', (context) => {
  const result = filterMissions(missions, {
    search: '  HULL   320 ',
    track: 'all',
    includeHistorical: false,
  });

  context.assert.deepStrictEqual(
    result.map((mission) => mission.id),
    ['haul'],
  );
});

test('historical records are opt-in and pursuit filters apply alongside search', (context) => {
  context.assert.strictEqual(
    filterMissions(missions, {
      search: '',
      track: 'all',
      includeHistorical: false,
    }).length,
    1,
  );
  context.assert.deepStrictEqual(
    filterMissions(missions, {
      search: '',
      track: 'collection',
      includeHistorical: false,
    }),
    [],
  );
  context.assert.deepStrictEqual(
    filterMissions(missions, {
      search: 'hunt',
      track: 'collection',
      includeHistorical: true,
    }).map((mission) => mission.id),
    ['historical'],
  );
});

test('uncertain missions retain unknown awards and are not given invented point values', (context) => {
  const result = filterMissions(missions, {
    search: 'refuel',
    track: 'transport',
    includeHistorical: true,
  });

  context.assert.strictEqual(result[0].points, null);
  context.assert.strictEqual(result[0].availability, 'uncertain');
});
