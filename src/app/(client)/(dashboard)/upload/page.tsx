"use client";

import { useState, FormEvent } from "react";
import {
  Upload,
  UploadCloud,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const TestUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileInfo, setFileInfo] = useState<{
    originalName: string;
    newName: string;
  } | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setMessage("");
      setUploadStatus("idle");
      setProgress(0);

      // Reset other states when a new file is selected
      setUploadedUrl("");
      setFileInfo(null);
    }
  };

  // 提交上传请求
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("请先选择要上传的文件");
      setUploadStatus("error");
      return;
    }

    setIsLoading(true);
    setMessage("上传中...");
    setUploadStatus("uploading");

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 200);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setProgress(100);
        setUploadStatus("success");
        setMessage(data.message || "上传成功");

        // 保存文件名信息
        if (data.originalName && data.newName) {
          setFileInfo({
            originalName: data.originalName,
            newName: data.newName,
          });
        }

        // 优先使用服务器返回的完整URL
        if (data.url) {
          setUploadedUrl(data.url);
          console.log("使用服务器返回的URL:", data.url);
        } else if (data.key) {
          // 服务器没有返回完整URL时尝试在客户端构建
          // 注意: 客户端只能访问NEXT_PUBLIC_开头的环境变量
          const minioEndpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT;
          const minioBucket = process.env.NEXT_PUBLIC_MINIO_BUCKET;

          if (minioEndpoint && minioBucket) {
            const url = `${minioEndpoint}/${minioBucket}/${data.key}`;
            setUploadedUrl(url);
            console.log("客户端构建的URL:", url);
          } else {
            setMessage(
              "警告: 无法构建图片URL，环境变量未设置。请检查.env.local文件中的NEXT_PUBLIC_MINIO_ENDPOINT和NEXT_PUBLIC_MINIO_BUCKET设置。"
            );
            setUploadStatus("error");
            console.error("环境变量未设置:", {
              NEXT_PUBLIC_MINIO_ENDPOINT: minioEndpoint,
              NEXT_PUBLIC_MINIO_BUCKET: minioBucket,
              configInfo: data.config,
            });
          }
        } else {
          setMessage("警告: 服务器未返回文件路径信息，无法生成预览URL。");
          setUploadStatus("error");
        }
      } else {
        setMessage(data.error || "上传失败");
        setUploadStatus("error");
        setProgress(0);
        if (data.details) {
          console.error("上传详细错误:", data.details);
        }
      }
    } catch (error: any) {
      setMessage("上传异常: " + error.message);
      setUploadStatus("error");
      setProgress(0);
      console.error("上传异常:", error);
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  // 渲染上传状态指示器
  const renderStatusIndicator = () => {
    if (uploadStatus === "uploading") {
      return (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>上传中...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      );
    }

    if (uploadStatus === "success") {
      return (
        <Alert variant="default" className="bg-green-50 border-green-200 mb-4">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">上传成功</AlertTitle>
          <AlertDescription className="text-green-700">
            {message}
          </AlertDescription>
        </Alert>
      );
    }

    if (uploadStatus === "error") {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>上传失败</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  // 渲染文件预览
  const renderFilePreview = () => {
    if (!file) return null;

    return (
      <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
        <div className="p-2 bg-gray-100 rounded-md">
          <ImageIcon className="h-5 w-5 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-gray-500">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFile(null);
            setUploadStatus("idle");
          }}
          className="h-8 px-2"
        >
          删除
        </Button>
      </div>
    );
  };

  // 渲染上传结果
  const renderUploadResult = () => {
    if (!uploadedUrl) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">上传的图片预览</CardTitle>
          <CardDescription>图片已成功上传并存储</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fileInfo && (
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="font-normal">
                  <span className="font-semibold mr-1">原始文件名:</span>{" "}
                  {fileInfo.originalName}
                </Badge>
                <Badge variant="outline" className="font-normal">
                  <span className="font-semibold mr-1">新文件名:</span>{" "}
                  {fileInfo.newName}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded border">
                <span className="font-medium">预览URL:</span> {uploadedUrl}
              </div>
            </div>
          )}
          <Separator />
          <div className="relative overflow-hidden rounded-lg border">
            <img
              src={uploadedUrl}
              alt="Uploaded Image"
              className="max-w-full h-auto object-contain"
              onError={(e) => {
                console.error("图片加载失败:", uploadedUrl);
                setMessage(
                  `图片加载失败(404错误)。请检查MinIO配置和权限，确保该URL可以公开访问: ${uploadedUrl}`
                );
                setUploadStatus("error");
              }}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">图片上传</CardTitle>
          <CardDescription>上传图片并查看预览</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file">选择图片</Label>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  {file ? (
                    renderFilePreview()
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm font-medium mb-1">
                        点击或拖拽上传图片
                      </p>
                      <p className="text-xs text-gray-500">支持各种图片格式</p>
                      <Input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isLoading}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {renderStatusIndicator()}

            <Button
              type="submit"
              className="w-full"
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">
                    <Upload className="h-4 w-4" />
                  </span>
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  上传图片
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {renderUploadResult()}

      {file && message.includes("成功") && !uploadedUrl && (
        <Alert variant="default" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>无法预览</AlertTitle>
          <AlertDescription>
            文件已上传成功，但无法生成预览URL。请检查环境变量设置。
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TestUpload;
