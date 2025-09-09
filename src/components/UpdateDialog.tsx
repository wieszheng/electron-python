import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface UpdateStatus {
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

export function UpdateDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // 统一管理更新状态，减少冗余状态变量
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);

  // 当对话框打开时自动检查更新
  useEffect(() => {
    if (isOpen) {
      handleCheckUpdate();
    }
  }, [isOpen]);

  // 监听更新状态变化
  useEffect(() => {
    const handleUpdateStatus = (status: UpdateStatus) => {
      console.log("Received update status:", status);
      setUpdateStatus(status);
    };

    window.electron.onUpdateStatus(handleUpdateStatus);

    return () => {
      window.electron.removeUpdateStatusListener(handleUpdateStatus);
    };
  }, []);

  // 检查更新函数 - 增加防抖和错误处理
  const handleCheckUpdate = async () => {
    if (updateStatus?.status === "checking") {
      console.log("Update check already in progress");
      return;
    }

    setUpdateStatus({ status: "checking", message: "正在检查更新..." });

    try {
      await window.electron.checkForUpdate();
    } catch (error) {
      console.error("Failed to check for updates:", error);
      setUpdateStatus({
        status: "error",
        message: `检查更新失败：${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  // 处理用户对更新提示的响应
  const handlePromptResponse = async (action: "download" | "cancel") => {
    try {
      if (action === "download" && updateStatus?.versionInfo) {
        setUpdateStatus({
          status: "downloading",
          message: `开始下载新版本 v${updateStatus.versionInfo.version}...`,
          versionInfo: updateStatus.versionInfo,
        });
      } else {
        setUpdateStatus({ status: "up-to-date", message: "已取消本次更新" });
      }

      await window.electron.respondToUpdatePrompt(action);
    } catch (error) {
      console.error(`Failed to send ${action} response:`, error);
      setUpdateStatus({
        status: "error",
        message: `操作失败：${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  // 处理立即安装更新
  const handleInstallNow = async () => {
    try {
      setUpdateStatus((prev) =>
        prev
          ? {
              ...prev,
              message: "正在安装更新，请稍候...",
            }
          : null,
      );

      await window.electron.installUpdateNow();
    } catch (error) {
      console.error("Failed to install update now:", error);
      setUpdateStatus({
        status: "error",
        message: `安装更新失败：${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  if (!isOpen) return null;

  // 统一的错误处理UI
  const renderErrorUI = () => (
    <div className="text-center py-2">
      <p className="font-medium mb-1">操作失败</p>
      <p className="text-sm text-muted-foreground mb-4">
        {updateStatus?.message}
      </p>
      <Button onClick={handleCheckUpdate}>重试</Button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">系统更新</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 检查更新状态 */}
        {updateStatus?.status === "checking" && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">
              {updateStatus.message}
            </p>
          </div>
        )}

        {/* 发现更新状态 */}
        {updateStatus?.status === "update-available" &&
          updateStatus.versionInfo && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">发现新版本</p>
                <p className="text-lg font-semibold">
                  v{updateStatus.versionInfo.version}
                </p>
                {updateStatus.versionInfo.releaseDate && (
                  <p className="text-xs text-muted-foreground">
                    发布日期: {updateStatus.versionInfo.releaseDate}
                  </p>
                )}
              </div>

              {/* 更新内容显示 */}
              {updateStatus.versionInfo.releaseNotes && (
                <div className="max-h-32 overflow-y-auto p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">更新内容：</h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-line">
                    {updateStatus.versionInfo.releaseNotes}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => handlePromptResponse("download")}
                  className="flex-1 px-4 py-2"
                >
                  立即更新
                </Button>
                <Button
                  onClick={onClose}
                  className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                >
                  稍后提醒
                </Button>
              </div>
            </div>
          )}

        {/* 下载进度状态 */}
        {(updateStatus?.status === "downloading" ||
          updateStatus?.status === "progress") && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                正在下载更新...
              </p>
              <div className="w-full mb-2">
                <Progress
                  value={updateStatus.progress || 0}
                  className="h-2 bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(updateStatus.progress || 0)}% 完成
              </p>
            </div>
          </div>
        )}

        {/* 更新准备就绪状态 */}
        {updateStatus?.status === "ready" && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <div>
              <p className="font-medium mb-1">更新下载完成</p>
              <p className="text-sm text-muted-foreground">
                点击安装并重启应用以完成更新
              </p>
            </div>
            <button
              onClick={handleInstallNow}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              安装并重启
            </button>
          </div>
        )}

        {/* 已是最新版本状态 */}
        {updateStatus?.status === "up-to-date" && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <p className="font-medium mb-1">已是最新版本</p>
            <p className="text-sm text-muted-foreground">
              当前版本 v{updateStatus.versionInfo?.version || "未知"}
            </p>
          </div>
        )}

        {/* 错误状态 */}
        {updateStatus?.status === "error" && renderErrorUI()}
      </Card>
    </div>
  );
}
