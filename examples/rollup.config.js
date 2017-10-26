import babel from 'rollup-plugin-babel'

export default {
  output: {
    format: 'iife'
  },
  plugins: [babel({
    babelrc: false,
    presets: ['es2015-rollup', 'flow']
  })]
}
