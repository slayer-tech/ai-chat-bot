/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  distDir: 'dist',
  experimental: {
    turbo: {
      resolveAlias: {
        '@/lib/*': './src/lib/*',
      },
    },
  },
};

module.exports = nextConfig;
