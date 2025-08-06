const isDev = process.env.NODE_ENV === "development";

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  compress: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://apis.google.com https://cdn.jsdelivr.net;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              media-src 'self' https://res.cloudinary.com blob:;
              img-src 'self' data: https: http: https://res.cloudinary.com;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://fonts.googleapis.com wss://social-media-app-t8htg4xd.livekit.cloud https://api.aladhan.com/v1/timings https://fonts.gstatic.com https://res.cloudinary.com http://res.cloudinary.com ${
                isDev ? "http://localhost:8000 ws://localhost:8000" : "https://ummah-connect.onrender.com wss://ummah-connect.onrender.com"
              };
              frame-src 'none';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              upgrade-insecure-requests;
              block-all-mixed-content;
            `.replace(/\s{2,}/g, " ").trim(),
          },
          ...(isDev
            ? []
            : [
                {
                  key: "Cache-Control",
                  value:
                  "public, max-age=3600, stale-while-revalidate=60",
                },
              ]),
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
