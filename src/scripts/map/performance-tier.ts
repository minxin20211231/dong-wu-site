export type MapRenderMode = 'static' | '3d';

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

export function supportsWebGL() {
  try {
    const probe = document.createElement('canvas');
    const context = probe.getContext('webgl2', { failIfMajorPerformanceCaveat: true })
      ?? probe.getContext('webgl', { failIfMajorPerformanceCaveat: true });
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function chooseInitialMode(): { mode: MapRenderMode; reason: string } {
  const hints = navigator as NavigatorWithHints;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return { mode: 'static', reason: 'reduced-motion' };
  if (window.matchMedia('(max-width: 820px)').matches) return { mode: 'static', reason: 'compact-viewport' };
  if (hints.connection?.saveData) return { mode: 'static', reason: 'save-data' };
  if (typeof hints.deviceMemory === 'number' && hints.deviceMemory < 4) return { mode: 'static', reason: 'memory-hint' };
  if (!supportsWebGL()) return { mode: 'static', reason: 'webgl-unavailable' };
  return { mode: '3d', reason: 'capable' };
}

