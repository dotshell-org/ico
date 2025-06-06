// Types pour l'interface Electron
declare global {
  interface Window {
    ipcRenderer: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
      send: (channel: string, ...args: any[]) => void;
      off: (channel: string, listener: (...args: any[]) => void) => void;
    };
  }
}

export {};
