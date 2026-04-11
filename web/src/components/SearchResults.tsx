// SearchResults: Commented out - no protocol support in toy-slock-server
// The search functionality is not part of the current server protocol.
// This component is preserved for future implementation.

/*
import { Search, X, Hash, ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext';

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function SearchResults() {
  // ... search implementation would go here
  return null;
}
*/

export default function SearchResults() {
  return null;
}
