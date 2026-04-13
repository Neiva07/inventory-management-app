import type { ForgeConfig } from '@electron-forge/shared-types';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import Logger from '@electron-forge/web-multi-logger';
import { cpSync, existsSync } from 'fs';
import path from 'path';
import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

/**
 * Webpack externals (`@libsql/client`, `libsql`, etc.) aren't bundled — they
 * rely on a runtime `require()`. In a pnpm workspace these modules live in the
 * root `node_modules/`, but Forge's webpack plugin builds a staging directory
 * with an empty `node_modules/`. This function resolves the full transitive
 * dependency tree of the externalized modules and copies them all into the
 * staging directory so they end up in the packaged app.
 */
const EXTERNAL_ROOTS = ['@libsql/client', 'libsql', '@neon-rs/load', 'detect-libc'];

const resolveTransitiveDeps = (rootModules: string, entryModules: string[]): string[] => {
  const seen = new Set<string>();
  const queue = [...entryModules];

  while (queue.length > 0) {
    const mod = queue.shift()!;
    if (seen.has(mod)) continue;
    seen.add(mod);

    const pkgPath = path.join(rootModules, mod, 'package.json');
    if (!existsSync(pkgPath)) continue;

    const pkg = JSON.parse(require('fs').readFileSync(pkgPath, 'utf8'));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.optionalDependencies,
    };
    for (const dep of Object.keys(allDeps)) {
      if (!seen.has(dep)) queue.push(dep);
    }
  }

  return [...seen];
};

const copyExternalModulesToBuild = (buildPath: string) => {
  const rootModules = path.resolve(__dirname, '..', '..', 'node_modules');
  const buildModules = path.join(buildPath, 'node_modules');
  const allDeps = resolveTransitiveDeps(rootModules, EXTERNAL_ROOTS);

  for (const mod of allDeps) {
    const src = path.join(rootModules, mod);
    const dst = path.join(buildModules, mod);
    if (existsSync(src) && !existsSync(dst)) {
      const parentDir = path.dirname(dst);
      if (!existsSync(parentDir)) {
        require('fs').mkdirSync(parentDir, { recursive: true });
      }
      cpSync(src, dst, { recursive: true });
    }
  }
};

type LoggerServer = {
  on: (event: "error", listener: (error: Error) => void) => void;
};

type LoggerApp = {
  listen: (port: number, host: string, callback: () => void) => LoggerServer;
};

type LoggerInstance = {
  app: LoggerApp;
  port: number;
  server: LoggerServer | null;
};

type LoggerPrototype = {
  __stockifyPatchedHost?: boolean;
  start: (this: LoggerInstance) => Promise<number>;
};

const forgeDevServerPort = Number(process.env.FORGE_DEV_SERVER_PORT ?? 3026);
const forgeLoggerPort = Number(process.env.FORGE_LOGGER_PORT ?? 9026);
const forgeDevServerHost = process.env.FORGE_DEV_SERVER_HOST ?? '127.0.0.1';
const enableForgeWebLogger = process.env.FORGE_ENABLE_WEB_LOGGER === 'true';

const loggerPrototype = Logger.prototype as unknown as LoggerPrototype;

if (!loggerPrototype.__stockifyPatchedHost) {
  loggerPrototype.start = function startOnLocalhost(this: LoggerInstance): Promise<number> {
    if (!enableForgeWebLogger) {
      return Promise.resolve(this.port);
    }

    const loggerHost = process.env.FORGE_LOGGER_HOST ?? '127.0.0.1';

    return new Promise<number>((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, loggerHost, () => resolve(this.port));
        this.server.on('error', reject);
      } catch (error) {
        reject(error as Error);
      }
    });
  };

  loggerPrototype.__stockifyPatchedHost = true;
}

const config: ForgeConfig = {
  packagerConfig: {
    icon: './assets/icons/logo',
    asar: true,
    executableName: "Stockify",
    win32metadata: {
      CompanyName: "Lucas Neiva",
      FileDescription: "Inventory Management Application",
      OriginalFilename: "Stockify.exe",
      ProductName: "Stockify",
      InternalName: "Stockify"
    },
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: 'https://raw.githubusercontent.com/lucasneiva/inventory-management-app/main/assets/icons/logo.ico',
        setupIcon: './assets/icons/logo.ico'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      config: {
        bin: 'Stockify',
      },
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          bin: 'Stockify',
          icon: './assets/icons/logo.png'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          bin: 'Stockify',
          icon: './assets/icons/logo.png'
        }
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {
        asar: true,
      },
    },
    new WebpackPlugin({
      port: forgeDevServerPort,
      loggerPort: forgeLoggerPort,
      mainConfig,
      devServer: {
        host: forgeDevServerHost,
      },
      devContentSecurityPolicy: "connect-src 'self' * 'unsafe-eval'",
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
  ],
  hooks: {
    packageAfterCopy: async (_forgeConfig, buildPath) => {
      copyExternalModulesToBuild(buildPath);

      // Copy drizzle migration files so the app can run migrations at startup
      const drizzleSrc = path.resolve(__dirname, 'drizzle');
      const drizzleDst = path.join(buildPath, 'drizzle');
      if (existsSync(drizzleSrc) && !existsSync(drizzleDst)) {
        cpSync(drizzleSrc, drizzleDst, { recursive: true });
      }
    },
  },
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'Neiva07',
          name: 'inventory-management-app'
        },
        prerelease: false,
        draft: false,
        releaseType: 'release'
      }
    }
  ]
};

export default config;
