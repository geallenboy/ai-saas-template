'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { inferRouterOutputs } from '@trpc/server'
import { Loader2, PenSquareIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  type BlogWriteInput,
  blogStatusSchema,
  blogWriteSchema,
} from '@/lib/validators/blog'
import { trpc } from '@/server/client'
import type { AppRouter } from '@/server/root'
import { locales } from '@/translate/i18n/config'

type RouterOutputs = inferRouterOutputs<AppRouter>
type BlogListItem = RouterOutputs['blog']['list']['posts'][number]

const defaultValues: BlogWriteInput = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImageUrl: '',
  tags: [],
  isFeatured: false,
  status: 'draft',
  locale: 'zh',
  publishedAt: undefined,
}

export function AdminBlogManager() {
  const utils = trpc.useUtils()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogListItem | null>(null)

  const listQuery = trpc.blog.list.useQuery({
    page: 1,
    limit: 50,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  })

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success('文章创建成功')
      utils.blog.list.invalidate()
      handleDialogClose()
    },
    onError: error => {
      toast.error(`创建文章失败：${error.message}`)
    },
  })

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success('文章更新成功')
      utils.blog.list.invalidate()
      handleDialogClose()
    },
    onError: error => {
      toast.error(`更新文章失败：${error.message}`)
    },
  })

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success('文章已删除')
      utils.blog.list.invalidate()
    },
    onError: error => {
      toast.error(`删除文章失败：${error.message}`)
    },
  })

  const form = useForm<BlogWriteInput>({
    resolver: zodResolver(blogWriteSchema) as Resolver<BlogWriteInput>,
    defaultValues,
  })

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingPost(null)
    form.reset(defaultValues)
  }

  const handleCreateClick = () => {
    setEditingPost(null)
    form.reset(defaultValues)
    setDialogOpen(true)
  }

  const handleEditClick = (post: BlogListItem) => {
    setEditingPost(post)
    form.reset({
      title: post.title,
      slug: post.slug,
      summary: post.summary ?? '',
      content: post.content,
      coverImageUrl: post.coverImageUrl ?? '',
      tags: post.tags ?? [],
      isFeatured: post.isFeatured,
      status: post.status,
      locale: post.locale,
      publishedAt: post.publishedAt ?? undefined,
    })
    setDialogOpen(true)
  }

  const onSubmit = form.handleSubmit(async (values: BlogWriteInput) => {
    const payload: BlogWriteInput = {
      ...values,
      coverImageUrl: values.coverImageUrl || undefined,
      tags: values.tags ?? [],
      publishedAt: values.publishedAt ?? undefined,
    }

    if (editingPost) {
      await updateMutation.mutateAsync({ id: editingPost.id, ...payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const posts = listQuery.data?.posts ?? []
  const total = listQuery.data?.total ?? 0

  const statusOptions = useMemo(() => blogStatusSchema.options, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">博客管理</h1>
          <p className="text-muted-foreground text-sm">
            创建、编辑并发布展示在前台的博客文章
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={open => {
            if (open) {
              setDialogOpen(true)
            } else {
              handleDialogClose()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={handleCreateClick}
              className="inline-flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              新建文章
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPost ? '编辑文章' : '创建文章'}</DialogTitle>
              <DialogDescription>
                {editingPost
                  ? '更新文章内容并保存更改。'
                  : '填写文章信息并发布到前台。'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          标题 <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="请输入文章标题" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Slug <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="unique-slug" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="locale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>语言</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择语言" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locales.map(locale => (
                              <SelectItem key={locale} value={locale}>
                                {locale}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>状态</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择状态" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map(status => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>摘要</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="简要介绍文章内容"
                          className="min-h-[80px]"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        正文 <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="支持 Markdown / 文本内容"
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="coverImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>封面图 URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/cover.png"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>标签</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="使用逗号分隔，例如：AI, 产品"
                            value={field.value?.join(', ') ?? ''}
                            onChange={event =>
                              field.onChange(
                                event.target.value
                                  .split(',')
                                  .map(tag => tag.trim())
                                  .filter(Boolean)
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <FormLabel className="text-base">首页推荐</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {'在博客列表中突出展示该文章。'}
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleDialogClose}
                  >
                    取消
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingPost ? '保存修改' : '创建文章'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>文章列表</span>
            <span className="text-sm font-normal text-muted-foreground">
              共 {total} 篇
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {listQuery.isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-md bg-muted/50"
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">
              暂无博客文章，点击右上角「新建文章」开始创作。
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="flex flex-col gap-3 rounded-md border border-border/70 bg-card/50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <Badge
                        variant={
                          post.status === 'published' ? 'default' : 'outline'
                        }
                      >
                        {post.status}
                      </Badge>
                      <Badge variant="outline">{post.locale}</Badge>
                      {post.isFeatured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                    </div>
                    {post.summary && (
                      <p className="max-w-2xl text-sm text-muted-foreground">
                        {post.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(post)}
                      className="inline-flex items-center gap-2"
                    >
                      <PenSquareIcon className="h-4 w-4" />
                      编辑
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate({ id: post.id })}
                      className="inline-flex items-center gap-2"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                      删除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
