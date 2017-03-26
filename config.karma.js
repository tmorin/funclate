const path = require('path');
const webpack = require('webpack');

const webpackConfig = {
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }, {
            test: /\.json$/,
            loader: 'json-loader'
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
    let reporters = ['progress'];
    if (process.env.COVERAGE) {
        webpackConfig.module.rules.push({
            test: /src\/.+\.js$/,
            exclude: /(node_modules|\.spec\.ts$)/,
            loader: 'istanbul-instrumenter-loader',
            enforce: 'post'
        });
        reporters.push('coverage-istanbul');
    }
    config.set({

        basePath: './',

        browsers: ['PhantomJS'],
        //browsers: ['Firefox'],
        //browsers: ['PhantomJS', 'Firefox'],

        frameworks: ['mocha', 'sinon-chai'],

        singleRun: true,

        reporters: reporters,

        files: [
            'test/runtime/*.spec.js',
            'test/parser/*.spec.js'
        ],

        preprocessors: {
            'test/runtime/*.spec.js': ['webpack', 'sourcemap'],
            'test/parser/*.spec.js': ['webpack', 'sourcemap']
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
