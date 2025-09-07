// Electron API接口类型定义
export interface ElectronAPI {
  // 版本信息
  node: () => string;
  electron: () => string;
  chrome: () => string;
  // API请求转发
  callApi: (method: string, endpoint: string, data?: any) => Promise<any>;
  // 获取后端服务器端口
  getBackendPort: () => Promise<number>;
  // 自动更新相关API
  checkForUpdates: () => Promise<void>;
  onUpdateProgress: (callback: (progress: number) => void) => () => void;
  quitAndInstallUpdate: () => Promise<void>;
}

// 扩展Window接口，添加electron属性
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
