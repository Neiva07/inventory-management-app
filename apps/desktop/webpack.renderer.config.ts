import type { Configuration } from 'webpack';
import path from "path"
import webpack from 'webpack';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production' });

const syncApiUrl =
  process.env.SYNC_API_URL ??
  (process.env.NODE_ENV === 'development' || process.env.npm_lifecycle_event === 'start'
    ? 'http://localhost:3111'
    : undefined);

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader', options: { importLoaders: 1 } },
    { loader: 'postcss-loader' },
  ],
});

export const rendererConfig: Configuration = {
  target: 'electron-renderer',
  externals: [
    ({ request }, callback) => {
      if (!request) {
        return callback();
      }

      if (
        request === '@libsql/client' ||
        request === 'libsql' ||
        request.startsWith('@libsql/') ||
        request === '@neon-rs/load' ||
        request === 'detect-libc'
      ) {
        return callback(null, `commonjs2 ${request}`);
      }

      return callback();
    },
  ],
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    new webpack.DefinePlugin({
      'process.env.CLERK_API_SECRET_KEY': JSON.stringify(process.env.CLERK_API_SECRET_KEY),
      'process.env.TURSO_DATABASE_URL': JSON.stringify(process.env.TURSO_DATABASE_URL),
      'process.env.TURSO_LOCAL_DATABASE_URL': JSON.stringify(process.env.TURSO_LOCAL_DATABASE_URL),
      'process.env.TURSO_AUTH_TOKEN': JSON.stringify(process.env.TURSO_AUTH_TOKEN),
      'process.env.LOGIN_URL': JSON.stringify(process.env.LOGIN_URL),
      'process.env.SYNC_API_URL': JSON.stringify(syncApiUrl),
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: {
      root: __dirname,
      src: path.resolve(__dirname, 'src'),
    },
    modules: [path.resolve(__dirname, "src"), "node_modules"]
  },
};
