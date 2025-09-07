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
});
