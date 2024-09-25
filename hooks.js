import * as babel from '@babel/core';
import fs from 'node:fs';
import { URL, fileURLToPath } from 'node:url';
import { babelPluginVanillaJSX } from './vanillajsx.js';

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  }
  catch (e) {
    if (specifier.endsWith('.js')) {
      return {
        shortCircuit: true,
        url: new URL(specifier.replace(/\.js$/, '.tsx'), context.parentURL).href,
      }
    }
    throw e;
  }
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.tsx')) {
    const source = fs.readFileSync(fileURLToPath(url)).toString('utf8');
    const result = babel.transformSync(source, {
      sourceMaps: 'inline',
      plugins: [
        ['@babel/plugin-transform-typescript', { isTSX: true }],
        [babelPluginVanillaJSX],
      ],
    });

    return {
      shortCircuit: true,
      format: 'module',
      source: result.code,
    };
  }

  return await nextLoad(url, context);
} 
