import type { TrackId } from './event';

type IconName =
  TrackId | 'check' | 'lock' | 'arrow' | 'reset' | 'star' | 'external';

const PATHS: Record<IconName, string> = {
  transport:
    'M3 8h12v10H3z M15 11h3l3 4v3h-6 M7 8V5h5v3 M6 21h1 M17 21h1 M6 18v3 M18 18v3',
  collection: 'm12 3 8 6-3 11H7L4 9z M4 9h16 M7 20l5-11 5 11 M12 3v6',
  defense: 'm12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6',
  check: 'm5 12 4 4L19 6',
  lock: 'M7 11V7a5 5 0 0 1 10 0v4 M5 11h14v10H5z M12 15v2',
  arrow: 'M5 12h14 M14 7l5 5-5 5',
  reset: 'M4 10a8 8 0 1 1 1 8 M4 4v6h6',
  star: 'm12 2 2.8 6.3L22 9l-5.4 4.7 1.6 7.1-6.2-3.6-6.2 3.6 1.6-7.1L2 9l7.2-.7z',
  external: 'M14 3h7v7 M21 3l-11 11 M10 3H3v18h18v-7',
};

export default function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
