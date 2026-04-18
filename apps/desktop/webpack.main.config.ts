import type { Configuration } from 'webpack';
import path from "path"
import webpack from 'webpack';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production' });

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
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
      'process.env.SYNC_API_URL': JSON.stringify(process.env.SYNC_API_URL),
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: {
      root: __dirname,
      src: path.resolve(__dirname, 'src'),
      model: path.resolve(__dirname, 'src/model'),
      context: path.resolve(__dirname, 'src/context'),
      lib: path.resolve(__dirname, 'src/lib'),
    },
    modules: [path.resolve(__dirname, "src"), "node_modules"]
  },
};
