import { Resend } from 'resend'

/**
 * 密码重置服务
 * 集成 Resend 邮件服务，为 Better Auth 提供密码重置邮件发送能力
 */

// 延迟初始化 Resend 客户端，避免在没有 API Key 时报错
let resendClient: Resend | null = null

function getResendClient(): Resend {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
            throw new Error(
                'RESEND_API_KEY is not configured. Password reset requires a valid Resend API key.'
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
 * 密码重置服务接口
 */
export interface PasswordResetService {
    sendResetEmail(
        user: { email: string; name?: string | null },
        resetUrl: string
    ): Promise<void>
}

/**
 * 生成密码重置邮件的 HTML 内容
 */
function buildResetPasswordEmailHtml(
    userName: string,
    resetUrl: string
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
            <td style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">AI SaaS</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">重置您的密码</h2>
              <p style="margin: 0 0 16px; color: #52525b; font-size: 15px; line-height: 1.6;">
                您好${userName ? ` ${userName}` : ''}，我们收到了您的密码重置请求。请点击下方按钮设置新密码。
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #f59e0b, #ef4444); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">
                      重置密码
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; color: #71717a; font-size: 13px; line-height: 1.5;">
                如果按钮无法点击，请复制以下链接到浏览器中打开：
              </p>
              <p style="margin: 0 0 24px; color: #f59e0b; font-size: 13px; word-break: break-all;">
                ${resetUrl}
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.5;">
                此链接有效期为 1 小时。如果您没有请求重置密码，请忽略此邮件，您的密码不会被更改。
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
 * 发送密码重置邮件
 *
 * @param user - 用户信息（email 和可选的 name）
 * @param resetUrl - Better Auth 生成的密码重置链接
 */
export async function sendResetEmail(
    user: { email: string; name?: string | null },
    resetUrl: string
): Promise<void> {
    try {
        const resend = getResendClient()
        const userName = user.name || ''

        const { error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: user.email,
            subject: '重置您的密码 - AI SaaS',
            html: buildResetPasswordEmailHtml(userName, resetUrl),
        })

        if (error) {
            console.error('📧 密码重置邮件发送失败:', {
                email: user.email,
                error: error.message,
            })
            throw new Error(`Failed to send password reset email: ${error.message}`)
        }

        console.log('📧 密码重置邮件已发送:', { email: user.email })
    } catch (err) {
        console.error('📧 密码重置邮件发送异常:', err)
        throw err
    }
}

/**
 * 创建密码重置服务实例
 */
export const passwordResetService: PasswordResetService = {
    sendResetEmail,
}
