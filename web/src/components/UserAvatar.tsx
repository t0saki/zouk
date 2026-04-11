// UserAvatar: Commented out - depends on old Profile type not in server protocol
// This component is preserved for future implementation when user profiles are supported.

/*
import type { Profile } from '../types';

const avatarColors = ['#FFD700', '#0066FF', '#00CC66', '#FF3366', '#FF6B00', '#E53E3E'];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function UserAvatar({ user, size = 'md', showPresence = false, onClick }: {
  user: Profile; size?: 'sm' | 'md' | 'lg'; showPresence?: boolean; onClick?: () => void;
}) {
  // ... implementation
  return null;
}
*/

export default function UserAvatar() {
  return null;
}
