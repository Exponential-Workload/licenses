import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';

export default [
  {
    input: 'src/main.ts',
    output: [
      {
        file: 'dist/lib.cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/lib.esm.mjs',
        format: 'esm',
        sourcemap: true,
      }
    ],
    plugins: [
      alias({
        entries: [
          {
            find: '~',
            replacement: './src',
          },
          {
            find: '@',
            replacement: './src',
          },
          {
            find: '$',
            replacement: './src',
          },
        ],
      }),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true,
        declaration: true,
        compilerOptions: {
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
        },
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
      }),
      terser(), // minifies generated bundles
    ],
    external: [],
  },
];
