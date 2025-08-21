import { NextRequest, NextResponse } from "next/server";

// 写死的 bots 数据
const mockBots = [
  {
    id: 1,
    name: "AI Assistant",
    description: "通用AI助手，帮助回答各种问题",
    avatar: "🤖",
    model: "gpt-4",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    name: "Code Helper",
    description: "专业的编程助手，帮助解决代码问题",
    avatar: "💻",
    model: "claude-3",
    created_at: "2024-01-02T00:00:00Z"
  },
  {
    id: 3,
    name: "Writing Expert",
    description: "写作专家，帮助改进文档和内容",
    avatar: "✍️",
    model: "gpt-4",
    created_at: "2024-01-03T00:00:00Z"
  },
  {
    id: 4,
    name: "Data Analyst",
    description: "数据分析专家，帮助分析和解释数据",
    avatar: "📊",
    model: "claude-3",
    created_at: "2024-01-04T00:00:00Z"
  }
];

export async function GET(req: NextRequest) {
  return NextResponse.json({ bots: mockBots });
}

