import { Card } from "@/components/ui/card";

export function Dashboard() {
  return (
    <div className="flex-1 space-y-6 custom-scrollbar overflow-y-auto">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                总测试用例
              </p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">📊</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">+12% 较上周</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                通过率
              </p>
              <p className="text-2xl font-bold">94.2%</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✅</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">+2.1% 较上周</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                活跃项目
              </p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm">🚀</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">+1 新项目</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                AI分析
              </p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-sm">🤖</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">本周分析次数</p>
        </Card>
      </div>

      {/* 最近活动 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">最近活动</h3>
        <div className="space-y-4">
          {[
            {
              action: "测试用例执行完成",
              project: "电商APP测试",
              time: "2分钟前",
              status: "success",
            },
            {
              action: "AI分析报告生成",
              project: "支付系统测试",
              time: "15分钟前",
              status: "info",
            },
            {
              action: "测试用例失败",
              project: "用户注册流程",
              time: "1小时前",
              status: "error",
            },
            {
              action: "新项目创建",
              project: "移动端适配测试",
              time: "2小时前",
              status: "success",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.status === "success"
                      ? "bg-green-500"
                      : activity.status === "error"
                        ? "bg-red-500"
                        : "bg-blue-500"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.project}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
