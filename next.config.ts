import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  experimental: {
    serverActions: {
      // Up to 14 photos at 5MB each, plus form field overhead.
      bodySizeLimit: "75mb",
    },
    // Matches serverActions.bodySizeLimit — otherwise Next buffers/clones the
    // body at its 10MB default and truncates larger uploads mid-multipart,
    // producing "Unexpected end of form" server action errors.
    proxyClientMaxBodySize: "75mb",
  },
};

export default nextConfig;
