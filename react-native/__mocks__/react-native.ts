// What the package imports from React Native, recorded by the tests.

// One state across `jest.isolateModules`, which loads this file again.
const shared = ((globalThis as { __rn?: Record<string, unknown> }).__rn ??= {
  calls: [],
  cmpHolder: { value: undefined },
  cmpSnapshot: { value: {} },
  emitted: [],
}) as {
  calls: Array<[string, ...unknown[]]>;
  cmpHolder: { value: unknown };
  cmpSnapshot: { value: unknown };
  emitted: Array<{ event: string; listener: (e: unknown) => void }>;
};

export const calls = shared.calls;

const record =
  (name: string, result?: unknown) =>
  (...args: unknown[]) => {
    calls.push([name, ...args]);
    return result;
  };

/** Scruter CMP's native module: what `snapshot` answers is `cmpSnapshot.value`. */
export const cmpSnapshot = shared.cmpSnapshot;
export const cmpModule = {
  start: record('cmp.start'),
  snapshot: (...args: unknown[]) => {
    calls.push(['cmp.snapshot', ...args]);
    return cmpSnapshot.value;
  },
  showPreferences: record('cmp.showPreferences'),
  showIfNeeded: record('cmp.showIfNeeded', true),
  requestTrackingIfGranted: (...args: unknown[]) => {
    calls.push(['cmp.requestTrackingIfGranted', ...args]);
    return Promise.resolve('authorized');
  },
  setLanguage: record('cmp.setLanguage'),
  setDebug: record('cmp.setDebug'),
  setForceShow: record('cmp.setForceShow'),
  debugReset: record('cmp.debugReset'),
  addListener: record('cmp.addListener'),
  removeListeners: record('cmp.removeListeners'),
};
export const cmpHolder = shared.cmpHolder;
if (cmpHolder.value === undefined) cmpHolder.value = cmpModule;

export const TurboModuleRegistry = {
  get: (name: string) => (name === 'ScruterCMP' ? cmpHolder.value : null),
};

/** The listeners added to `NativeEventEmitter`, for the tests to emit to. */
export const emitted = shared.emitted;
export function emit(event: string, body: unknown) {
  for (const l of emitted.filter((x) => x.event === event)) l.listener(body);
}

export const Platform = { OS: 'ios' };

export class NativeEventEmitter {
  addListener(event: string, listener: (e: unknown) => void) {
    const entry = { event, listener };
    emitted.push(entry);
    return {
      remove() {
        emitted.splice(emitted.indexOf(entry), 1);
      },
    };
  }
}
