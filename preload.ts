import { contextBridge, ipcRenderer } from 'electron';

// 定义API接口类型
interface ElectronAPI {
  sendMessage: (channel: string, data?: any) => void;
  onMessage: (channel: string, callback: (data: any) => void) => void;
  removeMessageListener: (channel: string, callback: (data: any) => void) => void;
  // 可以添加更多的API方法
  invoke: <T = any>(channel: string, ...args: any[]) => Promise<T>;
  // API请求转发
  apiRequest: <T = any>(method: string, endpoint: string, data?: any) => Promise<T>;
  // 获取后端服务器端口
  getBackendPort: () => Promise<number>;
}

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 发送消息到主进程
  sendMessage: (channel: string, data?: any) => {
    // 验证通道名称，确保安全
    const validChannels = ['ping', 'get-system-info', 'save-file'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // 监听主进程发送的消息
  onMessage: (channel: string, callback: (data: any) => void) => {
    const validChannels = ['pong', 'system-info', 'file-saved'];
    if (validChannels.includes(channel)) {
      const subscription = (_event: any, ...args: any[]) => callback(...args);
      ipcRenderer.on(channel, subscription);
      
      // 返回取消订阅的函数
      return () => ipcRenderer.removeListener(channel, subscription);
    }
  },
  
  // 移除消息监听器
  removeMessageListener: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
  
  // 异步调用主进程的方法
  invoke: async <T = any>(channel: string, ...args: any[]): Promise<T> => {
    const validChannels = ['get-file-content', 'execute-python-script', 'get-backend-port'];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Invalid channel: ${channel}`);
  },
  
  // API请求转发
  apiRequest: async <T = any>(method: string, endpoint: string, data?: any): Promise<T> => {
    return await ipcRenderer.invoke('api-request', { method, endpoint, data });
  },
  
  // 获取后端服务器端口
  getBackendPort: async (): Promise<number> => {
    return await ipcRenderer.invoke('get-backend-port');
  }
} as ElectronAPI);

// 定义全局类型声明，使TypeScript能够识别electron全局对象
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}