'use client'

import { PlayIcon, RefreshCwIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface NotificationData {
  notifications: Array<{
    name: string
    message: string
    minutesAgo: number
  }>
}

export default function GenerateObjectPage() {
  const [generation, setGeneration] = useState<NotificationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState('期末考试周期间的消息通知')

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/guides/generate-object', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('生成失败')
      }

      const json = await response.json()
      setGeneration(json)
    } catch (error) {
      console.error('生成错误:', error)
      setGeneration(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            结构化对象生成示例
          </CardTitle>
          <p className="text-muted-foreground">
            使用 AI SDK 的 generateObject 功能生成符合特定结构的数据对象
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">功能特点：</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 使用 generateObject API 生成结构化数据</li>
              <li>• 支持 Zod 模式验证确保数据类型安全</li>
              <li>• 生成符合特定接口的 TypeScript 对象</li>
              <li>• 适用于表单数据、配置文件等场景</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">输入配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">生成提示</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="描述你想要生成的对象类型..."
                className="mt-1"
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                  正在生成...
                </>
              ) : (
                <>
                  <PlayIcon className="mr-2 h-4 w-4" />
                  生成结构化对象
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">生成结果</CardTitle>
          </CardHeader>
          <CardContent>
            {generation ? (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">通知列表</h4>
                  <div className="space-y-3">
                    {generation.notifications?.map((notification, index) => (
                      <div
                        key={index}
                        className="bg-background p-3 rounded-md border border-border"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">
                            {notification.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {notification.minutesAgo} 分钟前
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium hover:text-primary">
                    查看原始 JSON 数据
                  </summary>
                  <pre className="mt-2 p-3 bg-muted/50 rounded-lg text-xs overflow-auto">
                    {JSON.stringify(generation, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>点击"生成结构化对象"按钮开始生成</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
