import fs from 'fs';
import path from 'path';
import { Application } from 'express';
import { API_VERSION } from '@/constants';

export const load_routes = async (app: Application) => {
  const routesDir = path.resolve(__dirname, '../routes');
  const files = fs.readdirSync(routesDir);

  for (const file of files) {
    if (file.endsWith('.routes.ts') || file.endsWith('.routes.js')) {
      const fullPath = path.join(routesDir, file);
      const routeModule = await import(fullPath);

      const route = routeModule.default;
      const basePath = routeModule.basePath;

      if (!route || !basePath) {
        continue;
      }

      app.use(`${API_VERSION}${basePath}`, route);
      console.log(`✅ Loaded route: ${basePath}`);
    }
  }
};
