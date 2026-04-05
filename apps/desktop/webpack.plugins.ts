import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const nodeMajor = Number(process.versions.node.split('.')[0]);
const shouldUseForkTsChecker =
  process.env.USE_FORK_TS_CHECKER !== 'false' && Number.isFinite(nodeMajor) && nodeMajor < 22;

export const plugins = shouldUseForkTsChecker
  ? [
      new ForkTsCheckerWebpackPlugin({
        logger: 'webpack-infrastructure',
      }),
    ]
  : [];
