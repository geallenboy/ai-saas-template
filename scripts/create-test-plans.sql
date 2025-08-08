-- Creating test membership program data
-- Note: These are test data, price_xxx needs to be replaced with real Stripe price IDs

-- Clear existing data (optional)
-- DELETE FROM membership_plans;

-- Insert free plan
INSERT INTO membership_plans (
    name, name_zh, description, description_zh,
    price_usd_monthly, price_cny_monthly, price_usd_yearly, price_cny_yearly,
    yearly_discount_percent,
    stripe_price_id_usd_monthly, stripe_price_id_cny_monthly, 
    stripe_price_id_usd_yearly, stripe_price_id_cny_yearly,
    features, features_zh,
    max_use_cases, max_tutorials, max_blogs, max_api_calls,
    permissions,
    is_active, is_popular, is_featured, sort_order
) VALUES (
    'Free', '免费版',
    'Perfect for getting started', '完美的入门选择',
    0.00, 0.00, 0.00, 0.00,
    0,
    NULL, NULL, NULL, NULL,
    '["Up to 5 use cases", "Basic tutorials", "Community support", "Basic analytics"]'::json,
    '["最多5个使用案例", "基础教程", "社区支持", "基础分析"]'::json,
    5, 10, 3, 100,
    '{"apiAccess": false, "customModels": false, "prioritySupport": false, "exportData": false, "bulkOperations": false, "advancedAnalytics": false}'::json,
    true, false, false, 1
);

-- Insert the base plan (need to replace the actual Stripe price ID)
INSERT INTO membership_plans (
    name, name_zh, description, description_zh,
    price_usd_monthly, price_cny_monthly, price_usd_yearly, price_cny_yearly,
    yearly_discount_percent,
    stripe_price_id_usd_monthly, stripe_price_id_cny_monthly, 
    stripe_price_id_usd_yearly, stripe_price_id_cny_yearly,
    features, features_zh,
    max_use_cases, max_tutorials, max_blogs, max_api_calls,
    permissions,
    is_active, is_popular, is_featured, sort_order
) VALUES (
    'Basic', '基础版',
    'Great for individuals and small teams', '适合个人和小团队',
    9.99, 68.00, 99.99, 680.00,
    17,
    'price_basic_monthly_test', 'price_basic_monthly_cny_test',
    'price_basic_yearly_test', 'price_basic_yearly_cny_test',
    '["Up to 50 use cases", "Advanced tutorials", "Email support", "Export functionality", "Basic API access"]'::json,
    '["最多50个使用案例", "高级教程", "邮件支持", "导出功能", "基础API访问"]'::json,
    50, 100, 20, 1000,
    '{"apiAccess": true, "customModels": false, "prioritySupport": false, "exportData": true, "bulkOperations": false, "advancedAnalytics": false}'::json,
    true, true, false, 2
);

-- Insert professional plan
INSERT INTO membership_plans (
    name, name_zh, description, description_zh,
    price_usd_monthly, price_cny_monthly, price_usd_yearly, price_cny_yearly,
    yearly_discount_percent,
    stripe_price_id_usd_monthly, stripe_price_id_cny_monthly, 
    stripe_price_id_usd_yearly, stripe_price_id_cny_yearly,
    features, features_zh,
    max_use_cases, max_tutorials, max_blogs, max_api_calls,
    permissions,
    is_active, is_popular, is_featured, sort_order
) VALUES (
    'Pro', '专业版',
    'Perfect for growing businesses', '适合成长型企业',
    29.99, 198.00, 299.99, 1980.00,
    17,
    'price_pro_monthly_test', 'price_pro_monthly_cny_test',
    'price_pro_yearly_test', 'price_pro_yearly_cny_test',
    '["Unlimited use cases", "Premium tutorials", "Priority support", "Advanced analytics", "Custom models", "Bulk operations"]'::json,
    '["无限使用案例", "高级教程", "优先支持", "高级分析", "自定义模型", "批量操作"]'::json,
    -1, -1, -1, 10000,
    '{"apiAccess": true, "customModels": true, "prioritySupport": true, "exportData": true, "bulkOperations": true, "advancedAnalytics": true}'::json,
    true, false, true, 3
);

-- Insert business plan
INSERT INTO membership_plans (
    name, name_zh, description, description_zh,
    price_usd_monthly, price_cny_monthly, price_usd_yearly, price_cny_yearly,
    yearly_discount_percent,
    stripe_price_id_usd_monthly, stripe_price_id_cny_monthly, 
    stripe_price_id_usd_yearly, stripe_price_id_cny_yearly,
    features, features_zh,
    max_use_cases, max_tutorials, max_blogs, max_api_calls,
    permissions,
    is_active, is_popular, is_featured, sort_order
) VALUES (
    'Enterprise', '企业版',
    'For large organizations with advanced needs', '适合有高级需求的大型组织',
    99.99, 688.00, 999.99, 6880.00,
    17,
    'price_enterprise_monthly_test', 'price_enterprise_monthly_cny_test',
    'price_enterprise_yearly_test', 'price_enterprise_yearly_cny_test',
    '["Everything in Pro", "Dedicated support", "Custom integrations", "Advanced security", "SLA guarantee", "White-label options"]'::json,
    '["包含专业版所有功能", "专属支持", "自定义集成", "高级安全", "SLA保证", "白标选项"]'::json,
    -1, -1, -1, -1,
    '{"apiAccess": true, "customModels": true, "prioritySupport": true, "exportData": true, "bulkOperations": true, "advancedAnalytics": true}'::json,
    true, false, false, 4
);

-- Query verification
SELECT 
    name, name_zh, 
    price_usd_monthly, price_usd_yearly,
    stripe_price_id_usd_monthly, stripe_price_id_usd_yearly,
    is_active, is_popular, sort_order
FROM membership_plans 
ORDER BY sort_order;

-- Important reminder:
-- 1. Replace price_xxx_test with the real Stripe price ID
-- 2. Create the corresponding subscription prices in the Stripe dashboard
-- 3. The price ID format should be price_1234567890abcdef