-- Creating test membership program data
-- Note: These are test data, price_xxx needs to be replaced with real Stripe price IDs

-- Clear existing data (optional)
-- DELETE FROM membership_plans;

-- Insert free plan
INSERT INTO membership_plans (
    name, name_de, description, description_de,
    price_usd_monthly, price_eur_monthly, price_usd_yearly, price_eur_yearly,
    yearly_discount_percent,
    stripe_price_id_usd_monthly, stripe_price_id_eur_monthly, 
    stripe_price_id_usd_yearly, stripe_price_id_eur_yearly,
    features, features_de,
    max_use_cases, max_tutorials, max_blogs, max_api_calls,
    permissions,
    is_active, is_popular, is_featured, sort_order
) VALUES (
    'Free', 'Kostenlos',
    'Perfect for getting started', 'Perfekt für den Start',
    0.00, 0.00, 0.00, 0.00,
    0,
    NULL, NULL, NULL, NULL,
    '["Up to 5 use cases", "Basic tutorials", "Community support", "Basic analytics"]'::json,
    '["Bis zu 5 Use-Cases", "Basic Tutorials", "Community-Support", "Basic Analysen"]'::json,
    5, 10, 3, 100,
    '{"apiAccess": false, "customModels": false, "prioritySupport": false, "exportData": false, "bulkOperations": false, "advancedAnalytics": false}'::json,
    true, false, false, 1
);

-- Insert the base plan (need to replace the actual Stripe price ID)
INSERT INTO membership_plans (
    name, name_de, description, description_de,
    price_usd_monthly, price_eur_monthly, price_usd_yearly, price_eur_yearly,
    yearly_discount_percent,
    stripe_price_id_usd_monthly, stripe_price_id_eur_monthly, 
    stripe_price_id_usd_yearly, stripe_price_id_eur_yearly,
    features, features_de,
    max_use_cases, max_tutorials, max_blogs, max_api_calls,
    permissions,
    is_active, is_popular, is_featured, sort_order
) VALUES (
    'Basic', 'Basic',
    'Great for individuals and small teams', 'Ideal für Einzelpersonen und kleine Teams',
    9.99, 8.58, 99.99, 85.80,
    17,
    'price_1Rts5QE3FsUKgee9OkSPQ6aE', 'price_1Rts5oE3FsUKgee9RuPH2wRe',
    'price_1Rts3wE3FsUKgee9V0Zqn2M2', 'price_1Rts6eE3FsUKgee9lUkEHN4B',
    '["Up to 50 use cases", "Advanced tutorials", "Email support", "Export functionality", "Basic API access"]'::json,
    '["Bis zu 50 Use-Cases", "Erweiterte Tutorials", "E-Mail-Support", "Exportfunktionalität", "Basis-API-Zugriff"]'::json,
    50, 100, 20, 1000,
    '{"apiAccess": true, "customModels": false, "prioritySupport": false, "exportData": true, "bulkOperations": false, "advancedAnalytics": false}'::json,
    true, true, false, 2
);

-- Insert professional plan
INSERT INTO membership_plans (
    name, name_de, description, description_de,
    price_usd_monthly, price_eur_monthly, price_usd_yearly, price_eur_yearly,
    yearly_discount_percent,
    stripe_price_id_usd_monthly, stripe_price_id_eur_monthly, 
    stripe_price_id_usd_yearly, stripe_price_id_eur_yearly,
    features, features_de,
    max_use_cases, max_tutorials, max_blogs, max_api_calls,
    permissions,
    is_active, is_popular, is_featured, sort_order
) VALUES (
    'Pro', 'Pro',
    'Perfect for growing businesses', 'Ideal für wachsende Unternehmen',
    29.99, 25.80, 299.99, 258.00,
    17,
    'price_1Rts8CE3FsUKgee9tkGHbRzG', 'price_1Rts9SE3FsUKgee9mTbAhvqm',
    'price_1Rts8gE3FsUKgee9pTLnTfnE', 'price_1RtsA1E3FsUKgee9a8DXuzZY',
    '["Unlimited use cases", "Premium tutorials", "Priority support", "Advanced analytics", "Custom models", "Bulk operations"]'::json,
    '["Unbegrenzte Anwendungsfälle", "Premium-Tutorials", "Prioritätsunterstützung", "Erweiterte Analysen", "Benutzerdefinierte Modelle", "Bulk-Operationen"]'::json,
    -1, -1, -1, 10000,
    '{"apiAccess": true, "customModels": true, "prioritySupport": true, "exportData": true, "bulkOperations": true, "advancedAnalytics": true}'::json,
    true, false, true, 3
);

-- Insert business plan
INSERT INTO membership_plans (
    name, name_de, description, description_de,
    price_usd_monthly, price_eur_monthly, price_usd_yearly, price_eur_yearly,
    yearly_discount_percent,
    stripe_price_id_usd_monthly, stripe_price_id_eur_monthly, 
    stripe_price_id_usd_yearly, stripe_price_id_eur_yearly,
    features, features_de,
    max_use_cases, max_tutorials, max_blogs, max_api_calls,
    permissions,
    is_active, is_popular, is_featured, sort_order
) VALUES (
    'Enterprise', 'Enterprise',
    'For large organizations with advanced needs', 'Für große Organisationen mit fortgeschrittenen Anforderungen',
    99.99, 85.80, 999.99, 858.00,
    17,
    'price_1RtsBME3FsUKgee96PQgonV8', 'price_1RtsCME3FsUKgee9lZHvGGfm',
    'price_1RtsBvE3FsUKgee92QdDqw5Y', 'price_1RtsDCE3FsUKgee9wznvmXZz',
    '["Everything in Pro", "Dedicated support", "Custom integrations", "Advanced security", "SLA guarantee", "White-label options"]'::json,
    '["Alles in Pro", "Dedizierter Support", "Benutzerdefinierte Integrationen", "Erweiterte Sicherheit", "SLA-Garantie", "White-Label-Optionen"]'::json,
    -1, -1, -1, -1,
    '{"apiAccess": true, "customModels": true, "prioritySupport": true, "exportData": true, "bulkOperations": true, "advancedAnalytics": true}'::json,
    true, false, false, 4
);

-- Query verification
SELECT 
    name, name_de, 
    price_usd_monthly, price_usd_yearly,
    stripe_price_id_usd_monthly, stripe_price_id_usd_yearly,
    is_active, is_popular, sort_order
FROM membership_plans 
ORDER BY sort_order;

-- Important reminder:
-- 1. Replace price_xxx_test with the real Stripe price ID
-- 2. Create the corresponding subscription prices in the Stripe dashboard
-- 3. The price ID format should be price_1234567890abcdef