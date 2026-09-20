import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";


/**
 * Keeps sitemap.xml in sync with the catalogue without any manual step:
 *  - in dev, /sitemap.xml is generated on every request, so products,
 *    categories, pages, videos or reviews added in the admin appear at once
 *  - before a production build the file is written to public/
 */
function sitemap(): Plugin {
  const load = async () => {
    // @ts-expect-error — plain ESM script, no type declarations
    const mod = (await import("./backend/scripts/generate-sitemap.mjs")) as {
      buildSitemap: () => Promise<{ xml: string; count: number }>;
      writeSitemap: (cwd?: string) => Promise<number>;
    };
    return mod;
  };
  return {
    name: "priora-sitemap",
    async buildStart() {
      try {
        const { writeSitemap } = await load();
        await writeSitemap(process.cwd());
      } catch {
        /* offline build — keep the committed sitemap */
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/sitemap.xml")) return next();
        try {
          const { buildSitemap } = await load();
          const { xml } = await buildSitemap();
          res.setHeader("Content-Type", "application/xml");
          res.end(xml);
        } catch {
          next();
        }
      });
    },
  };
}

function localApi(): Plugin {
  return {
    name: "priora-local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();
        try {
          const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
          const endpointName = urlObj.pathname.replace(/^\/api\//, "").split("/")[0];
          const filePath = path.resolve(__dirname, `./api/${endpointName}.js`);

          let body = {};
          if (["POST", "PUT", "PATCH"].includes(req.method || "")) {
            const buffers: Buffer[] = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const rawBody = Buffer.concat(buffers).toString();
            try {
              body = JSON.parse(rawBody);
            } catch {
              body = {};
            }
          }

          const mod = await server.ssrLoadModule(filePath);
          const handler = mod.default || mod;

          const query = Object.fromEntries(urlObj.searchParams.entries());
          (req as any).body = body;
          (req as any).query = query;

          (res as any).status = (code: number) => {
            res.statusCode = code;
            return res;
          };
          (res as any).json = (data: any) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
            return res;
          };

          await handler(req, res);
        } catch (err: any) {
          console.error("Local API execution error:", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  root: "frontend",
  envDir: path.resolve(__dirname, "./backend"),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    sitemap(),
    localApi(),
    // Offline support. Registration is handled exclusively by src/registerSW.ts,
    // which refuses dev + every preview/iframe context, so previews can never be
    // served stale HTML by a worker.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      devOptions: { enabled: false },
      filename: "sw.js",
      includeAssets: ["favicon.png", "apple-touch-icon.png", "robots.txt"],
      manifest: {
        name: "PRIORA by KP",
        short_name: "PRIORA",
        description: "Handcrafted jewellery — earrings, rings, bracelets and necklaces.",
        theme_color: "#FCD7C4",
        background_color: "#FFFDF9",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/, /^\/sitemap\.xml/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // HTML navigations must never be served cache-first.
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: { cacheName: "priora-pages", networkTimeoutSeconds: 4 },
          },
          {
            urlPattern: ({ request, sameOrigin }) =>
              sameOrigin && ["style", "script", "worker"].includes(request.destination),
            handler: "NetworkFirst",
            options: { cacheName: "priora-assets", networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: ({ request }) => ["image", "video"].includes(request.destination),
            handler: "CacheFirst",
            options: {
              cacheName: "priora-media",
              expiration: { maxEntries: 250, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],

  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend/src"),
    },
  },
}));
