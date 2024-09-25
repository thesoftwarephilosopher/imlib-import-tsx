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
      const tsx = new URL(specifier.replace(/\.js$/, '.tsx'), context.parentURL);
      if (fs.existsSync(fileURLToPath(tsx))) {
        return { shortCircuit: true, url: tsx.href };
      }

      const ts = new URL(specifier.replace(/\.js$/, '.ts'), context.parentURL);
      if (fs.existsSync(fileURLToPath(ts))) {
        return { shortCircuit: true, url: ts.href };
      }
    }
    throw e;
  }
}

export async function load(url, context, nextLoad) {
  if (url.match(/\.tsx?$/)) {
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
