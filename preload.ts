import { contextBridge, ipcRenderer } from "electron";

// 暴露API到渲染进程
contextBridge.exposeInMainWorld("electron", {
  // 版本信息
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,

  // API请求转发
  callApi: (method: string, endpoint: string, data?: any) => {
    return ipcRenderer.invoke("call-api", { method, endpoint, data });
  },

  // 获取后端服务器端口
  getBackendPort: (): Promise<number> => {
    return ipcRenderer.invoke("get-backend-port");
  },

  // 自动更新相关API
  checkForUpdates: (): Promise<void> => {
    return ipcRenderer.invoke("check-for-updates");
  },

  // 监听更新进度事件
  onUpdateProgress: (callback: (progress: number) => void) => {
    const listener = (_event: any, progress: number) => callback(progress);
    ipcRenderer.on("update-progress", listener);
    return () => ipcRenderer.removeListener("update-progress", listener);
  },

  // 立即安装更新
  quitAndInstallUpdate: (): Promise<void> => {
    return ipcRenderer.invoke("quit-and-install-update");
  },
});
