import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import * as fs from "node:fs";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import * as http from "node:http";
import getPort from "get-port";

// 使用 Electron 的 app.getAppPath() 获取应用路径
const getAppDir = () => {
  return app.isPackaged ? join(app.getAppPath(), "..") : process.cwd();
};
console.log("app.getAppPath()", app.getAppPath());
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const __dirname = import.meta.dirname;

// 确保应用是单实例的
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

// Python后端服务器进程
let pythonProcess: ChildProcessWithoutNullStreams | null = null;
// 后端服务器端口号
let BACKEND_PORT: number | undefined;
const BACKEND_HOST = "127.0.0.1";

async function startPythonServer() {
  BACKEND_PORT = await getPort();
  // 启动Python后端服务
  const isWindows = process.platform === "win32";
  const backendDir = join(app.getAppPath(), "backend");
  const pythonExecutable = join(
    backendDir,
    isWindows ? ".venv\\Scripts\\python.exe" : "venv/bin/python",
  );
  const mainScript = join(backendDir, "main.py");

  // 检查Python可执行文件是否存在
  if (!fs.existsSync(pythonExecutable)) {
    console.error(`Python executable not found: ${pythonExecutable}`);
    return;
  }
  // 启动Python进程
  pythonProcess = spawn(
    pythonExecutable,
    [mainScript, "--port", BACKEND_PORT.toString()],
    {
      cwd: backendDir,
      env: { ...process.env, ELECTRON_RUN: "1" },
    },
  );

  // 处理Python进程输出
  if (pythonProcess.stdout) {
    pythonProcess.stdout.on("data", (data) => {
      console.log(`Python stdout: ${data}`);
    });
  }

  if (pythonProcess.stderr) {
    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python stderr: ${data}`);
    });
  }

  pythonProcess.on("error", (error) => {
    console.error(`Failed to start Python process: ${error}`);
  });

  pythonProcess.on("close", (code) => {
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
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  // 根据开发环境加载不同的URL
  if (app.isPackaged) {
    // 生产环境加载打包后的文件
    mainWindow.loadFile(join(getAppDir(), "../dist/index.html"));
  } else {
    // 开发环境加载Vite开发服务器
    mainWindow.loadURL("http://localhost:5173");
    // 打开开发者工具
    mainWindow.webContents.openDevTools();
  }

  // 窗口关闭事件
  mainWindow.on("closed", () => {
    if (pythonProcess) {
      pythonProcess.kill();
      pythonProcess = null;
    }
  });
}

// IPC通信示例
ipcMain.on("ping", (event) => {
  event.reply("pong", "Hello from Electron!");
});

// IPC 接口：转发渲染进程请求到 FastAPI
ipcMain.handle("call-api", async (_, { method, endpoint, data }) => {
  try {
    const url = `http://${BACKEND_HOST}:${BACKEND_PORT}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : null,
    });
    const responseData = await response.json();
    return { success: true, data: responseData };
  } catch (error) {
    // 提取后端返回的错误信息（需与 FastAPI 异常处理对齐）
    const errorMessage = error.response?.data?.error || "服务端未知错误";
    return { success: false, error: errorMessage };
  }
});

// 获取后端服务器端口
ipcMain.handle("get-backend-port", () => {
  return BACKEND_PORT;
});

// 应用事件
app.on("ready", async () => {
  if (!app.isPackaged) {
    // 在开发环境中启动Python服务器
    await startPythonServer();
  }
  setTimeout(createWindow, 1000); // 等 FastAPI 启动后再打开窗口
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  // if (pythonProcess) pythonProcess.kill();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 确保Python进程在应用退出时被终止
app.on("before-quit", () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});
