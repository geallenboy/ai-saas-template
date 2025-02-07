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
                hostname: "qwkccrpysbnsdqfweqki.supabase.co"
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com"
            },
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com"
            }
        ]
    }
};

export default withNextIntl(nextConfig);
