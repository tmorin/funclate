const path = require('path');
const webpack = require('webpack');

const webpackConfig = {
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }, {
            test: /src\/.+\.js$/,
            exclude: /(node_modules|\.spec\.ts$)/,
            loader: 'istanbul-instrumenter-loader',
            enforce: 'post'
        }]
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: null,
            test: /\.(js)($|\?)/i
        })
    ]
};

module.exports = function (config) {
    config.set({

        basePath: './',

        browsers: ['PhantomJS'],
        // browsers: ['Firefox'],

        frameworks: ['mocha', 'sinon-chai'],

        singleRun: true,

        reporters: ['progress', 'coverage-istanbul'],

        files: [
            'test/**/*.spec.js'
        ],

        preprocessors: {
            'test/**/*.spec.js': ['webpack', 'sourcemap']
        },

        client: {
            mocha: {
                reporter: 'html'
            }
        },

        logLevel: config.LOG_INFO,

        webpack: webpackConfig,

        webpackMiddleware: {
            stats: 'errors-only',
            noInfo: true
        },

        coverageIstanbulReporter: {
            reports: ['lcov'],
            dir: path.join(__dirname, 'coverage')
        }
    });
};
