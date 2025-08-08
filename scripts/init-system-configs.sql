-- Initialize system configuration data
-- These are basic system configurations that can be modified by administrators through the backend management interface.

-- Clear existing data (optional, use with caution)
-- DELETE FROM system_configs;

-- Basic configuration (general)
INSERT INTO system_configs (key, value, description, category, data_type, is_editable, is_secret) VALUES
('site.name', '"AI SaaS Template"', '网站名称', 'general', 'string', true, false),
('site.description', '"下一代AI SaaS平台模板"', '网站描述', 'general', 'string', true, false),
('site.logo_url', '"/logo.png"', '网站Logo地址', 'general', 'string', true, false),
('site.contact_email', '"support@example.com"', '联系邮箱', 'general', 'string', true, false),
('site.timezone', '"Asia/Shanghai"', '默认时区', 'general', 'string', true, false),
('site.language', '"zh"', '默认语言', 'general', 'string', true, false);

-- Payment configuration (payment)
INSERT INTO system_configs (key, value, description, category, data_type, is_editable, is_secret) VALUES
('payment.enabled', 'true', '是否启用支付功能', 'payment', 'boolean', true, false),
('payment.currency', '"USD"', '默认货币', 'payment', 'string', true, false),
('payment.tax_rate', '0.08', '税率(小数)', 'payment', 'number', true, false),
('payment.trial_days', '14', '免费试用天数', 'payment', 'number', true, false),
('stripe.webhook_secret', '""', 'Stripe Webhook密钥', 'payment', 'string', true, true),
('stripe.public_key', '""', 'Stripe公钥', 'payment', 'string', true, false);

-- AI configuration (ai)
INSERT INTO system_configs (key, value, description, category, data_type, is_editable, is_secret) VALUES
('ai.enabled', 'true', '是否启用AI功能', 'ai', 'boolean', true, false),
('ai.default_model', '"gpt-3.5-turbo"', '默认AI模型', 'ai', 'string', true, false),
('ai.max_tokens', '4000', '最大Token数', 'ai', 'number', true, false),
('ai.temperature', '0.7', 'AI温度参数', 'ai', 'number', true, false),
('ai.api_key', '""', 'OpenAI API密钥', 'ai', 'string', true, true),
('ai.rate_limit', '100', '每小时请求限制', 'ai', 'number', true, false);

-- Notification configuration (notification)
INSERT INTO system_configs (key, value, description, category, data_type, is_editable, is_secret) VALUES
('notification.email_enabled', 'true', '是否启用邮件通知', 'notification', 'boolean', true, false),
('notification.sms_enabled', 'false', '是否启用短信通知', 'notification', 'boolean', true, false),
('notification.admin_email', '"admin@example.com"', '管理员邮箱', 'notification', 'string', true, false),
('email.smtp_host', '""', 'SMTP服务器地址', 'notification', 'string', true, false),
('email.smtp_port', '587', 'SMTP端口', 'notification', 'number', true, false),
('email.smtp_user', '""', 'SMTP用户名', 'notification', 'string', true, false),
('email.smtp_password', '""', 'SMTP密码', 'notification', 'string', true, true);

-- Security configuration (security)
INSERT INTO system_configs (key, value, description, category, data_type, is_editable, is_secret) VALUES
('security.enable_2fa', 'false', '是否启用双因子认证', 'security', 'boolean', true, false),
('security.session_timeout', '3600', '会话超时时间(秒)', 'security', 'number', true, false),
('security.max_login_attempts', '5', '最大登录尝试次数', 'security', 'number', true, false),
('security.password_min_length', '8', '密码最小长度', 'security', 'number', true, false),
('security.enable_captcha', 'false', '是否启用验证码', 'security', 'boolean', true, false),
('security.jwt_secret', '""', 'JWT密钥', 'security', 'string', true, true);

-- Function switch (feature)
INSERT INTO system_configs (key, value, description, category, data_type, is_editable, is_secret) VALUES
('feature.registration_enabled', 'true', '是否允许用户注册', 'feature', 'boolean', true, false),
('feature.social_login', 'true', '是否启用社交登录', 'feature', 'boolean', true, false),
('feature.file_upload', 'true', '是否允许文件上传', 'feature', 'boolean', true, false),
('feature.api_access', 'true', '是否提供API访问', 'feature', 'boolean', true, false),
('feature.analytics', 'true', '是否启用数据分析', 'feature', 'boolean', true, false),
('feature.maintenance_mode', 'false', '维护模式', 'feature', 'boolean', true, false);

-- Query verification data
SELECT 
    category,
    key,
    value,
    description,
    data_type,
    is_editable,
    is_secret
FROM system_configs 
ORDER BY category, key; 