/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "https://img.clerk.com", "img.clerk.com"],
  },
  // Handle chunk loading errors gracefully
  onDemandEntries: {
    // Make sure pages have a longer period to be idle before disposing
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Generate unique deployment IDs for better caching
  generateEtags: true,
  poweredByHeader: false,
};

export default nextConfig;
