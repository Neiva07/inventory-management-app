import type { Configuration } from 'webpack';
import path from "path"
import webpack from 'webpack';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

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
      'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY),
      'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID),
      'process.env.FIREBASE_APP_ID': JSON.stringify(process.env.FIREBASE_APP_ID),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
      'process.env.TURSO_DATABASE_URL': JSON.stringify(process.env.TURSO_DATABASE_URL),
      'process.env.TURSO_LOCAL_DATABASE_URL': JSON.stringify(process.env.TURSO_LOCAL_DATABASE_URL),
      'process.env.TURSO_AUTH_TOKEN': JSON.stringify(process.env.TURSO_AUTH_TOKEN),
      'process.env.LOGIN_URL': JSON.stringify(process.env.LOGIN_URL),
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
