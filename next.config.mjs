/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint reste actif en local (npm run lint) mais ne bloque plus les
  // builds Vercel sur des warnings cosmétiques (imports inutilisés, etc.)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // On garde le check TypeScript actif pour les vrais bugs de typage
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // Autorise les CDN d'avatars TikTok et Instagram pour <Image> futurs
    remotePatterns: [
      { protocol: "https", hostname: "**.tiktokcdn.com" },
      { protocol: "https", hostname: "**.tiktokcdn-us.com" },
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "scontent.cdninstagram.com" },
      { protocol: "https", hostname: "instagram.fcdg1-1.fna.fbcdn.net" },
    ],
  },
};

export default nextConfig;
