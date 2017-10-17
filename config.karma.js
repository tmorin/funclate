const path = require('path');
const webpack = require('webpack');

const webpackConfig = {
    resolve: {
        extensions: ['.ts', '.js', '.tsx', '.jsx']
    },
    module: {
        rules: [{
            test: /\.ts$/,
            loader: 'ts-loader',
            exclude: /node_modules/
        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }]
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: null,
            test: /\.(ts)($|\?)/i
        })
    ]
};
module.exports = function (config) {
    let reporters = ['progress'];
    if (process.env.COVERAGE) {
        webpackConfig.module.rules.push({
            test: /src\/.+\.ts$/,
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

        frameworks: ['mocha'],

        singleRun: true,

        reporters: reporters,

        files: [
            'test/runtime/*.spec.ts',
            'test/parser/*.spec.ts'
        ],

        preprocessors: {
            'test/runtime/*.spec.ts': ['webpack', 'sourcemap'],
            'test/parser/*.spec.ts': ['webpack', 'sourcemap']
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
