/** @type {import('next').NextConfig} */
const nextConfig = {
  // ========================================================================
  // TRANSPILE PACKAGES
  // ========================================================================
  // Transpile workspace packages for proper module resolution
  transpilePackages: [
    '@studio/ui',
    '@studio/utils',
    '@studio/contracts',
    '@studio/api-sdk',
  ],

  // ========================================================================
  // EXPERIMENTAL FEATURES
  // ========================================================================
  experimental: {
    // Enable server actions for future use
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // ========================================================================
  // SECURITY HEADERS
  // ========================================================================
  // Security headers for production deployment
  // Per TASK-008: Placeholder for future CSP, X-Frame-Options, etc.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // TODO: Add Content Security Policy once requirements are clear
          // {
          //   key: 'Content-Security-Policy',
          //   value: "default-src 'self'; ...",
          // },
        ],
      },
    ];
  },

  // ========================================================================
  // WEBPACK CONFIGURATION
  // ========================================================================
  // Custom webpack configuration for bundle analysis (optional)
  webpack: (config, { isServer }) => {
    // Placeholder for future bundle analysis or optimizations
    // Example: Add webpack-bundle-analyzer when needed
    // if (!isServer) {
    //   config.plugins.push(new BundleAnalyzerPlugin());
    // }
    return config;
  },

  // ========================================================================
  // OUTPUT CONFIGURATION
  // ========================================================================
  // Output configuration for production builds
  output: 'standalone',

  // ========================================================================
  // POWER MODE
  // ========================================================================
  // Optimize for production performance
  poweredByHeader: false,
  reactStrictMode: true,

  // ========================================================================
  // IMAGE OPTIMIZATION
  // ========================================================================
  images: {
    // Configure allowed image domains as needed
    remotePatterns: [
      // Add GitHub avatars if using GitHub authentication
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

module.exports = nextConfig;
