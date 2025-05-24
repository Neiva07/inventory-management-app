import type { ForgeConfig } from '@electron-forge/shared-types';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    executableName: "Stockify App",
    win32metadata: {
      CompanyName: "Lucas Neiva",
      FileDescription: "Inventory Management Application",
      OriginalFilename: "Stockify.exe",
      ProductName: "Stockify App",
      InternalName: "Stockify App"
    },
    icon: './assets/icons/logo',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        bin: 'Stockify App',
        iconUrl: './assets/icons/logo.ico',
        setupIcon: './assets/icons/logo.ico'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      config: {
        bin: 'Stockify App',
      },
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        bin: 'Stockify App',
        options: {
          icon: './assets/icons/logo.png'
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        bin: 'Stockify App',
        options: {
          icon: './assets/icons/logo.png'
        }
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {
        asar: true,
      },
    },
    new WebpackPlugin({
      mainConfig,
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
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'Neiva07',
          name: 'inventory-management-app'
        },
        prerelease: true,
        draft: false,
        overwrite: true,
        generateReleaseNotes: true,
        force: true
      }
    }
  ]
};

export default config;
