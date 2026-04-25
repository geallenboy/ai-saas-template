import { Resend } from 'resend'

/**
 * 邮箱验证服务
 * 集成 Resend 邮件服务，为 Better Auth 提供邮箱验证邮件发送能力
 */

// 延迟初始化 Resend 客户端，避免在没有 API Key 时报错
let resendClient: Resend | null = null

function getResendClient(): Resend {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
            throw new Error(
                'RESEND_API_KEY is not configured. Email verification requires a valid Resend API key.'
            )
        }
        resendClient = new Resend(apiKey)
    }
    return resendClient
}

// 默认发件人地址（可通过环境变量覆盖）
const DEFAULT_FROM_EMAIL =
    process.env.EMAIL_FROM || 'AI SaaS <noreply@yourdomain.com>'

/**
 * 邮箱验证服务接口
 */
export interface EmailVerificationService {
    sendVerificationEmail(
        user: { email: string; name?: string | null },
        verificationUrl: string
    ): Promise<void>
}

/**
 * 生成邮箱验证邮件的 HTML 内容
 */
function buildVerificationEmailHtml(
    userName: string,
    verificationUrl: string
): string {
    return `
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">AI SaaS</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">验证您的邮箱地址</h2>
              <p style="margin: 0 0 16px; color: #52525b; font-size: 15px; line-height: 1.6;">
                您好${userName ? ` ${userName}` : ''}，感谢您注册 AI SaaS！请点击下方按钮验证您的邮箱地址。
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">
                      验证邮箱
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; color: #71717a; font-size: 13px; line-height: 1.5;">
                如果按钮无法点击，请复制以下链接到浏览器中打开：
              </p>
              <p style="margin: 0 0 24px; color: #3b82f6; font-size: 13px; word-break: break-all;">
                ${verificationUrl}
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.5;">
                此链接有效期为 24 小时。如果您没有注册 AI SaaS 账户，请忽略此邮件。
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 24px; background-color: #fafafa; text-align: center; border-top: 1px solid #f4f4f5;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                © ${new Date().getFullYear()} AI SaaS Template. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * 发送邮箱验证邮件
 *
 * @param user - 用户信息（email 和可选的 name）
 * @param verificationUrl - Better Auth 生成的验证链接
 */
export async function sendVerificationEmail(
    user: { email: string; name?: string | null },
    verificationUrl: string
): Promise<void> {
    try {
        const resend = getResendClient()
        const userName = user.name || ''

        const { error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: user.email,
            subject: '验证您的邮箱地址 - AI SaaS',
            html: buildVerificationEmailHtml(userName, verificationUrl),
        })

        if (error) {
            console.error('📧 邮箱验证邮件发送失败:', {
                email: user.email,
                error: error.message,
            })
            throw new Error(`Failed to send verification email: ${error.message}`)
        }

        console.log('📧 邮箱验证邮件已发送:', { email: user.email })
    } catch (err) {
        console.error('📧 邮箱验证邮件发送异常:', err)
        throw err
    }
}

/**
 * 创建邮箱验证服务实例
 */
export const emailVerificationService: EmailVerificationService = {
    sendVerificationEmail,
}
