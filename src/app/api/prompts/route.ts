import { roles } from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";

// 写死的 prompts 数据
const mockPrompts = [
  {
    id: 1,
    title: "代码审查",
    content: "请帮我审查以下代码，找出潜在的问题和改进建议",
    category: "coding",
    tags: ["code-review", "debugging"],
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    title: "文档优化",
    content: "请帮我优化这个文档的结构和内容，使其更清晰易懂",
    category: "writing",
    tags: ["documentation", "optimization"],
    created_at: "2024-01-02T00:00:00Z"
  },
  {
    id: 3,
    title: "数据分析",
    content: "请分析以下数据，提供洞察和建议",
    category: "analysis",
    tags: ["data", "insights"],
    created_at: "2024-01-03T00:00:00Z"
  },
  {
    id: 4,
    title: "算法优化",
    content: "请帮我优化这个算法的时间复杂度和空间复杂度",
    category: "coding",
    tags: ["algorithm", "optimization"],
    created_at: "2024-01-04T00:00:00Z"
  },
  {
    id: 5,
    title: "项目规划",
    content: "请帮我制定一个详细的项目开发计划和时间表",
    category: "planning",
    tags: ["project", "planning"],
    created_at: "2024-01-05T00:00:00Z"
  }
];

export async function GET(req: NextRequest) {
  return NextResponse.json({ prompts: mockPrompts });
}
