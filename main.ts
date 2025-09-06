import {app, BrowserWindow, ipcMain} from 'electron';
import {join} from 'path'
import {spawn} from 'child_process';
import * as fs from "node:fs";
import { ChildProcess } from 'node:child_process';
import * as http from 'node:http';
// 使用 Electron 的 app.getAppPath() 获取应用路径
const getAppDir = () => {
  return app.isPackaged ? join(app.getAppPath(),"..") : process.cwd();
};
console.log('app.getAppPath()', app.getAppPath());
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const __dirname = import.meta.dirname;

// 确保应用是单实例的
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

// Python后端服务器进程
let pythonProcess: ChildProcess | null = null;
// 后端服务器端口号
const BACKEND_PORT = 8000;
const BACKEND_HOST = '127.0.0.1';
function startPythonServer() {
  // 启动Python后端服务
  const isWindows = process.platform === 'win32';
  const backendDir = join(app.getAppPath(), 'backend');
  const pythonExecutable = join(backendDir, isWindows ? '.venv\\Scripts\\python.exe' : 'venv/bin/python');
  const mainScript = join(backendDir, 'main.py');

  // 检查Python可执行文件是否存在
  if (!fs.existsSync(pythonExecutable)) {
    console.error(`Python executable not found: ${pythonExecutable}`);
    return;
  }
  // 启动Python进程
  pythonProcess = spawn(pythonExecutable, [mainScript], {
    cwd: backendDir,
    env: {...process.env, ELECTRON_RUN: '1'}
  });

  // 处理Python进程输出
  if (pythonProcess.stdout) {
    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python stdout: ${data}`);
    });
  }


  if (pythonProcess.stderr) {
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });
  }

  pythonProcess.on('error', (error) => {
    console.error(`Failed to start Python process: ${error}`);
  });


  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    pythonProcess = null;
  });
}

// 创建窗口函数
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    // titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    center: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,

    },
  });

  // 根据开发环境加载不同的URL
  if (app.isPackaged) {
    // 生产环境加载打包后的文件
    mainWindow.loadFile(join(getAppDir(), '../dist/index.html'));
  } else {
    // 开发环境加载Vite开发服务器
    mainWindow.loadURL('http://localhost:5173');
    // 打开开发者工具
    mainWindow.webContents.openDevTools();
  }

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    if (pythonProcess) {
      pythonProcess.kill();
      pythonProcess = null;
    }
  });
}

// IPC通信示例
ipcMain.on('ping', (event) => {
  event.reply('pong', 'Hello from Electron!');
});

// API请求转发处理
ipcMain.handle('api-request', async (event, { method, endpoint, data }) => {
  return new Promise((resolve, reject) => {
    try {
      // 构建完整的URL
      const url = `http://${BACKEND_HOST}:${BACKEND_PORT}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      // 配置请求选项
      const options: http.RequestOptions = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          // 可以添加其他需要的头信息
        }
      };

      // 发送请求
      const req = http.request(url, options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            // 尝试解析JSON响应
            const parsedData = JSON.parse(responseData);
            resolve(parsedData);
          } catch (error) {
            // 如果不是JSON响应，直接返回原始数据
            resolve(responseData);
          }
        });
      });

      // 处理请求错误
      req.on('error', (error) => {
        console.error('API request error:', error);
        reject(new Error(`API request failed: ${error.message}`));
      });

      // 如果有数据，发送数据
      if (data) {
        req.write(JSON.stringify(data));
      }

      // 结束请求
      req.end();
    } catch (error) {
      console.error('API request setup error:', error);
      reject(new Error(`Failed to setup API request: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
});

// 获取后端服务器端口
ipcMain.handle('get-backend-port', () => {
  return BACKEND_PORT;
});

// 应用事件
app.on('ready', () => {
  createWindow();
  if (!app.isPackaged) {
    // 在开发环境中启动Python服务器
    startPythonServer();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 确保Python进程在应用退出时被终止
app.on('before-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});