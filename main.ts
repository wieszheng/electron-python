import {app, BrowserWindow, ipcMain} from 'electron';
import {join} from 'path'
import {spawn} from 'child_process';
import * as fs from "node:fs";
import { ChildProcess } from 'node:child_process';

// 确保应用是单实例的
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

// Python后端服务器进程
let pythonProcess: ChildProcess | null = null;

function startPythonServer() {
  // 启动Python后端服务
  const isWindows = process.platform === 'win32';
  const backendDir = join(app.getAppPath(), '..', 'backend');
  const pythonExecutable = join(backendDir, isWindows ? 'venv\\Scripts\\python.exe' : 'venv/bin/python');
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
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    title: 'Electron Python App',
    autoHideMenuBar: true
  });

  // 根据开发环境加载不同的URL
  if (app.isPackaged) {
    // 生产环境加载打包后的文件
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
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