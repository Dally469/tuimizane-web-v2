const isProduction = process.env.NODE_ENV === 'production';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (isProduction && !apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL must be set for production builds.');
}

const resolvedApiUrl = apiUrl || 'http://localhost:8080';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Avoid transpiling MUI packages here — letting Next treat them
  // as external vendor packages prevents webpack from producing
  // vendor-chunk paths that can be missing at runtime.
  env: {
    NEXT_PUBLIC_API_URL: resolvedApiUrl,
  },
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/assets/logo.png',
      },
      {
        source: '/api/:path*',
        destination: `${resolvedApiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
