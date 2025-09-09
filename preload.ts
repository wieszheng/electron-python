import { contextBridge, ipcRenderer } from "electron";
import { UpdateStatus } from "./updater";

// 暴露API到渲染进程
contextBridge.exposeInMainWorld("electron", {
  // 版本信息
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,

  ipcRenderer: {
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  },
  // API请求转发
  callApi: (method: string, endpoint: string, data?: any) => {
    return ipcRenderer.invoke("call-api", { method, endpoint, data });
  },

  // 获取后端服务器端口
  getBackendPort: (): Promise<number> => {
    return ipcRenderer.invoke("get-backend-port");
  },

  // 自动更新相关API
  checkForUpdate: (): Promise<void> => ipcRenderer.invoke("check-for-update"),

  // 监听更新进度事件
  onUpdateStatus: (callback: (status: UpdateStatus) => void) =>
    ipcRenderer.on("update-status", (_event, value) => callback(value)),
  removeUpdateStatusListener: (callback) =>
    ipcRenderer.removeListener("update-status", callback),
  respondToUpdatePrompt: (action) =>
    ipcRenderer.invoke("user-response-to-update", action),

  installUpdateNow: () => ipcRenderer.invoke("install-update-now"),
});
