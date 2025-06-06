class IPCService {
  static async invoke<T = any>(channel: string, ...args: any[]): Promise<T> {
    try {
      return await window.ipcRenderer.invoke(channel, ...args);
    } catch (error) {
      console.error(`IPC Error on channel ${channel}:`, error);
      throw error;
    }
  }

  static on(channel: string, listener: (event: any, ...args: any[]) => void): void {
    window.ipcRenderer.on(channel, listener);
  }

  static off(channel: string, listener: (event: any, ...args: any[]) => void): void {
    window.ipcRenderer.off(channel, listener);
  }

  static send(channel: string, ...args: any[]): void {
    window.ipcRenderer.send(channel, ...args);
  }
}

export default IPCService;
