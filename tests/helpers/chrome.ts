type StorageShape = Record<string, unknown>;

let store: StorageShape = {};
let uuidCounter = 0;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function getValueForKey(key: string) {
  return key in store ? clone(store[key]) : undefined;
}

export function installChromeMock(initialStore: StorageShape = {}) {
  store = clone(initialStore);
  uuidCounter = 0;

  const local = {
    async get(keys?: string | string[] | Record<string, unknown>) {
      if (typeof keys === "string") {
        return { [keys]: getValueForKey(keys) };
      }

      if (Array.isArray(keys)) {
        return Object.fromEntries(keys.map((key) => [key, getValueForKey(key)]));
      }

      if (keys && typeof keys === "object") {
        return Object.fromEntries(
          Object.entries(keys).map(([key, fallback]) => [
            key,
            key in store ? getValueForKey(key) : fallback
          ])
        );
      }

      return clone(store);
    },

    async set(next: StorageShape) {
      store = { ...store, ...clone(next) };
    },

    async remove(keys: string | string[]) {
      for (const key of Array.isArray(keys) ? keys : [keys]) {
        delete store[key];
      }
    }
  };

  const tabs = {
    async query() {
      return [];
    },
    async create() {
      return undefined;
    }
  };

  const eventApi = {
    addListener() {},
    removeListener() {}
  };

  Object.defineProperty(globalThis, "chrome", {
    configurable: true,
    value: {
      storage: {
        local,
        onChanged: eventApi
      },
      tabs,
      commands: eventApi,
      runtime: {
        onStartup: eventApi,
        onInstalled: eventApi
      },
      scripting: {
        async executeScript() {
          return [];
        }
      }
    }
  });

  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      randomUUID: () => `test-uuid-${++uuidCounter}`
    }
  });
}

export function resetChromeMock(initialStore: StorageShape = {}) {
  installChromeMock(initialStore);
}

export function readPinbaseStore() {
  return clone(store.pinbase ?? null) as {
    sites: Array<{
      id: string;
      categories: string[];
    }>;
    categories: Array<{
      name: string;
    }>;
    ui: {
      lastSelectedCategory: string;
    };
  } | null;
}
