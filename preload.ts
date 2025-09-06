import {contextBridge, ipcRenderer} from 'electron';

// 定义API接口类型
interface ElectronAPI {
  node: () => string;
  chrome: () => string;
  electron: () => string;
  // API请求转发
  apiRequest: <T>(method: string, endpoint: string, data?: any) => Promise<T>;
  // 获取后端服务器端口
  getBackendPort: () => Promise<number>;
}

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 版本信息
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  
  // API请求转发
  apiRequest: <T>(method: string, endpoint: string, data?: any): Promise<T> => {
    return ipcRenderer.invoke('api-request', { method, endpoint, data });
  },
  
  // 获取后端服务器端口
  getBackendPort: (): Promise<number> => {
    return ipcRenderer.invoke('get-backend-port');
  },
});

// 定义全局类型声明，使TypeScript能够识别electron全局对象
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}