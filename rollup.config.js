import json from 'rollup-plugin-json'
import uglify from 'rollup-plugin-uglify'
import {
  minify
} from 'uglify-es'

const activeConfigs = [{
  input: 'src/main.js',
  output: {
    file: 'index.js',
    format: 'cjs'
  },
  plugins: [json()]
}, {
  input: 'src/main.js',
  output: {
    file: 'dist/mdkeywords.umd.js',
    name: 'mdkeywords',
    format: 'umd'
  },
  plugins: [json()]
}]

const minifiedConfigs = activeConfigs.reduce(
  (minifiedConfigs, activeConfig) => {
    if (activeConfig.output.file.indexOf('dist') !== -1) {
      return minifiedConfigs.concat(
        Object.assign({}, activeConfig, {
          plugins: [uglify.uglify({}, minify), ...activeConfig.plugins],
          output: {
            file: activeConfig.output.file.replace('js', 'min.js'),
            format: activeConfig.output.format,
            name: activeConfig.output.name
          }
        })
      )
    }
    return minifiedConfigs
  }, [])

export default activeConfigs.concat(minifiedConfigs)
