/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "cdn.simpleicons.org" },
    ],
    // Allow SVG mockups served from /public (locked-down via CSP)
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Redirect "/" to "/v2" so the V2 landing is the default home page.
  // To revert (show V1 at /), remove this redirects() block.
  async redirects() {
    return [
      {
        source: "/",
        destination: "/v2",
        permanent: false, // 307 redirect — reversible facilement
      },
    ];
  },
};

export default nextConfig;
