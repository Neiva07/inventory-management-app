import type { ForgeConfig } from '@electron-forge/shared-types';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';



const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    executableName: "Inventory App",
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        bin: 'Inventory App',
      }
    },
    {
      name: '@electron-forge/maker-zip',
      config: {
        bin: 'Inventory App',
      },
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        bin: 'Inventory App',
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        bin: 'Inventory App',
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
        generateReleaseNotes: true,
        force: true
      }
    }
  ]
};

export default config;
