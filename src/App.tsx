import { useState } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { ChevronRight } from "lucide-react";
import { ProjectManagement } from "@/components/Project";
import { Settings } from "@/components/Settings";
function DashboardPage() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">仪表盘</h1>
      <p className="text-muted-foreground">这里是仪表盘页面内容</p>
    </div>
  );
}

function AIAnalysisPage() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">AI 分析</h1>
      <p className="text-muted-foreground">这里是AI分析页面内容</p>
    </div>
  );
}

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
        return <DashboardPage />;
      case "projects":
        return <ProjectManagement />;
      case "test-cases":
        return <TestCasesPage />;
      case "ai-analysis":
        return <AIAnalysisPage />;
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

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex h-screen bg-background p-1 gap-2">
        {/* 左侧侧边栏卡片 */}
        <Sidebar onPageChange={setActivePage} activePage={activePage} />

        {/* 右侧页面区 */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
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

          <div className="flex-1 overflow-hidden  bg-card border rounded-lg shadow-sm">
            <div className="h-full overflow-y-auto">{renderPage()}</div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
