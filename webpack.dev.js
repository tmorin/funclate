const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        filename: 'dist/funclate.js'
    },
    resolve: {
        fallback: {
            "stream": require.resolve("stream-browserify")
        }
    }
});
