import { useState } from "react";
import { Card } from "@/components/ui/card";

export function AIAnalysis() {
  const [selectedAnalysis, setSelectedAnalysis] = useState("performance");

  const analysisData = {
    performance: {
      title: "性能分析",
      insights: [
        {
          metric: "平均响应时间",
          value: "1.2s",
          trend: "down",
          change: "-15%",
        },
        { metric: "内存使用率", value: "68%", trend: "up", change: "+5%" },
        { metric: "CPU使用率", value: "45%", trend: "down", change: "-8%" },
        { metric: "网络延迟", value: "120ms", trend: "stable", change: "0%" },
      ],
      recommendations: [
        "建议优化图片加载策略，可减少20%的加载时间",
        "检测到内存泄漏风险，建议检查组件卸载逻辑",
        "API响应时间波动较大，建议添加缓存机制",
      ],
    },
    quality: {
      title: "质量分析",
      insights: [
        { metric: "代码覆盖率", value: "87%", trend: "up", change: "+3%" },
        {
          metric: "缺陷密度",
          value: "0.8/KLOC",
          trend: "down",
          change: "-12%",
        },
        { metric: "技术债务", value: "2.1天", trend: "down", change: "-0.5天" },
        { metric: "可维护性", value: "A级", trend: "stable", change: "0" },
      ],
      recommendations: [
        "单元测试覆盖率可进一步提升至90%以上",
        "发现3个高风险代码片段，建议优先重构",
        "API文档完整度需要改进，当前仅65%",
      ],
    },
  };

  const currentData =
    analysisData[selectedAnalysis as keyof typeof analysisData];

  return (
    <div className="flex-1 space-y-4">
      {/* 分析类型选择 */}
      <div className="flex gap-2">
        {Object.entries(analysisData).map(([key, data]) => (
          <button
            key={key}
            onClick={() => setSelectedAnalysis(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedAnalysis === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {data.title}
          </button>
        ))}
      </div>

      {/* AI分析结果 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 关键指标 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🤖 AI智能分析 - {currentData.title}
          </h3>
          <div className="space-y-4">
            {currentData.insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{insight.metric}</p>
                  <p className="text-lg font-bold">{insight.value}</p>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    insight.trend === "up"
                      ? "text-green-600"
                      : insight.trend === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  <span>
                    {insight.trend === "up"
                      ? "↗"
                      : insight.trend === "down"
                        ? "↘"
                        : "→"}
                  </span>
                  <span>{insight.change}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI建议 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            💡 AI智能建议
          </h3>
          <div className="space-y-3">
            {currentData.recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500"
              >
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
            生成详细报告
          </button>
        </Card>
      </div>
    </div>
  );
}
