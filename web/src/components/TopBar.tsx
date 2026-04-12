import { Hash, Users, PanelRightOpen, PanelRightClose, Menu, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../store/AppContext';
import GlitchText from './glitch/GlitchText';

export default function TopBar() {
  const {
    activeChannelName, viewMode,
    rightPanel, setRightPanel, closeRightPanel, sidebarOpen, setSidebarOpen,
    wsConnected, daemonConnected,
  } = useApp();

  return (
    <div className="h-14 border-b border-nc-border bg-nc-surface flex items-center px-4 gap-3 scanline-overlay">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="cyber-btn lg:hidden w-8 h-8 border border-nc-border flex items-center justify-center text-nc-muted hover:bg-nc-elevated hover:text-nc-cyan"
      >
        <Menu size={16} />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        {(viewMode === 'channel' || viewMode === 'dm') && (
          <>
            {viewMode === 'channel' && <Hash size={18} className="flex-shrink-0 text-nc-cyan" />}
            <GlitchText as="h1" className="font-display font-extrabold text-lg text-nc-text-bright truncate tracking-wider" intensity="low">
              {activeChannelName}
            </GlitchText>
          </>
        )}
        {viewMode === 'threads' && (
          <GlitchText as="h1" className="font-display font-extrabold text-lg text-nc-text-bright tracking-wider" intensity="low">Threads</GlitchText>
        )}
        {viewMode === 'agents' && (
          <GlitchText as="h1" className="font-display font-extrabold text-lg text-nc-text-bright tracking-wider" intensity="low">Agents</GlitchText>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 text-xs">
        <span className={`status-chip-sm flex items-center gap-1 font-mono ${wsConnected ? 'tone-terminal' : 'tone-critical'}`}>
          {wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {wsConnected ? 'LINKED' : 'OFFLINE'}
        </span>
        {daemonConnected && (
          <span className="status-chip-sm flex items-center gap-1 font-mono tone-telemetry">
            DAEMON
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => rightPanel === 'members' ? closeRightPanel() : setRightPanel('members')}
          className={`cyber-btn w-8 h-8 border flex items-center justify-center
            ${rightPanel === 'members'
              ? 'border-nc-cyan bg-nc-cyan/15 text-nc-cyan shadow-nc-cyan'
              : 'border-nc-border text-nc-muted hover:border-nc-cyan/50 hover:text-nc-cyan'
            }`}
          title="Members"
        >
          <Users size={16} />
        </button>

        <button
          onClick={() => rightPanel ? closeRightPanel() : setRightPanel('details')}
          className={`cyber-btn w-8 h-8 border flex items-center justify-center
            ${rightPanel
              ? 'border-nc-yellow bg-nc-yellow/15 text-nc-yellow shadow-nc-yellow'
              : 'border-nc-border text-nc-muted hover:border-nc-yellow/50 hover:text-nc-yellow'
            }`}
          title={rightPanel ? 'Close Panel' : 'Open Panel'}
        >
          {rightPanel ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>
      </div>
    </div>
  );
}
