import { useState } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { ChevronRight, Minus, Square, X } from "lucide-react";
import { ProjectManagement } from "@/components/Project";
import { Settings } from "@/components/Settings";
import { Dashboard } from "@/components/Dashboard.tsx";
import { AIAnalysis } from "@/components/AIAnalysis.tsx";
function ReportsPage() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">测试报告</h1>
      <p className="text-muted-foreground">这里是测试报告页面内容</p>
    </div>
  );
}

function AutomationPage() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">自动化</h1>
      <p className="text-muted-foreground">这里是自动化页面内容</p>
    </div>
  );
}

function TestCasesPage() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">测试用例</h1>
      <p className="text-muted-foreground">这里是测试用例页面内容</p>
    </div>
  );
}

function getPageTitle(activePage: string) {
  const titles = {
    dashboard: "仪表盘",
    projects: "项目管理",
    "test-cases": "测试用例",
    "ai-analysis": "AI 分析",
    reports: "测试报告",
    automation: "自动化",
    settings: "设置",
  };
  return titles[activePage as keyof typeof titles] || "项目管理";
}
function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "projects":
        return <ProjectManagement />;
      case "test-cases":
        return <TestCasesPage />;
      case "ai-analysis":
        return <AIAnalysis />;
      case "reports":
        return <ReportsPage />;
      case "automation":
        return <AutomationPage />;
      case "settings":
        return <Settings />;
      default:
        return <ProjectManagement />;
    }
  };
  function WindowControls() {
    return (
      <div className="flex items-center gap-1 electron-no-drag">
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded transition-colors"
          onClick={() => window.electron.ipcRenderer.send("window-minimize")}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded transition-colors"
          onClick={() => window.electron.ipcRenderer.send("window-maximize")}
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground rounded transition-colors"
          onClick={() => window.electron.ipcRenderer.send("window-close")}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-shrink-0 h-8 bg-card flex items-center justify-between px-4 electron-drag">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground electron-no-drag">
            <span className="text-primary">🤖</span>
            <span>APP UI 自动化测试平台</span>
          </div>
          <WindowControls />
        </div>
        <div className="flex flex-1 min-h-0">
          {/*  /!* 左侧侧边栏卡片 *!/*/}
          <Sidebar onPageChange={setActivePage} activePage={activePage} />
          {/*  /!* 右侧页面区 *!/*/}
          <div className="flex-1 flex flex-col gap-4 min-w-0 p-2">
            <div className="flex-shrink-0 p-2 bg-card border rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex">
                  <ChevronRight className="w-5 h-5 mr-1 text-muted-foreground" />
                  <h1 className="text-sm font-bold tracking-tight">
                    {getPageTitle(activePage)}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">{renderPage()}</div>
            </div>
          </div>
        </div>
      </div>
      {/*<div className="flex h-screen bg-background p-1 gap-2">*/}
      {/*  /!* 左侧侧边栏卡片 *!/*/}
      {/*  <Sidebar onPageChange={setActivePage} activePage={activePage} />*/}

      {/*  /!* 右侧页面区 *!/*/}
      {/*  <div className="flex-1 flex flex-col gap-2 min-w-0">*/}
      {/*    <div className="flex-shrink-0 p-2 bg-card border rounded-lg shadow-sm">*/}
      {/*      <div className="flex items-center justify-between">*/}
      {/*        <div className="flex">*/}
      {/*          <ChevronRight className="w-5 h-5 mr-1 text-muted-foreground" />*/}
      {/*          <h1 className="text-sm font-bold tracking-tight">*/}
      {/*            {getPageTitle(activePage)}*/}
      {/*          </h1>*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}

      {/*    <div className="flex-1 overflow-hidden  bg-card border rounded-lg shadow-sm">*/}
      {/*      <div className="h-full overflow-y-auto">{renderPage()}</div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
    </ThemeProvider>
  );
}

export default App;
