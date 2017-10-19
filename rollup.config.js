import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  plugins: [babel({
    babelrc: false,
    presets: ['es2015-rollup', 'flow']
  })],
  output: [{
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: true
  }, {
    file: 'dist/index.es.js',
    format: 'es',
    sourcemap: true
  }]
}
