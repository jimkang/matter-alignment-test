/* global process */

import createConfig from './rollup-tools/base-config';
import { serve } from './rollup-tools/config-tools';

var auroraDrawrers = [];

// Inspired by https://github.com/Tom-Siegel/multi-page-svelte/blob/5dd47f9ffe3cbddbaa5e29be5056ce1ed56060b2/rollup-pages.config.js#L45
var configs = [
  {
    input: 'app.js',
    outputFile: 'index.js',
    reloadPath: '.',
    serve: !process.env.APP && serve,
    serveOpts: { port: 7000 },
  },
]
  .concat(
    auroraDrawrers.map((v) => ({
      input: `matter-alignment-tests/${v}/${v}-matter-alignment-test.js`,
      outputFile: `matter-alignment-tests/${v}/${v}-matter-alignment-test-bundle.js`,
      reloadPath: `matter-alignment-tests/${v}`,
      serve: process.env.APP === v && serve,
      serveOpts: { rootDir: '.', serveDir: `matter-alignment-tests/${v}`, port: 6001 },
    }))
  )
  .map(createConfig);

export default configs;
