import { test } from 'node:test';
import {
  clampPoints,
  EMPTY_PROGRESS,
  nextReward,
  OVERALL_REWARDS,
  parseProgress,
  runsToCap,
  totalProgress,
  TRACKS,
} from '../src/event.ts';

test('overall progress adds independent activity tracks and reaches 30,000', (context) => {
  context.assert.strictEqual(totalProgress(EMPTY_PROGRESS), 0);
  context.assert.strictEqual(
    totalProgress({ transport: 625, collection: 669, defense: 417 }),
    1711,
  );
  context.assert.strictEqual(
    totalProgress({ transport: 10_000, collection: 10_000, defense: 10_000 }),
    30_000,
  );
});

test('reward boundaries change exactly at the published thresholds', (context) => {
  for (const rewards of [
    OVERALL_REWARDS,
    ...TRACKS.map((track) => track.rewards),
  ]) {
    rewards.forEach((reward, index) => {
      context.assert.strictEqual(
        nextReward(rewards, reward.points - 1),
        reward,
      );
      context.assert.strictEqual(
        nextReward(rewards, reward.points),
        rewards[index + 1],
      );
    });
  }
});

test('saved progress rejects malformed values and bounds numbers independently', (context) => {
  for (const raw of [null, 'broken', 'null', '42', '"value"', '[]']) {
    context.assert.deepStrictEqual(parseProgress(raw), EMPTY_PROGRESS);
  }

  context.assert.deepStrictEqual(
    parseProgress('{"transport":12000,"collection":-12,"defense":416.8}'),
    { transport: 10_000, collection: 0, defense: 417 },
  );
  context.assert.deepStrictEqual(
    parseProgress('{"transport":"6500","collection":null,"defense":2000}'),
    { transport: 0, collection: 0, defense: 2000 },
  );
  context.assert.strictEqual(clampPoints(Infinity), 0);
  context.assert.strictEqual(clampPoints(NaN), 0);
});

test('remaining runs round up and stop at a completed track', (context) => {
  context.assert.strictEqual(runsToCap(0, 625), 16);
  context.assert.strictEqual(runsToCap(0, 669), 15);
  context.assert.strictEqual(runsToCap(0, 417), 24);
  context.assert.strictEqual(runsToCap(0, 146), 69);
  context.assert.strictEqual(runsToCap(9999, 625), 1);
  context.assert.strictEqual(runsToCap(10_000, 625), 0);
});
