/** @type {import('next').NextConfig} */
const nextConfig = {
  // The One SDK wraps a native (Rust) client; keep it out of the webpack bundle.
  serverExternalPackages: ["@withone/sdk"],
};

export default nextConfig;
