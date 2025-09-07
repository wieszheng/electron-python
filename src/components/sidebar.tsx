import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  Bot,
  FolderOpen,
  LayoutDashboard,
  Moon,
  Settings,
  Sparkles,
  Sun,
  TestTube,
  Zap,
} from "lucide-react";

import { useTheme } from "@/components/theme-provider";

interface SidebarProps {
  className?: string;
  onPageChange?: (page: string) => void;
  activePage?: string;
}

const menuItems = [
  {
    title: "仪表盘",
    icon: LayoutDashboard,
    page: "dashboard",
    badge: null,
  },
  {
    title: "项目管理",
    icon: FolderOpen,
    page: "projects",
    badge: null,
  },
  {
    title: "测试用例",
    icon: TestTube,
    page: "test-cases",
    badge: "12",
  },
  {
    title: "AI 分析",
    icon: Bot,
    page: "ai-analysis",
    badge: "NEW",
  },
  {
    title: "测试报告",
    icon: BarChart3,
    page: "reports",
    badge: null,
  },
  {
    title: "自动化",
    icon: Zap,
    page: "automation",
    badge: null,
  },
  {
    title: "设置",
    icon: Settings,
    page: "settings",
    badge: null,
  },
];

export function Sidebar({
  className,
  onPageChange,
  activePage = "projects",
}: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "flex flex-col h-full transition-all duration-300 ease-in-out bg-card border rounded-lg shadow-sm",
        isHovered ? "w-44" : "w-16",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isHovered ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">
              Perf X
            </span>
          </div>
        )}
      </div>
      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-3">
          {menuItems.map((item) => {
            const isActive = activePage === item.page;
            return (
              <Button
                key={item.page}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-8",
                  !isHovered && "justify-center px-2",
                  isActive && "bg-primary text-primary-foreground",
                )}
                onClick={() => onPageChange?.(item.page)}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {isHovered && (
                  <>
                    <span className="flex-1 text-left">{item.title}</span>
                    {/*{item.badge && (*/}
                    {/*  <Badge variant={item.badge === "NEW" ? "default" : "secondary"} className="h-5 text-xs">*/}
                    {/*    {item.badge}*/}
                    {/*  </Badge>*/}
                    {/*)}*/}
                  </>
                )}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-3">
        {!isHovered ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full h-10"
          >
            <Moon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Sun className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full justify-start gap-3 h-10"
          >
            <Moon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Sun className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span>切换主题</span>
          </Button>
        )}
      </div>
    </div>
  );
}
