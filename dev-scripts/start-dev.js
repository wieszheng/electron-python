import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// ES模块中没有__dirname，需要手动创建
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保目录存在
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// 日志记录函数
const log = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '\x1b[32m', // 绿色
    error: '\x1b[31m', // 红色
    warning: '\x1b[33m', // 黄色
    electron: '\x1b[34m', // 蓝色
    python: '\x1b[35m', // 紫色
    reset: '\x1b[0m' // 重置颜色
  };
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

// 启动函数
const start = async () => {
  // 记录启动时间
  const startTime = Date.now();
  log('开始启动开发环境...');

  // 定义进程列表
  const processes = [];

  try {
    // 1. 首先尝试安装Python依赖
    log('安装Python依赖...', 'info');
    const pythonInstall = spawn('pip', ['install', '-r', 'backend/requirements.txt'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });

    await new Promise((resolve) => {
      pythonInstall.on('close', (code) => {
        if (code === 0) {
          log('Python依赖安装成功', 'python');
        } else {
          log('Python依赖安装失败，将尝试继续启动服务', 'warning');
        }
        resolve(code);
      });
    });

    // 2. 启动Python后端服务
    log('启动Python后端服务...', 'python');
    const pythonProcess = spawn('python', ['backend/main.py'], {
      cwd: path.join(__dirname, '..'),
      shell: true
    });

    pythonProcess.stdout.on('data', (data) => {
      log(`Python: ${data}`, 'python');
    });

    pythonProcess.stderr.on('data', (data) => {
      log(`Python错误: ${data}`, 'error');
    });

    pythonProcess.on('close', (code) => {
      log(`Python进程退出，代码: ${code}`, 'error');
    });

    processes.push(pythonProcess);

    // 等待Python服务启动
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. 启动Electron + Vite开发服务器
    log('启动Electron + Vite开发服务器...', 'electron');
    const viteProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });

    viteProcess.on('close', (code) => {
      log(`Vite进程退出，代码: ${code}`, 'error');
      // 如果Vite进程退出，关闭所有其他进程
      cleanup();
    });

    processes.push(viteProcess);

    // 记录启动完成时间
    const endTime = Date.now();
    log(`开发环境启动完成，耗时 ${(endTime - startTime) / 1000} 秒`, 'info');
    log('按 Ctrl+C 停止所有服务', 'info');

  } catch (error) {
    log(`启动失败: ${error.message}`, 'error');
    cleanup();
  }

  // 清理函数
  function cleanup() {
    log('正在停止所有服务...', 'info');
    processes.forEach(process => {
      try {
        process.kill();
      } catch (e) {
        // 忽略错误
      }
    });
    log('所有服务已停止', 'info');
    process.exit(0);
  }

  // 监听退出信号
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
};

// 启动开发环境
start();