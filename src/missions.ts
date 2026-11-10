import type { TrackId } from './event';

export type MissionAvailability = 'reported' | 'uncertain' | 'removed';

export type Mission = {
  id: string;
  track: TrackId;
  name: string;
  points: number | null;
  creditReward: number | null;
  requirements: string;
  notes: string;
  groupBehaviour: string;
  availability: MissionAvailability;
  sources: string[];
  fullName?: string;
  category?: string;
  unlockPoints?: number | null;
  availabilityNote?: string;
  onceOnly?: boolean;
  sharingConflict?: boolean;
  overallSplit?: boolean;
  gameBuild?: string;
  measuredMinutes?: { min: number; max: number } | null;
  conflicts?: string[];
};

export type MissionFilters = {
  search: string;
  track: TrackId | 'all';
  includeHistorical: boolean;
};

export function filterMissions(
  missions: Mission[],
  filters: MissionFilters,
): Mission[] {
  const terms = filters.search
    .toLocaleLowerCase('en-GB')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return missions.filter((mission) => {
    const matchesTrack =
      filters.track === 'all' || mission.track === filters.track;
    const matchesAvailability =
      filters.includeHistorical || mission.availability === 'reported';
    const searchable =
      `${mission.name} ${mission.fullName ?? ''} ${mission.category ?? ''} ${mission.requirements} ${mission.notes} ${mission.groupBehaviour}`.toLocaleLowerCase(
        'en-GB',
      );

    return (
      matchesTrack &&
      matchesAvailability &&
      terms.every((term) => searchable.includes(term))
    );
  });
}
