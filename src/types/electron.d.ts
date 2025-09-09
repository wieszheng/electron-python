// renderer/src/preload.d.ts
export interface UpdateStatus {
  status:
    | "checking"
    | "update-available"
    | "downloading"
    | "progress"
    | "ready"
    | "up-to-date"
    | "error";
  message: string;
  versionInfo?: { version: string; releaseDate: string; releaseNotes?: string };
  progress?: number;
}

// Electron API接口类型定义
export interface ElectronAPI {
  // 版本信息
  ipcRenderer: any;
  node: () => string;
  electron: () => string;
  chrome: () => string;
  // API请求转发
  callApi: (method: string, endpoint: string, data?: any) => Promise<any>;
  // 获取后端服务器端口
  getBackendPort: () => Promise<number>;
  // 自动更新相关API
  checkForUpdate: () => Promise<void>;
  onUpdateStatus: (callback: (status: UpdateStatus) => void) => void;
  removeUpdateStatusListener: (
    callback: (status: UpdateStatus) => void,
  ) => void;
  // --- 新增：发送用户响应 ---
  respondToUpdatePrompt: (action: "download" | "cancel") => Promise<void>;
  installUpdateNow: () => Promise<void>;
}

// 扩展Window接口，添加electron属性
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
