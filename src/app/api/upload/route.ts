
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid'; // 这个可以用于生成更加标准的UUID


// Initialize S3 client (MinIO)
const s3Client = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT,
    region: 'us-east-1', // This is required but can be any value for MinIO
    credentials: {
        accessKeyId: process.env.MINIO_USER || '',
        secretAccessKey: process.env.MINIO_PASSWORD || '',
    },
    forcePathStyle: true, // Required for MinIO compatibility
});

export async function POST(request: Request) {
    try {
        // With App Router, we need a different approach to handle multipart form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: '未上传文件' }, { status: 400 });
        }

        // Get file bytes
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create a temporary file (optional but useful for large files)
        const tempFilePath = join(tmpdir(), uuidv4());
        await writeFile(tempFilePath, buffer);

        // 获取原始文件名和扩展名
        const originalFilename = file.name;
        const fileExtension = originalFilename.split('.').pop() || '';

        // 生成随机ID (使用UUID并截取前8位)
        const randomId = uuidv4().replace(/-/g, '').substring(0, 8);

        // 组合文件名: 时间戳 + 随机ID + 原始扩展名
        const newFilename = `${Date.now()}_${randomId}.${fileExtension}`;

        const uploadParams = {
            Bucket: process.env.MINIO_BUCKET || '',
            Key: `uploads/${newFilename}`,
            Body: buffer,
            ContentType: file.type, // Set the correct MIME type
        };

        // Upload to MinIO
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // 确保返回完整的URL，无需依赖客户端环境变量
        const minioEndpoint = process.env.MINIO_ENDPOINT || process.env.MINIO_ENDPOINT;
        const minioBucket = uploadParams.Bucket;

        // 记录环境变量情况以便调试
        console.log('MINIO配置:', {
            endpoint: minioEndpoint ? '已设置' : '未设置',
            bucket: minioBucket ? '已设置' : '未设置',
            key: uploadParams.Key
        });

        return NextResponse.json({
            message: '上传成功',
            key: uploadParams.Key,
            originalName: originalFilename,
            newName: newFilename,
            url: minioEndpoint && minioBucket
                ? `${minioEndpoint}/${minioBucket}/${uploadParams.Key}`
                : null,
            // 添加配置信息便于调试
            config: {
                hasEndpoint: !!minioEndpoint,
                hasBucket: !!minioBucket
            }
        });
    } catch (err: any) {
        console.error('Upload error:', err);
        return NextResponse.json({
            error: '上传失败',
            details: err.message
        }, { status: 500 });
    }
}