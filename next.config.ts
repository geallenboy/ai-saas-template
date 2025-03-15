import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "replicate.delivery"
            },
            {
                protocol: "https",
                hostname: "storage.ailinksall.com"
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com"
            }
        ]
    }
};

export default withNextIntl(nextConfig);
