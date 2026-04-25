/**
 * 多层级会员计划配置
 * 定义免费版、基础版、专业版、企业版的功能限制和 AI 使用配额
 */

export interface MembershipTierConfig {
    /** 计划标识 */
    key: 'free' | 'basic' | 'pro' | 'enterprise'
    /** 英文名称 */
    name: string
    /** 中文名称 */
    nameZh: string
    /** 英文描述 */
    description: string
    /** 中文描述 */
    descriptionZh: string
    /** 月付价格 (USD) */
    priceUSDMonthly: number
    /** 年付价格 (USD) */
    priceUSDYearly: number
    /** 是否推荐 */
    isPopular: boolean
    /** 功能列表 (英文) */
    features: string[]
    /** 功能列表 (中文) */
    featuresZh: string[]
    /** AI 使用配额 */
    aiQuota: {
        /** 月度 AI Token 配额 (-1 = 无限制) */
        maxMonthlyAiTokens: number
        /** 月度 AI 会话配额 (-1 = 无限制) */
        maxMonthlyAiSessions: number
        /** 配额描述 (英文) */
        description: string
        /** 配额描述 (中文) */
        descriptionZh: string
    }
    /** 功能限制 */
    limits: {
        monthlyUseCases: number
        monthlyTutorials: number
        monthlyBlogs: number
        monthlyApiCalls: number
    }
    /** 高级功能权限 */
    permissions: {
        apiAccess: boolean
        customModels: boolean
        prioritySupport: boolean
        exportData: boolean
        bulkOperations: boolean
        advancedAnalytics: boolean
    }
}

export const MEMBERSHIP_TIERS: MembershipTierConfig[] = [
    {
        key: 'free',
        name: 'Free',
        nameZh: '免费版',
        description: 'Perfect for getting started',
        descriptionZh: '适合入门体验',
        priceUSDMonthly: 0,
        priceUSDYearly: 0,
        isPopular: false,
        features: [
            '10 use cases per month',
            '5 tutorials per month',
            '3 blog posts per month',
            '100 API calls per month',
            '100K AI tokens per month',
            '10 AI sessions per month',
            'Basic AI models',
            'Community support',
        ],
        featuresZh: [
            '每月 10 个用例',
            '每月 5 个教程',
            '每月 3 篇博客',
            '每月 100 次 API 调用',
            '每月 10 万 AI Token',
            '每月 10 次 AI 会话',
            '基础 AI 模型',
            '社区支持',
        ],
        aiQuota: {
            maxMonthlyAiTokens: 100000,
            maxMonthlyAiSessions: 10,
            description: '100K tokens/month, 10 sessions/month',
            descriptionZh: '每月 10 万 Token，10 次会话',
        },
        limits: {
            monthlyUseCases: 10,
            monthlyTutorials: 5,
            monthlyBlogs: 3,
            monthlyApiCalls: 100,
        },
        permissions: {
            apiAccess: false,
            customModels: false,
            prioritySupport: false,
            exportData: false,
            bulkOperations: false,
            advancedAnalytics: false,
        },
    },
    {
        key: 'basic',
        name: 'Basic',
        nameZh: '基础版',
        description: 'Great for individual developers',
        descriptionZh: '适合个人开发者',
        priceUSDMonthly: 9.9,
        priceUSDYearly: 99,
        isPopular: false,
        features: [
            '50 use cases per month',
            '25 tutorials per month',
            '15 blog posts per month',
            '1,000 API calls per month',
            '500K AI tokens per month',
            '50 AI sessions per month',
            'Standard AI models',
            'Email support',
            'Data export',
        ],
        featuresZh: [
            '每月 50 个用例',
            '每月 25 个教程',
            '每月 15 篇博客',
            '每月 1,000 次 API 调用',
            '每月 50 万 AI Token',
            '每月 50 次 AI 会话',
            '标准 AI 模型',
            '邮件支持',
            '数据导出',
        ],
        aiQuota: {
            maxMonthlyAiTokens: 500000,
            maxMonthlyAiSessions: 50,
            description: '500K tokens/month, 50 sessions/month',
            descriptionZh: '每月 50 万 Token，50 次会话',
        },
        limits: {
            monthlyUseCases: 50,
            monthlyTutorials: 25,
            monthlyBlogs: 15,
            monthlyApiCalls: 1000,
        },
        permissions: {
            apiAccess: false,
            customModels: false,
            prioritySupport: false,
            exportData: true,
            bulkOperations: false,
            advancedAnalytics: false,
        },
    },
    {
        key: 'pro',
        name: 'Professional',
        nameZh: '专业版',
        description: 'Best for teams and professionals',
        descriptionZh: '适合团队和专业用户',
        priceUSDMonthly: 29.9,
        priceUSDYearly: 299,
        isPopular: true,
        features: [
            '200 use cases per month',
            '100 tutorials per month',
            '50 blog posts per month',
            '10,000 API calls per month',
            '2M AI tokens per month',
            '200 AI sessions per month',
            'All AI models (GPT-4o, Claude, Gemini)',
            'API access',
            'Priority support',
            'Advanced analytics',
            'Data export',
        ],
        featuresZh: [
            '每月 200 个用例',
            '每月 100 个教程',
            '每月 50 篇博客',
            '每月 10,000 次 API 调用',
            '每月 200 万 AI Token',
            '每月 200 次 AI 会话',
            '全部 AI 模型 (GPT-4o, Claude, Gemini)',
            'API 访问权限',
            '优先支持',
            '高级分析',
            '数据导出',
        ],
        aiQuota: {
            maxMonthlyAiTokens: 2000000,
            maxMonthlyAiSessions: 200,
            description: '2M tokens/month, 200 sessions/month',
            descriptionZh: '每月 200 万 Token，200 次会话',
        },
        limits: {
            monthlyUseCases: 200,
            monthlyTutorials: 100,
            monthlyBlogs: 50,
            monthlyApiCalls: 10000,
        },
        permissions: {
            apiAccess: true,
            customModels: false,
            prioritySupport: true,
            exportData: true,
            bulkOperations: false,
            advancedAnalytics: true,
        },
    },
    {
        key: 'enterprise',
        name: 'Enterprise',
        nameZh: '企业版',
        description: 'For large organizations with custom needs',
        descriptionZh: '适合大型组织的定制需求',
        priceUSDMonthly: 99.9,
        priceUSDYearly: 999,
        isPopular: false,
        features: [
            'Unlimited use cases',
            'Unlimited tutorials',
            'Unlimited blog posts',
            'Unlimited API calls',
            'Unlimited AI tokens',
            'Unlimited AI sessions',
            'All AI models + custom models',
            'Full API access',
            'Dedicated support',
            'Advanced analytics',
            'Bulk operations',
            'Custom integrations',
        ],
        featuresZh: [
            '无限用例',
            '无限教程',
            '无限博客',
            '无限 API 调用',
            '无限 AI Token',
            '无限 AI 会话',
            '全部 AI 模型 + 自定义模型',
            '完整 API 访问权限',
            '专属支持',
            '高级分析',
            '批量操作',
            '自定义集成',
        ],
        aiQuota: {
            maxMonthlyAiTokens: -1,
            maxMonthlyAiSessions: -1,
            description: 'Unlimited tokens and sessions',
            descriptionZh: '无限 Token 和会话',
        },
        limits: {
            monthlyUseCases: -1,
            monthlyTutorials: -1,
            monthlyBlogs: -1,
            monthlyApiCalls: -1,
        },
        permissions: {
            apiAccess: true,
            customModels: true,
            prioritySupport: true,
            exportData: true,
            bulkOperations: true,
            advancedAnalytics: true,
        },
    },
]

/**
 * 根据 key 获取会员层级配置
 */
export function getMembershipTierByKey(
    key: string
): MembershipTierConfig | undefined {
    return MEMBERSHIP_TIERS.find((tier) => tier.key === key)
}

/**
 * 根据计划名称推断层级 key
 */
export function inferTierKey(
    planName: string
): MembershipTierConfig['key'] {
    const name = planName.toLowerCase()
    if (name.includes('enterprise')) return 'enterprise'
    if (name.includes('pro') || name.includes('professional')) return 'pro'
    if (name.includes('basic')) return 'basic'
    return 'free'
}
