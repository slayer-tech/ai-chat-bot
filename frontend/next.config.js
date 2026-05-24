/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  distDir: 'dist',
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
