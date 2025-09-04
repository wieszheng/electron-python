// Electron API接口类型定义
export interface ElectronAPI {
  sendMessage: (channel: string, data?: any) => void;
  onMessage: (channel: string, callback: (data: any) => void) => () => void;
  removeMessageListener: (channel: string, callback: (data: any) => void) => void;
  invoke: <T = any>(channel: string, ...args: any[]) => Promise<T>;
  // API请求转发
  apiRequest: <T = any>(method: string, endpoint: string, data?: any) => Promise<T>;
  // 获取后端服务器端口
  getBackendPort: () => Promise<number>;
}

// 扩展Window接口，添加electron属性
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}