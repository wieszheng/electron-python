import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Settings,
  Trash2,
  Eye,
  Users,
  TestTube,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

const projects = [
  {
    id: 1,
    name: "电商APP测试",
    description: "主要电商应用的UI自动化测试套件",
    status: "active",
    progress: 75,
    testCases: 156,
    passRate: 92,
    lastRun: "2小时前",
    team: ["张三", "李四", "王五"],
    aiInsights: true,
  },
  {
    id: 2,
    name: "支付系统测试",
    description: "支付流程关键路径测试",
    status: "running",
    progress: 45,
    testCases: 89,
    passRate: 88,
    lastRun: "正在运行",
    team: ["赵六", "钱七"],
    aiInsights: true,
  },
  {
    id: 3,
    name: "用户注册流程",
    description: "新用户注册和验证流程测试",
    status: "completed",
    progress: 100,
    testCases: 67,
    passRate: 95,
    lastRun: "1天前",
    team: ["孙八", "周九", "吴十"],
    aiInsights: false,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-500";
    case "running":
      return "bg-green-500";
    case "completed":
      return "bg-gray-500";
    case "paused":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "活跃";
    case "running":
      return "运行中";
    case "completed":
      return "已完成";
    case "paused":
      return "已暂停";
    default:
      return "未知";
  }
};

export function ProjectManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex-1 space-y-4 p-3">
      {/* Header */}

      {/* Search and Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索项目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            筛选
          </Button>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          新建项目
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">全部项目</TabsTrigger>
          <TabsTrigger value="active">活跃项目</TabsTrigger>
          <TabsTrigger value="running">运行中</TabsTrigger>
          <TabsTrigger value="completed">已完成</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {project.name}
                        {project.aiInsights && (
                          <Sparkles className="h-4 w-4 text-primary" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {project.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Play className="mr-2 h-4 w-4" />
                          运行测试
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          设置
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusColor(project.status)}`}
                    />
                    <Badge variant="secondary" className="text-xs">
                      {getStatusText(project.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>测试进度</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-muted-foreground" />
                      <span>{project.testCases} 用例</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{project.passRate}% 通过</span>
                    </div>
                  </div>

                  {/* Team and Last Run */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{project.team.length} 成员</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>最后运行: {project.lastRun}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Play className="mr-2 h-3 w-3" />
                      运行
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
