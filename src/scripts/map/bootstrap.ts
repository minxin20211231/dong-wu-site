import { mapStations, type MapStation } from '../../data/mapStations';

type SubmissionResult = boolean | void | Promise<boolean | void>;

type MapCallbacks = {
  onStationView?: (stationId: string, channel?: string) => void;
  onToolOpen?: (stationId: string, channel?: string) => void;
  onMapComplete?: (channel?: string) => void;
  onEmailUnlockRequest?: (stationId: string, email: string, channel?: string, name?: string) => SubmissionResult;
  onWaitlistRequest?: (stationId: string, email: string, channel?: string, name?: string) => SubmissionResult;
};

const stage = document.querySelector<HTMLElement>('[data-map-stage]');
const journey = document.querySelector<HTMLElement>('[data-map-journey]');
const panel = document.querySelector<HTMLDialogElement>('[data-station-panel]');

// 島名單送出（與登島表單同 source，統一進 MailerLite 島 group）；localhost 只模擬不寫正式名單
const WORKER_ENDPOINT = 'https://dongwu-subscribe.minxin20211231.workers.dev';
const IS_LOCAL = ['localhost', '127.0.0.1', '0.0.0.0', ''].includes(location.hostname);

if (stage && journey && panel) {
  const channel = new URLSearchParams(window.location.search).get('ch') ?? undefined;
  const callbacks = () => (window as Window & { dongWuMapCallbacks?: MapCallbacks }).dongWuMapCallbacks;
  const frameCurrent = document.querySelector<HTMLElement>('[data-map-current]');
  const framePhase = document.querySelector<HTMLElement>('[data-map-phase]');
  const liveRegion = document.querySelector<HTMLElement>('[data-map-live]');
  const progressStops = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-progress-stop]'));
  const overviewStops = Array.from(document.querySelectorAll<HTMLElement>('[data-map-overview-stop]'));
  const stationSections = Array.from(document.querySelectorAll<HTMLElement>('[data-map-station]'));
  const triggerButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-open-station]'));
  const sailboat = stage.querySelector<HTMLElement>('[data-map-sailboat]');
  const seaMotionPath = stage.querySelector<SVGPathElement>('[data-map-sea-motion-path]');
  const viewedStations = new Set<string>();
  let currentTrigger: HTMLElement | null = null;
  let completeSent = false;
  let currentStationIndex = -1;
  let sailboatAnimation: Animation | null = null;

  const storage = {
    read(key: string) {
      try { return window.localStorage.getItem(key); } catch { return null; }
    },
    write(key: string, value: string) {
      try { window.localStorage.setItem(key, value); } catch { /* local storage may be disabled */ }
    },
  };

  const storageKeys = {
    visited: 'dw-map-v1-visited',
    unlocked: 'dw-map-v1-email-unlocked',
  } as const;

  const getVisited = () => new Set((storage.read(storageKeys.visited) ?? '').split(',').filter(Boolean));
  const saveVisited = (visited: Set<string>) => storage.write(storageKeys.visited, [...visited].join(','));
  const isEmailUnlocked = () => storage.read(storageKeys.unlocked) === '1';

  const seaRoutePoint = (progress: number) => {
    if (!seaMotionPath) return null;
    const length = seaMotionPath.getTotalLength();
    return seaMotionPath.getPointAtLength(length * Math.min(1, Math.max(0, progress)));
  };

  const setSailboatPosition = (progress: number) => {
    if (!sailboat) return;
    const point = seaRoutePoint(progress);
    if (!point) return;
    sailboat.style.left = `${point.x}%`;
    sailboat.style.top = `${point.y}%`;
  };

  const updateSailboat = (stationIndex: number, previousStationIndex: number) => {
    if (!sailboat || !seaMotionPath) return;
    sailboatAnimation?.cancel();
    sailboatAnimation = null;

    if (stationIndex < 9) {
      stage.dataset.marineState = 'waiting';
      setSailboatPosition(0);
      return;
    }
    if (stationIndex === 9) {
      stage.dataset.marineState = 'sailing';
      setSailboatPosition(0);
      return;
    }

    stage.dataset.marineState = 'arrived';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (previousStationIndex !== 9 || reduceMotion) {
      setSailboatPosition(1);
      return;
    }

    const keyframes = Array.from({ length: 61 }, (_, index) => {
      const progress = index / 60;
      const point = seaRoutePoint(progress);
      return {
        left: `${point?.x ?? 30}%`,
        top: `${point?.y ?? 62}%`,
        offset: progress,
      };
    });
    const animation = sailboat.animate(keyframes, {
      duration: 2600,
      easing: 'ease-in-out',
      fill: 'forwards',
    });
    sailboatAnimation = animation;
    animation.finished.then(() => {
      if (sailboatAnimation !== animation) return;
      setSailboatPosition(1);
      animation.cancel();
      sailboatAnimation = null;
    }).catch(() => { /* a new station replaced the current animation */ });
  };

  const updateHeaderHeight = () => {
    const header = document.querySelector<HTMLElement>('.site-topbar');
    document.documentElement.style.setProperty('--map-header-height', `${header?.getBoundingClientRect().height ?? 0}px`);
  };
  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight, { passive: true });

  const getStation = (stationId: string) => mapStations.find((station) => station.id === stationId);

  const fillPanel = (station: MapStation) => {
    const number = panel.querySelector<HTMLElement>('[data-panel-number]');
    const name = panel.querySelector<HTMLElement>('[data-panel-name]');
    const phase = panel.querySelector<HTMLElement>('[data-panel-phase]');
    const hook = panel.querySelector<HTMLElement>('[data-panel-hook]');
    const toolTitle = panel.querySelector<HTMLElement>('[data-panel-tool-title]');
    const toolIntro = panel.querySelector<HTMLElement>('[data-panel-tool-intro]');
    const toolPoints = panel.querySelector<HTMLUListElement>('[data-panel-tool-points]');
    if (number) number.textContent = station.number;
    if (name) name.textContent = station.name;
    if (phase) phase.textContent = `第 ${station.phase} 階段 · ${station.phaseName}`;
    if (hook) hook.textContent = station.hook;
    if (toolTitle) toolTitle.textContent = station.tool.title;
    if (toolIntro) toolIntro.textContent = station.tool.intro;
    if (toolPoints) {
      toolPoints.replaceChildren(...station.tool.points.map((point) => {
        const item = document.createElement('li');
        item.textContent = point;
        return item;
      }));
    }
  };

  const setPanelAccessState = (station: MapStation) => {
    const tool = panel.querySelector<HTMLElement>('[data-panel-tool]');
    const gate = panel.querySelector<HTMLElement>('[data-panel-gate]');
    const waitlist = panel.querySelector<HTMLElement>('[data-panel-waitlist]');
    // 2026-07-24 Bibo：16 站內容皆尚未開放，一律顯示「先收登島通知」；
    // Email 解鎖閘門保留結構，等站點內容真正開放時再啟用
    if (tool) {
      tool.classList.remove('is-gated');
      tool.setAttribute('aria-hidden', 'false');
    }
    if (gate) gate.hidden = true;
    if (waitlist) waitlist.hidden = false;
    panel.dataset.stationId = station.id;
    panel.dataset.stationStatus = station.status;
  };

  const openPanel = (stationId: string, trigger?: HTMLElement | null) => {
    const station = getStation(stationId);
    if (!station) return;
    currentTrigger = trigger ?? document.querySelector<HTMLElement>(`[data-open-station="${stationId}"]`);
    fillPanel(station);
    setPanelAccessState(station);
    if (!panel.open) panel.showModal();
    callbacks()?.onToolOpen?.(stationId, channel);
    window.dispatchEvent(new CustomEvent('map:tool-open', { detail: { stationId, channel } }));
  };

  triggerButtons.forEach((button) => button.addEventListener('click', () => openPanel(button.dataset.openStation ?? '', button)));

  panel.addEventListener('close', () => {
    currentTrigger?.focus({ preventScroll: true });
  });

  const setFormBusy = (form: HTMLFormElement, busy: boolean, pendingText: string) => {
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!button) return;
    if (!button.dataset.label) button.dataset.label = button.textContent ?? '';
    button.disabled = busy;
    button.textContent = busy ? pendingText : button.dataset.label;
  };

  const subscribeToIsland = async (email: string, name: string, question?: string) => {
    if (IS_LOCAL) {
      console.warn('[map] localhost 模擬送出，未呼叫 Worker。', { email, name, question });
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    const res = await fetch(WORKER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        source: 'island_waitlist_join',
        ...(channel ? { channel } : {}),
        ...(question ? { question } : {}),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !(data as { ok?: boolean }).ok) throw new Error('subscribe_failed');
  };

  panel.querySelector<HTMLFormElement>('[data-email-unlock-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const stationId = panel.dataset.stationId ?? 's01';
    const status = panel.querySelector<HTMLElement>('[data-email-status]');
    setFormBusy(form, true, '解鎖中…');
    if (status) status.textContent = '';
    try {
      await subscribeToIsland(email, name);
      storage.write(storageKeys.unlocked, '1');
      const station = getStation(stationId);
      if (station) setPanelAccessState(station);
      if (liveRegion) liveRegion.textContent = '前四站工具已解鎖。';
      if (status) status.textContent = '前四站已解鎖！新站開放時會用 Email 通知你。';
      window.dispatchEvent(new CustomEvent('map:email-unlock-request', { detail: { stationId, name, email, channel } }));
    } catch {
      if (status) status.textContent = '現在沒辦法完成解鎖，請稍後再試一次。';
    } finally {
      setFormBusy(form, false, '解鎖中…');
    }
  });

  panel.querySelector<HTMLFormElement>('[data-waitlist-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const stationId = panel.dataset.stationId ?? '';
    const status = panel.querySelector<HTMLElement>('[data-waitlist-status]');
    setFormBusy(form, true, '登記中…');
    if (status) status.textContent = '';
    try {
      const stationName = getStation(stationId)?.name ?? stationId;
      await subscribeToIsland(email, name, `登島通知登記：${stationName}`);
      if (status) status.textContent = '已收到！這站開放時會第一時間用 Email 通知你。';
      window.dispatchEvent(new CustomEvent('map:waitlist-request', { detail: { stationId, name, email, channel } }));
    } catch {
      if (status) status.textContent = '現在沒辦法完成登記，請稍後再試一次。';
    } finally {
      setFormBusy(form, false, '登記中…');
    }
  });

  const unlockName = panel.querySelector<HTMLInputElement>('[data-email-unlock-name]');
  unlockName?.addEventListener('invalid', () => unlockName.setCustomValidity('需要填寫您的稱呼'));
  unlockName?.addEventListener('input', () => unlockName.setCustomValidity(''));

  const waitlistName = panel.querySelector<HTMLInputElement>('[data-waitlist-name]');
  waitlistName?.addEventListener('invalid', () => waitlistName.setCustomValidity('需要填寫您的稱呼'));
  waitlistName?.addEventListener('input', () => waitlistName.setCustomValidity(''));

  const setCurrentStation = (stationId: string) => {
    const station = getStation(stationId);
    const stationIndex = mapStations.findIndex((item) => item.id === stationId);
    if (!station || stationIndex < 0) return;
    const progress = stationIndex / Math.max(1, mapStations.length - 1);
    const outboundProgress = Math.min(1, stationIndex / 9);
    const seaProgress = stationIndex < 9 ? 0 : stationIndex === 9 ? 0.12 : 1;
    const returnProgress = stationIndex <= 10 ? 0 : Math.min(1, (stationIndex - 10) / (mapStations.length - 11));
    document.documentElement.style.setProperty('--map-progress', String(progress));
    document.documentElement.style.setProperty('--map-outbound-progress', String(outboundProgress));
    document.documentElement.style.setProperty('--map-sea-progress', String(seaProgress));
    document.documentElement.style.setProperty('--map-return-progress', String(returnProgress));
    const previousStationIndex = currentStationIndex;
    currentStationIndex = stationIndex;
    stage.dataset.currentStation = stationId;
    stage.dataset.activeIsland = String(station.mapPosition.island);
    updateSailboat(stationIndex, previousStationIndex);
    if (frameCurrent) frameCurrent.textContent = station.number;
    if (framePhase) framePhase.textContent = `第 ${station.phase} 階段 · ${station.phaseName}`;
    progressStops.forEach((stop) => {
      const active = stop.dataset.progressStop === stationId;
      if (active) stop.setAttribute('aria-current', 'step');
      else stop.removeAttribute('aria-current');
    });
    overviewStops.forEach((stop) => {
      const stopStationId = stop.dataset.mapOverviewStop ?? '';
      const stopIndex = mapStations.findIndex((item) => item.id === stopStationId);
      const active = stopStationId === stationId;
      stop.classList.toggle('is-active', active);
      stop.classList.toggle('is-passed', stopIndex >= 0 && stopIndex < stationIndex);
      const link = stop.querySelector('a');
      if (active) link?.setAttribute('aria-current', 'step');
      else link?.removeAttribute('aria-current');
    });
    if (viewedStations.has(stationId)) return;
    viewedStations.add(stationId);
    const visited = getVisited();
    if (!visited.has(stationId)) {
      const section = document.querySelector<HTMLElement>(`[data-map-station="${stationId}"]`);
      section?.classList.add('is-arriving');
      window.setTimeout(() => section?.classList.remove('is-arriving'), 720);
      visited.add(stationId);
      saveVisited(visited);
    }
    callbacks()?.onStationView?.(stationId, channel);
    window.dispatchEvent(new CustomEvent('map:station-view', { detail: { stationId, channel } }));
    if (stationId === mapStations[mapStations.length - 1].id && !completeSent) {
      completeSent = true;
      callbacks()?.onMapComplete?.(channel);
      window.dispatchEvent(new CustomEvent('map:complete', { detail: { channel } }));
    }
  };

  const stationObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setCurrentStation((visible.target as HTMLElement).dataset.mapStation ?? 's01');
  }, { rootMargin: '-30% 0px -42% 0px', threshold: [0, 0.15, 0.35, 0.6] });
  stationSections.forEach((section) => stationObserver.observe(section));

  const initialVisited = getVisited();
  stationSections.forEach((section) => {
    if (initialVisited.has(section.dataset.mapStation ?? '')) section.classList.add('is-visited');
  });

  const hashStation = /^#s\d{2}$/.test(window.location.hash) ? window.location.hash.slice(1) : 's01';
  setCurrentStation(hashStation);
  if (hashStation !== 's01') {
    window.setTimeout(() => document.getElementById(hashStation)?.scrollIntoView({ block: 'center' }), 50);
  }

  window.addEventListener('beforeunload', () => {
    stationObserver.disconnect();
  }, { once: true });
}
