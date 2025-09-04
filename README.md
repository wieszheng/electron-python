# Electron + React + Python 跨平台桌面客户端工具

一个基于现代技术栈构建的跨平台桌面应用程序框架，结合了前端界面、跨平台能力和后端服务。

## 技术栈

- **前端**：React + Vite + TypeScript
- **跨平台**：Electron + TypeScript
- **后端**：Python + FastAPI

## 项目结构

```
electron-python/
├── main.ts             # Electron主进程入口
├── preload.ts          # 渲染进程预加载脚本
├── src/                # React前端代码
│   ├── assets/         # 静态资源
│   ├── types/          # TypeScript类型定义
│   ├── App.tsx         # 主应用组件
│   ├── App.css         # 应用样式
│   └── main.tsx        # 渲染进程入口
├── backend/            # Python后端代码
│   ├── main.py         # FastAPI服务器入口
│   └── requirements.txt # Python依赖
├── dev-scripts/        # 开发脚本
│   ├── start-dev.js    # 开发环境启动脚本
│   └── package-python.py # Python代码打包脚本
├── public/             # 公共静态资源
└── package.json        # 项目配置和依赖
```

## 特性

1. **现代前端开发**：使用React和TypeScript构建高效、可维护的用户界面
2. **跨平台能力**：通过Electron支持Windows、macOS和Linux
3. **强大后端服务**：使用Python和FastAPI处理复杂业务逻辑
4. **安全通信**：使用IPC和RESTful API进行前后端通信
5. **热重载开发**：支持开发环境中的实时预览和代码更新
6. **一键构建**：支持快速打包为各平台可分发格式

## 安装要求

- **Node.js** (v18+)
- **Python** (v3.8+)
- **npm** 或 **yarn** 或 **pnpm** 包管理器

## 快速开始

### 1. 安装Node.js依赖

```bash
npm install
```

### 2. 安装Python依赖

```bash
npm run install-python
```

### 3. 启动开发环境

```bash
node dev-scripts/start-dev.js
```

这将启动三个服务：
- Python FastAPI后端服务 (端口: 8000)
- Vite开发服务器 (端口: 5173)
- Electron应用程序

## 构建应用

### 开发构建

```bash
npm run build
```

### 打包为桌面应用

```bash
npm run electron:build
```

构建后的应用程序将位于 `electron-dist` 目录中。

## 目录说明

### 前端部分 (React + TypeScript)

- `src/App.tsx`: 主应用组件，包含示例功能和界面
- `src/types/electron.d.ts`: Electron API类型定义
- `src/App.css`: 应用样式

### 跨平台部分 (Electron)

- `main.ts`: Electron主进程，负责窗口管理和系统交互
- `preload.ts`: 预加载脚本，提供渲染进程和主进程间的安全通信

### 后端部分 (Python + FastAPI)

- `backend/main.py`: FastAPI服务器主文件，包含API端点定义
- `backend/requirements.txt`: Python依赖列表

### 开发工具

- `dev-scripts/start-dev.js`: 开发环境一键启动脚本
- `dev-scripts/package-python.py`: Python代码打包工具

## API端点

后端提供了以下API端点：

- **GET /**: 健康检查端点
- **GET /system-info**: 获取系统信息
- **POST /calculate**: 执行数学计算
- **POST /file-content**: 读取文件内容

## 安全注意事项

- 在生产环境中，应限制CORS来源
- 实现文件访问时应添加适当的安全检查
- 避免在客户端存储敏感信息
- 使用环境变量管理配置

## 许可证

[MIT](LICENSE) - 详情请查看LICENSE文件

## 贡献指南

1. Fork此仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 问题和反馈

如有任何问题或建议，请在GitHub仓库中提交Issue。

---

© 2025 Electron-Python App. 保留所有权利。
