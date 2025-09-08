import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoRun: false,
    reportEmail: "admin@example.com",
    maxConcurrent: 5,
    timeout: 30,
    retryCount: 3,
  });

  const [electronInfo, setElectronInfo] = useState({
    nodeVersion: "检测中...",
    chromeVersion: "检测中...",
    electronVersion: "检测中...",
    backendPort: "检测中...",
    apiStatus: "检测中...",
  });

  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateProgress, setUpdateProgress] = useState(0);

  const handleCheckForUpdates = async () => {
    try {
      setIsCheckingUpdate(true);
      setUpdateStatus("正在检查更新...");
      setUpdateProgress(0);

      await window.electron.checkForUpdates();
    } catch (error) {
      console.error("检查更新失败:", error);
      setUpdateStatus(
        `检查更新失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  useEffect(() => {
    if (window.electron) {
      console.log("Electron API可用，开始测试功能");

      // 测试版本信息
      try {
        setElectronInfo((prev) => ({
          ...prev,
          nodeVersion: window.electron.node(),
          chromeVersion: window.electron.chrome(),
          electronVersion: window.electron.electron(),
        }));
      } catch (error) {
        console.error("获取版本信息失败:", error);
      }

      // 测试后端端口获取
      window.electron
        .getBackendPort()
        .then((port) => {
          console.log("获取到后端端口:", port);
          setElectronInfo((prev) => ({
            ...prev,
            backendPort: port.toString(),
          }));
        })
        .catch((error) => {
          console.error("获取后端端口失败:", error);
          setElectronInfo((prev) => ({ ...prev, backendPort: "获取失败" }));
        });

      // 测试API请求
      window.electron
        .callApi("GET", "/api/health")
        .then((response) => {
          console.log("API测试成功:", response);
          if (response.success) {
            setElectronInfo((prev) => ({ ...prev, apiStatus: "API连接正常" }));
          } else {
            setElectronInfo((prev) => ({ ...prev, apiStatus: "API连接失败" }));
          }
        })
        .catch((error) => {
          console.error("API测试失败:", error);
          setElectronInfo((prev) => ({ ...prev, apiStatus: "API连接失败" }));
        });

      // 监听更新进度
      const unsubscribeProgress = window.electron.onUpdateProgress(
        (progress) => {
          setUpdateProgress(progress);
        },
      );

      return () => {
        unsubscribeProgress();
      };
    } else {
      console.warn("Electron API不可用");
      setElectronInfo({
        nodeVersion: "Electron API不可用",
        chromeVersion: "Electron API不可用",
        electronVersion: "Electron API不可用",
        backendPort: "Electron API不可用",
        apiStatus: "Electron API不可用",
      });
    }
  }, []);
  return (
    <div className="flex-1 space-y-6">
      <div className="grid gap-3">
        {/* 通知设置 */}

        <div className="p-2 bg-card border rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">通知设置</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">启用通知</label>
                <p className="text-xs text-muted-foreground">
                  接收测试完成和失败通知
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) =>
                  setSettings({ ...settings, notifications: e.target.checked })
                }
                className="h-4 w-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">报告邮箱</label>
              <input
                type="email"
                value={settings.reportEmail}
                onChange={(e) =>
                  setSettings({ ...settings, reportEmail: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* 系统信息 */}
        <div className="p-3 bg-card border rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">系统信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Node.js版本:</span>
              <span>{electronInfo.nodeVersion}</span>
            </div>
            <div className="flex justify-between">
              <span>Chrome版本:</span>
              <span>{electronInfo.chromeVersion}</span>
            </div>
            <div className="flex justify-between">
              <span>Electron版本:</span>
              <span>{electronInfo.electronVersion}</span>
            </div>
            <div className="flex justify-between">
              <span>后端端口:</span>
              <span>{electronInfo.backendPort}</span>
            </div>
            <div className="flex justify-between">
              <span>API状态:</span>
              <span
                className={
                  electronInfo.apiStatus === "API连接正常"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {electronInfo.apiStatus}
              </span>
            </div>
          </div>
        </div>

        {/* 应用更新 */}
        <div className="p-3">
          <h3 className="text-lg font-semibold mb-4">应用更新</h3>
          <Button onClick={handleCheckForUpdates} disabled={isCheckingUpdate}>
            {isCheckingUpdate ? "检查中..." : "检查更新"}
          </Button>

          {updateStatus && (
            <div className="mt-2 text-sm text-muted-foreground">
              {updateStatus}
            </div>
          )}

          {updateProgress > 0 && (
            <div className="mt-2">
              <div className="w-full bg-background border rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${updateProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-right text-muted-foreground mt-1">
                {updateProgress}%
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Button>保存设置</Button>
          <Button variant="outline">重置默认</Button>
        </div>
      </div>
    </div>
  );
}
