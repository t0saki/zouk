// PresenceIndicator: Commented out - depends on old Profile type not in server protocol
// This component is preserved for future implementation when presence tracking is supported.

/*
import type { Profile } from '../types';

const presenceColors: Record<string, string> = {
  online: 'bg-nb-green',
  away: 'bg-nb-yellow',
  dnd: 'bg-nb-red',
  offline: 'bg-nb-gray-400',
};

export default function PresenceIndicator({ presence, size = 'sm' }: { presence: Profile['presence']; size?: 'xs' | 'sm' | 'md' }) {
  const sizeMap = { xs: 'w-2 h-2', sm: 'w-2.5 h-2.5', md: 'w-3 h-3' };
  return (
    <span className={`${sizeMap[size]} ${presenceColors[presence]} border border-nb-black dark:border-dark-border rounded-full inline-block`} />
  );
}
*/

export default function PresenceIndicator() {
  return null;
}
