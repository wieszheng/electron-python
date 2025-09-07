import { app, dialog, ipcMain, BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";

// 配置自动更新
function configureAutoUpdater() {
  // 设置更新服务器地址（使用 S3 provider）
  autoUpdater.setFeedURL({
    provider: "s3",
    bucket: process.env.ELECTRON_UPDATER_S3_BUCKET || "your-app-updates", // S3 存储桶名称
    region: process.env.ELECTRON_UPDATER_S3_REGION || "us-east-1", // S3 区域
    path: process.env.ELECTRON_UPDATER_S3_PATH || "/updates", // S3 路径前缀
    // 可选：如果使用自定义 S3 端点（如 MinIO）
    endpoint: process.env.ELECTRON_UPDATER_S3_ENDPOINT || undefined,
    // 可选：如果需要强制使用路径样式的 URL
    forcePathStyle:
      process.env.ELECTRON_UPDATER_S3_FORCE_PATH_STYLE === "true" || false,
  });

  // 禁用自动下载，只在用户确认后下载
  autoUpdater.autoDownload = false;
}

// 初始化自动更新
function initializeAutoUpdate(mainWindow: BrowserWindow) {
  if (!app.isPackaged) {
    console.log(
      "[Updater] Do not initialize automatic updates in the development environment.",
    );
    return;
  }

  configureAutoUpdater();
  setupUpdateEvents(mainWindow);

  // 延迟5秒后检查更新（给应用启动留出时间）
  // setTimeout(() => {
  //   checkForUpdatesSilently();
  // }, 5000);
}

// 设置更新事件处理
function setupUpdateEvents(mainWindow: BrowserWindow) {
  // 有可用更新时触发
  autoUpdater.on("update-available", (info) => {
    console.log("[Updater] Discover the new version:", info.version);

    if (mainWindow && !mainWindow.isDestroyed()) {
      (
        dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "发现更新",
          message: `发现新版本: ${info.version}`,
          detail: "是否立即下载更新？",
          buttons: ["立即下载", "稍后提醒"],
        }) as unknown as Promise<Electron.MessageBoxReturnValue>
      )
        .then((result) => {
          if (result.response === 0) {
            // 用户选择立即下载
            autoUpdater.downloadUpdate();
          }
        })
        .catch((error) => {
          console.error("[Updater] Dialog error:", error);
        });
    }
  });

  // 没有可用更新时触发
  autoUpdater.on("update-not-available", () => {
    console.log("[Updater] 当前已是最新版本");
  });

  // 更新下载完成时触发
  autoUpdater.on("update-downloaded", (info) => {
    console.log("[Updater] 更新下载完成:", info.version);

    if (mainWindow && !mainWindow.isDestroyed()) {
      (
        dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "更新下载完成",
          message: `更新已下载完成: ${info.version}`,
          detail: "应用将在重启后应用更新。是否立即重启应用？",
          buttons: ["立即重启", "稍后重启"],
        }) as unknown as Promise<Electron.MessageBoxReturnValue>
      )
        .then((result) => {
          if (result.response === 0) {
            // 用户选择立即重启
            autoUpdater.quitAndInstall();
          }
        })
        .catch((error) => {
          console.error("[Updater] Dialog error:", error);
        });
    }
  });

  // 更新错误时触发
  autoUpdater.on("error", (error) => {
    console.error("[Updater] 更新错误:", error);

    if (mainWindow && !mainWindow.isDestroyed()) {
      dialog.showMessageBox(mainWindow, {
        type: "error",
        title: "更新失败",
        message: "检查更新时发生错误",
        detail: error.message,
        buttons: ["确定"],
      });
    }
  });

  // 更新下载进度事件
  autoUpdater.on("download-progress", (progress) => {
    const percent = Math.round(progress.percent);
    console.log(`[Updater] 下载进度: ${percent}%`);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update-progress", percent);
    }
  });
}

// 静默检查更新（不弹出对话框）
async function checkForUpdatesSilently() {
  if (!app.isPackaged) {
    console.log("[Updater] 开发环境下不检查更新");
    return;
  }

  try {
    console.log("[Updater] 静默检查更新");
    await autoUpdater.checkForUpdates();
  } catch (error) {
    console.error("[Updater] 静默检查更新失败:", error);
  }
}

// 手动检查更新
async function checkForUpdatesManually() {
  if (!app.isPackaged) {
    console.log("[Updater] 开发环境下不检查更新");
    return;
  }

  try {
    console.log("[Updater] 手动检查更新");
    await autoUpdater.checkForUpdates();
  } catch (error) {
    console.error("[Updater] 手动检查更新失败:", error);
    throw new Error(
      `检查更新失败: ${error instanceof Error ? error.message : "未知错误"}`,
    );
  }
}

// 立即退出并安装更新
function quitAndInstallUpdate() {
  if (app.isPackaged) {
    console.log("[Updater] 立即退出并安装更新");
    autoUpdater.quitAndInstall();
  }
}

// 注册IPC处理程序
function registerIpcHandlers() {
  // 手动检查更新
  ipcMain.handle("check-for-updates", async () => {
    return checkForUpdatesManually();
  });

  // 立即退出并安装更新
  ipcMain.handle("quit-and-install-update", () => {
    quitAndInstallUpdate();
  });
}

export { initializeAutoUpdate, registerIpcHandlers };
