import { useState, useEffect, useMemo } from 'react';
import { X, Plus, ChevronDown, Globe, Lock, Server, AlertTriangle } from 'lucide-react';
import type { RuntimeMeta, ServerMachine } from '../types';
import ScanlineTear from './glitch/ScanlineTear';
import { ncStyle } from '../lib/themeUtils';

export interface CreateAgentConfig {
  name: string;
  description: string;
  runtime: string;
  model: string;
  machineId?: string;
  visibility: 'workspace' | 'private';
  workDir: string;
}

export default function CreateAgentDialog({
  machines,
  onClose,
  onCreate,
  onOpenMachineSetup,
}: {
  machines: ServerMachine[];
  onClose: () => void;
  onCreate: (config: CreateAgentConfig) => void;
  onOpenMachineSetup?: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id ?? '');
  const [runtime, setRuntime] = useState('');
  const [model, setModel] = useState('');
  const [customModel, setCustomModel] = useState(false);
  const [visibility, setVisibility] = useState<'workspace' | 'private'>('workspace');
  const [machineOpen, setMachineOpen] = useState(false);

  const selectedMachine = machines.find(m => m.id === selectedMachineId);
  // Build a runtime catalog from the selected machine. Fall back to deriving entries
  // from `runtimes` so older daemons (no catalog) still produce something usable.
  const runtimeCatalog: RuntimeMeta[] = useMemo(() => {
    if (!selectedMachine) return [];
    if (selectedMachine.runtimeCatalog && selectedMachine.runtimeCatalog.length) {
      return selectedMachine.runtimeCatalog;
    }
    return (selectedMachine.runtimes || []).map((id) => ({ id, displayName: id, models: [] }));
  }, [selectedMachine]);
  const runtimeIds = useMemo(() => runtimeCatalog.map(r => r.id), [runtimeCatalog]);
  const currentRuntimeMeta = useMemo(
    () => runtimeCatalog.find(r => r.id === runtime),
    [runtimeCatalog, runtime],
  );
  const suggestedModels = useMemo(
    () => currentRuntimeMeta?.models ?? [],
    [currentRuntimeMeta],
  );

  // Keep `runtime` in sync with what the selected machine actually offers.
  useEffect(() => {
    if (runtimeIds.length === 0) {
      if (runtime) setRuntime('');
      return;
    }
    if (!runtimeIds.includes(runtime)) {
      setRuntime(runtimeIds[0]);
    }
  }, [runtimeIds, runtime]);

  // When runtime changes, reset model to its default suggestion (or empty for free-form).
  useEffect(() => {
    const next = currentRuntimeMeta?.defaultModel || suggestedModels[0] || '';
    setModel(next);
    setCustomModel(false);
  }, [currentRuntimeMeta, suggestedModels]);

  const canSubmit = name.trim().length > 0 && runtime.length > 0;
  const workDir = `~/.zouk/agents/${name.trim().toLowerCase() || '<name>'}`;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const agentName = name.trim().toLowerCase();
    onCreate({
      name: agentName,
      description: description.trim(),
      runtime,
      model: model.trim(),
      machineId: selectedMachine?.id,
      visibility,
      workDir: `~/.zouk/agents/${agentName}`,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-nc-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-nc-surface border border-nc-border shadow-nc-panel w-[520px] max-h-[90vh] overflow-y-auto scrollbar-thin cyber-bevel animate-bounce-in">
        <div className="flex justify-between items-center px-6 pt-5 pb-3 border-b border-nc-border">
          <div>
            <h2 className="font-display font-black text-xl text-nc-text-bright tracking-wider">CREATE_AGENT</h2>
            <p className="text-xs text-nc-muted mt-0.5 font-mono">Create a new AI agent on a connected machine.</p>
          </div>
          <ScanlineTear config={{ trigger: 'hover', minInterval: 200, maxInterval: 600, minSeverity: 0.3, maxSeverity: 0.8 }}>
            <button
              onClick={onClose}
              className="cyber-btn w-8 h-8 flex items-center justify-center border border-nc-border hover:border-nc-red hover:text-nc-red hover:bg-nc-red/10 text-nc-muted"
            >
              <X size={16} />
            </button>
          </ScanlineTear>
        </div>

        <div className="px-6 pb-5 space-y-5 pt-4">
          {machines.length === 0 && (
            <div className="border border-nc-yellow/50 bg-nc-yellow/5 p-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-nc-yellow shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm text-nc-yellow">NO_MACHINES_CONNECTED</p>
                <p className="text-xs text-nc-muted mt-0.5 font-mono">
                  Connect a daemon to run agents.
                </p>
                {onOpenMachineSetup && (
                  <ScanlineTear config={{ trigger: 'hover', minInterval: 200, maxInterval: 600, minSeverity: 0.3, maxSeverity: 0.8 }}>
                    <button
                      onClick={() => { onClose(); onOpenMachineSetup(); }}
                      className="cyber-btn mt-2 px-3 py-1 border border-nc-yellow bg-nc-yellow/10 text-xs font-bold text-nc-yellow hover:bg-nc-yellow/20 font-mono"
                    >
                      MACHINE_SETUP
                    </button>
                  </ScanlineTear>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-nc-muted mb-1.5 font-mono tracking-wider">NAME</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. bob"
              className="w-full px-3 py-2 border border-nc-border bg-nc-panel text-sm text-nc-text-bright placeholder:text-nc-muted font-mono focus:outline-none focus:border-nc-cyan focus:shadow-nc-cyan transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-nc-muted mb-1.5 font-mono tracking-wider">DESCRIPTION</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this agent do?"
              className="w-full px-3 py-2 border border-nc-border bg-nc-panel text-sm text-nc-text-bright placeholder:text-nc-muted font-mono resize-none focus:outline-none focus:border-nc-cyan focus:shadow-nc-cyan transition-all"
              rows={2}
            />
          </div>

          {machines.length > 0 && (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-nc-muted mb-1.5 font-mono tracking-wider">
                <Server size={12} className="text-nc-green" /> MACHINE
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMachineOpen(!machineOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 border border-nc-border bg-nc-panel text-left text-sm hover:bg-nc-elevated transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-2 h-2 bg-nc-green shrink-0" />
                    <span className="font-bold text-nc-text-bright truncate font-mono">
                      {selectedMachine?.alias || selectedMachine?.hostname || 'Select machine...'}
                    </span>
                    {selectedMachine && (
                      <span className="text-2xs text-nc-muted font-mono">
                        {selectedMachine.os} · {(selectedMachine.runtimes || []).length} runtime{(selectedMachine.runtimes || []).length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <ChevronDown size={14} className={`text-nc-muted transition-transform ${machineOpen ? 'rotate-180' : ''}`} />
                </button>
                {machineOpen && (
                  <div className="absolute z-10 mt-1 w-full border border-nc-border bg-nc-surface shadow-nc-panel max-h-48 overflow-y-auto scrollbar-thin">
                    {machines.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedMachineId(m.id); setMachineOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                          m.id === selectedMachineId ? 'bg-nc-elevated' : 'hover:bg-nc-elevated/50'
                        }`}
                      >
                        <span className="w-2 h-2 bg-nc-green shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-nc-text-bright font-mono">{m.alias || m.hostname}</span>
                          {m.alias && <span className="text-2xs text-nc-muted ml-1.5 font-mono">{m.hostname}</span>}
                          <div className="text-2xs text-nc-muted font-mono">
                            {m.os} · Runtimes: {(m.runtimes || []).join(', ') || 'none'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-nc-muted mb-1.5 font-mono tracking-wider">RUNTIME</label>
            {runtimeCatalog.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {runtimeCatalog.map((rt) => (
                  <ScanlineTear key={rt.id} config={{ trigger: 'hover', minInterval: 200, maxInterval: 600, minSeverity: 0.3, maxSeverity: 0.8 }}>
                    <button
                      type="button"
                      onClick={() => setRuntime(rt.id)}
                      className={`cyber-btn px-3 py-1.5 border text-sm font-bold font-mono ${
                        runtime === rt.id
                          ? 'border-nc-cyan bg-nc-cyan/10 text-nc-cyan shadow-nc-cyan'
                          : 'border-nc-border text-nc-muted hover:bg-nc-elevated'
                      }`}
                      title={rt.version ? `${rt.displayName} (${rt.version})` : rt.displayName}
                    >
                      {rt.displayName || rt.id}
                    </button>
                  </ScanlineTear>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 border border-nc-border bg-nc-panel text-xs font-mono text-nc-muted">
                {selectedMachine
                  ? 'This machine has no runtimes available. Install a supported CLI on the daemon host.'
                  : 'Connect a daemon to see available runtimes.'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-nc-muted mb-1.5 font-mono tracking-wider">VISIBILITY</label>
            <div className="grid grid-cols-2 gap-3">
              <ScanlineTear config={{ trigger: 'hover', minInterval: 200, maxInterval: 600, minSeverity: 0.3, maxSeverity: 0.8 }}>
                <button
                  type="button"
                  onClick={() => setVisibility('workspace')}
                  className={`cyber-btn flex items-center gap-2 border px-3 py-2.5 text-left ${
                    visibility === 'workspace'
                      ? 'border-nc-cyan bg-nc-cyan/10 shadow-nc-cyan'
                      : 'border-nc-border hover:bg-nc-elevated'
                  }`}
                >
                  <Globe size={16} className="shrink-0 text-nc-cyan" />
                  <div>
                    <div className="font-bold text-sm text-nc-text-bright">Workspace</div>
                    <div className="text-xs text-nc-muted font-mono">All members can assign</div>
                  </div>
                </button>
              </ScanlineTear>
              <ScanlineTear config={{ trigger: 'hover', minInterval: 200, maxInterval: 600, minSeverity: 0.3, maxSeverity: 0.8 }}>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`cyber-btn flex items-center gap-2 border px-3 py-2.5 text-left ${
                    visibility === 'private'
                      ? 'border-nc-cyan bg-nc-cyan/10 shadow-nc-cyan'
                      : 'border-nc-border hover:bg-nc-elevated'
                  }`}
                >
                  <Lock size={16} className="shrink-0 text-nc-red" />
                  <div>
                    <div className="font-bold text-sm text-nc-text-bright">Private</div>
                    <div className="text-xs text-nc-muted font-mono">Only you can assign</div>
                  </div>
                </button>
              </ScanlineTear>
            </div>
          </div>

          {runtime && (
            <div>
              <label className="block text-xs font-bold text-nc-muted mb-1.5 font-mono tracking-wider">MODEL</label>
              {suggestedModels.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-2">
                  {suggestedModels.map((m) => (
                    <ScanlineTear key={m} config={{ trigger: 'hover', minInterval: 200, maxInterval: 600, minSeverity: 0.3, maxSeverity: 0.8 }}>
                      <button
                        type="button"
                        onClick={() => { setModel(m); setCustomModel(false); }}
                        className={`cyber-btn px-3 py-1.5 border text-sm font-bold font-mono ${
                          !customModel && model === m
                            ? 'border-nc-cyan bg-nc-cyan/10 text-nc-cyan shadow-nc-cyan'
                            : 'border-nc-border text-nc-muted hover:bg-nc-elevated'
                        }`}
                      >
                        {m}
                      </button>
                    </ScanlineTear>
                  ))}
                  <ScanlineTear config={{ trigger: 'hover', minInterval: 200, maxInterval: 600, minSeverity: 0.3, maxSeverity: 0.8 }}>
                    <button
                      type="button"
                      onClick={() => { setCustomModel(true); setModel(''); }}
                      className={`cyber-btn px-3 py-1.5 border text-sm font-bold font-mono ${
                        customModel
                          ? 'border-nc-cyan bg-nc-cyan/10 text-nc-cyan shadow-nc-cyan'
                          : 'border-nc-border text-nc-muted hover:bg-nc-elevated'
                      }`}
                    >
                      CUSTOM
                    </button>
                  </ScanlineTear>
                </div>
              )}
              {(customModel || suggestedModels.length === 0) && (
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={suggestedModels.length === 0 ? 'Optional model identifier' : 'Custom model identifier'}
                  className="w-full px-3 py-2 border border-nc-border bg-nc-panel text-sm text-nc-text-bright placeholder:text-nc-muted font-mono focus:outline-none focus:border-nc-cyan focus:shadow-nc-cyan transition-all"
                />
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-nc-muted mb-1.5 font-mono tracking-wider">WORK_DIR</label>
            <div className="px-3 py-2 border border-nc-border bg-nc-elevated text-sm font-mono text-nc-green" style={ncStyle({ textShadow: '0 0 4px rgb(var(--nc-green) / 0.3)' })}>
              {workDir}
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-nc-border">
            <ScanlineTear className="flex-1" config={{ trigger: 'hover', minInterval: 200, maxInterval: 600, minSeverity: 0.3, maxSeverity: 0.8 }}>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="cyber-btn-lg w-full flex items-center justify-center gap-1.5 py-2.5 border border-nc-green bg-nc-green/10 text-sm font-bold text-nc-green hover:bg-nc-green/20 hover:shadow-nc-green disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              >
                <Plus size={14} /> CREATE_AND_START
              </button>
            </ScanlineTear>
            <ScanlineTear config={{ trigger: 'hover', minInterval: 200, maxInterval: 600, minSeverity: 0.3, maxSeverity: 0.8 }}>
              <button
                onClick={onClose}
                className="cyber-btn px-5 py-2.5 border border-nc-border text-sm font-bold text-nc-muted hover:bg-nc-elevated font-mono"
              >
                CANCEL
              </button>
            </ScanlineTear>
          </div>
        </div>
      </div>
    </div>
  );
}
