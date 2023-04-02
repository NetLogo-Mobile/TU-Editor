import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: './src/main.ts',
    output: {
      file: './dist/tortuga-editor.js',
      format: 'iife',
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
      nodeResolve(),
    ],
  },
];
