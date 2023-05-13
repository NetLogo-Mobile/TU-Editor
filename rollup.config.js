import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: './src/main.ts',
    output: {
      file: './dist/tortuga-editor.js',
      format: 'iife',
    },
    plugins: [
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      nodeResolve(),
    ],
  },
];
