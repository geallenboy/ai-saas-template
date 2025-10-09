'use client'

import { useCompletion } from '@ai-sdk/react'
import { CalendarIcon, PlayIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MCPToolsPage() {
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/ai/guides/mcp-tools',
  })

  const handleScheduleCall = async () => {
    if (isLoading) return

    await complete(
      '请为我安排明天上午10点（东部时间）与 Sonny 和 Robby 的会议！'
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            MCP 工具集成示例
          </CardTitle>
          <p className="text-muted-foreground">
            学习如何集成和使用 Model Context Protocol (MCP) 工具
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">功能特点：</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 集成 Model Context Protocol (MCP) 工具</li>
              <li>• 支持外部应用和服务调用</li>
              <li>• 扩展 AI 模型的能力边界</li>
              <li>• 标准化的协议接口</li>
            </ul>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              💡 MCP 允许 AI 模型与外部工具和服务进行标准化通信
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">操作演示</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              点击按钮演示 MCP 工具调用，AI 将尝试安排一个会议
            </p>

            <Button
              onClick={handleScheduleCall}
              disabled={isLoading}
              className="w-full"
              variant="default"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  正在处理...
                </>
              ) : (
                <>
                  <PlayIcon className="mr-2 h-4 w-4" />
                  安排会议
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">执行结果</CardTitle>
          </CardHeader>
          <CardContent>
            {completion ? (
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">{completion}</pre>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>点击"安排会议"按钮查看 MCP 工具执行结果</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
