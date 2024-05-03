/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        outputFileTracingIncludes: {
            "/admin/products/new": ["./products/**/*"],
        },
    },
};

export default nextConfig;
