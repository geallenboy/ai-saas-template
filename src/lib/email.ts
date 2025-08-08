import { env } from '@/env'
import { logger } from '@/lib/logger'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'

// Mail service type
type EmailProvider = 'resend' | 'smtp'

// Mail configuration
interface EmailConfig {
  provider: EmailProvider
  from: string
}

// Email content interface
interface EmailContent {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  cc?: string[]
  bcc?: string[]
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

// Email template interface
interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

// Initialize mail service
class EmailService {
  private resend?: Resend
  private nodemailer?: nodemailer.Transporter
  private config: EmailConfig

  constructor() {
    // Selecting an email provider based on an environment variable
    if (env.RESEND_API_KEY) {
      this.resend = new Resend(env.RESEND_API_KEY)
      this.config = {
        provider: 'resend',
        from: 'AI SaaS <noreply@yourdomain.com>', // Replace with your domain
      }
    } else if (env.SMTP_HOST && env.SMTP_USERNAME && env.SMTP_PASSWORD) {
      this.nodemailer = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number.parseInt(env.SMTP_PORT || '587'),
        secure: Number.parseInt(env.SMTP_PORT || '587') === 465,
        auth: {
          user: env.SMTP_USERNAME,
          pass: env.SMTP_PASSWORD,
        },
      })
      this.config = {
        provider: 'smtp',
        from: `AI SaaS <${env.SMTP_USERNAME}>`,
      }
    } else {
      throw new Error(
        'Mail service is not configured, please set RESEND_API_KEY or SMTP configuration'
      )
    }
  }

  // Send email
  async sendEmail(content: EmailContent): Promise<boolean> {
    try {
      if (this.config.provider === 'resend' && this.resend) {
        await this.sendWithResend(content)
      } else if (this.config.provider === 'smtp' && this.nodemailer) {
        await this.sendWithSMTP(content)
      } else {
        throw new Error('The mail service was not initialized correctly')
      }

      logger.info(
        `Email sent successfully: ${content.subject} -> ${content.to}`
      )
      return true
    } catch (error) {
      logger.error('Email sending failed:', error as Error)
      throw error
    }
  }

  // Send using Resend
  private async sendWithResend(content: EmailContent) {
    if (!this.resend) throw new Error('Resend is not initialized')

    const result = await this.resend.emails.send({
      from: this.config.from,
      to: Array.isArray(content.to) ? content.to : [content.to],
      subject: content.subject,
      html: content.html,
      text: content.text || '',
      cc: content.cc,
      bcc: content.bcc,
      replyTo: content.replyTo,
      attachments: content.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
      })),
    })

    if (result.error) {
      throw new Error(`Resend error: ${result.error.message}`)
    }
  }

  // Send using SMTP
  private async sendWithSMTP(content: EmailContent) {
    if (!this.nodemailer) throw new Error('SMTP is not initialized')

    await this.nodemailer.sendMail({
      from: this.config.from,
      to: content.to,
      subject: content.subject,
      html: content.html,
      text: content.text,
      cc: content.cc,
      bcc: content.bcc,
      replyTo: content.replyTo,
      attachments: content.attachments,
    })
  }

  // Send using template
  async sendWithTemplate(
    to: string | string[],
    templateName: string,
    variables: Record<string, any>
  ): Promise<boolean> {
    const template = await this.getTemplate(templateName, variables)
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  // Get email template
  private async getTemplate(
    templateName: string,
    variables: Record<string, any>
  ): Promise<EmailTemplate> {
    // Here you can load templates from a database or file system
    // Currently using built-in templates
    const templates = getBuiltinTemplates()
    const template = templates[templateName]

    if (!template) {
      throw new Error(`Template not found: ${templateName}`)
    }

    // Replace template variables
    const subject = this.replaceVariables(template.subject, variables)
    const html = this.replaceVariables(template.html, variables)
    const text = template.text
      ? this.replaceVariables(template.text, variables)
      : undefined

    return { subject, html, text }
  }

  // Replace template variables
  private replaceVariables(
    template: string,
    variables: Record<string, any>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match
    })
  }
}

// Create email service instance
export const emailService = new EmailService()

// Convenient send method
export const sendEmail = (content: EmailContent) =>
  emailService.sendEmail(content)
export const sendEmailWithTemplate = (
  to: string | string[],
  templateName: string,
  variables: Record<string, any>
) => emailService.sendWithTemplate(to, templateName, variables)

// Built-in email templates
function getBuiltinTemplates(): Record<string, EmailTemplate> {
  return {
    // Welcome email
    welcome: {
      subject: 'Welcome to AI SaaS!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome, {{userName}}!</h1>
          <p>Thank you for signing up for AI SaaS. We're excited to have you on board.</p>
          <p>You can now:</p>
          <ul>
            <li>Explore our AI features</li>
            <li>Check out tutorials and case studies</li>
            <li>Upgrade to a paid plan for more features</li>
          </ul>
          <div style="margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Get Started
            </a>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>AI SaaS Team</p>
        </div>
      `,
      text: `Welcome, {{userName}}! Thank you for signing up for AI SaaS. Visit {{dashboardUrl}} to get started.`,
    },

    // Password reset
    passwordReset: {
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Reset Your Password</h1>
          <p>Hello, {{userName}}!</p>
          <p>We received a request to reset your account password. Please click the link below to reset your password:</p>
          <div style="margin: 30px 0;">
            <a href="{{resetUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>Best regards,<br>AI SaaS Team</p>
        </div>
      `,
      text: `Reset Password: {{resetUrl}} (Valid for 24 hours)`,
    },

    // Payment success
    paymentSuccess: {
      subject: 'Payment Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #28a745;">Payment Successful!</h1>
          <p>Hello, {{userName}}!</p>
          <p>We have received your payment. Thank you for upgrading to the {{planName}} plan.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Plan:</strong> {{planName}}</p>
            <p><strong>Amount:</strong> {{amount}} {{currency}}</p>
            <p><strong>Duration:</strong> {{duration}}</p>
            <p><strong>Expiry Date:</strong> {{expiryDate}}</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              View Dashboard
            </a>
          </div>
          <p>Best regards,<br>AI SaaS Team</p>
        </div>
      `,
      text: `Payment Successful! You have upgraded to the {{planName}} plan. Visit {{dashboardUrl}} for details.`,
    },

    // Payment failed
    paymentFailed: {
      subject: 'Payment Failed Notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc3545;">Payment Failed</h1>
          <p>Hello, {{userName}}!</p>
          <p>We are sorry, but your payment could not be processed. Please check your payment information and try again.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3>Failure Details</h3>
            <p><strong>Plan:</strong> {{planName}}</p>
            <p><strong>Amount:</strong> {{amount}} {{currency}}</p>
            <p><strong>Reason:</strong> {{failureReason}}</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="{{retryUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Retry Payment
            </a>
          </div>
          <p>If you need assistance, please contact our support team.</p>
          <p>Best regards,<br>AI SaaS Team</p>
        </div>
      `,
      text: `Payment Failed: {{planName}} {{amount}} {{currency}}. Visit {{retryUrl}} to retry payment.`,
    },

    // Trial ending soon
    trialEnding: {
      subject: 'Trial Ending Soon',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ffc107;">Trial Ending Soon</h1>
          <p>Hello, {{userName}}!</p>
          <p>Your trial will end in {{daysLeft}} days. To continue enjoying our services, please choose a suitable paid plan.</p>
          <div style="margin: 30px 0;">
            <a href="{{pricingUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              View Pricing Plans
            </a>
          </div>
          <p>Upgrading will give you:</p>
          <ul>
            <li>Unlimited access to AI features</li>
            <li>Priority customer support</li>
            <li>Access to premium features</li>
          </ul>
          <p>Best regards,<br>AI SaaS Team</p>
        </div>
      `,
      text: `Trial will end in {{daysLeft}} days. Visit {{pricingUrl}} to choose a paid plan.`,
    },

    // Subscription expiring
    subscriptionExpiring: {
      subject: 'Subscription Expiring Soon',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ffc107;">Subscription Expiring Soon</h1>
          <p>Hello, {{userName}}!</p>
          <p>Your {{planName}} subscription will expire on {{expiryDate}}.</p>
          <p>To ensure uninterrupted service, please renew your subscription in a timely manner.</p>
          <div style="margin: 30px 0;">
            <a href="{{renewUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Renew Now
            </a>
          </div>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>AI SaaS Team</p>
        </div>
      `,
      text: `Your {{planName}} subscription will expire on {{expiryDate}}. Visit {{renewUrl}} to renew.`,
    },
  }
}

// Sending specific types of emails
export const sendWelcomeEmail = (
  to: string,
  userName: string,
  dashboardUrl: string
) => sendEmailWithTemplate(to, 'welcome', { userName, dashboardUrl })

export const sendPasswordResetEmail = (
  to: string,
  userName: string,
  resetUrl: string
) => sendEmailWithTemplate(to, 'passwordReset', { userName, resetUrl })

export const sendPaymentSuccessEmail = (
  to: string,
  userName: string,
  planName: string,
  amount: string,
  currency: string,
  duration: string,
  expiryDate: string,
  dashboardUrl: string
) =>
  sendEmailWithTemplate(to, 'paymentSuccess', {
    userName,
    planName,
    amount,
    currency,
    duration,
    expiryDate,
    dashboardUrl,
  })

export const sendPaymentFailedEmail = (
  to: string,
  userName: string,
  planName: string,
  amount: string,
  currency: string,
  failureReason: string,
  retryUrl: string
) =>
  sendEmailWithTemplate(to, 'paymentFailed', {
    userName,
    planName,
    amount,
    currency,
    failureReason,
    retryUrl,
  })

export const sendTrialEndingEmail = (
  to: string,
  userName: string,
  daysLeft: number,
  pricingUrl: string
) =>
  sendEmailWithTemplate(to, 'trialEnding', { userName, daysLeft, pricingUrl })

export const sendSubscriptionExpiringEmail = (
  to: string,
  userName: string,
  planName: string,
  expiryDate: string,
  renewUrl: string
) =>
  sendEmailWithTemplate(to, 'subscriptionExpiring', {
    userName,
    planName,
    expiryDate,
    renewUrl,
  })

// Verify email service configuration
export const isEmailConfigured = (): boolean => {
  return !!(
    env.RESEND_API_KEY ||
    (env.SMTP_HOST && env.SMTP_USERNAME && env.SMTP_PASSWORD)
  )
}

// Test email sending
export const testEmailService = async (to: string): Promise<boolean> => {
  try {
    return await sendEmail({
      to,
      subject: 'AI SaaS Email Service Test',
      html: '<p>This is a test email to confirm that the email service is working correctly.</p>',
      text: 'This is a test email to confirm that the email service is working correctly.',
    })
  } catch (error) {
    logger.error('Email service test failed:', error as Error)
    return false
  }
}
