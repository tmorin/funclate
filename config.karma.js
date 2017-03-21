'use strict';

const webpackDevConfig = require('./config.webpack');

module.exports = (config) => {

    const karmaConfig = {

        basePath: '',

        frameworks: ['mocha', 'sinon-chai'],

        files: [
            'test/**/*.spec.js'
        ],

        exclude: [],

        preprocessors: {
            'test/**/*.spec.js': ['webpack', 'sourcemap']
        },

        webpack: Object.assign({}, webpackDevConfig, {
            devtool: 'inline-source-map'
        }),

        webpackMiddleware: {
            noInfo: true
        },

        reporters: ['progress'],

        port: 9877,

        colors: true,

        autoWatch: false,

        browsers: ['PhantomJS'],

        customLaunchers: {
            IE9_EMULATE: {
                base: 'IE',
                'x-ua-compatible': 'IE=EmulateIE9'
            },
            IE10_EMULATE: {
                base: 'IE',
                'x-ua-compatible': 'IE=EmulateIE10'
            }
        },

        singleRun: true,

        client: {
            mocha: {
                reporter: 'html'
            }
        },

        logLevel: config.LOG_INFO

    };


    if (process.env.COVERAGE) {
        console.log('---- CAPTURE COVERAGE ----');
        karmaConfig.webpack.module.rules[0] = {
            test: /\.js?$/,
            exclude: /node_modules|\/example\/|\.spec.js$/,
            loader: 'isparta-loader'
        };
        karmaConfig.webpack.module.rules.push({
            test: /\/example\/|\.spec.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        });
        karmaConfig.reporters.push('coverage');
        karmaConfig.coverageReporter = {
            reporters: [
                {type: 'lcov', dir: 'coverage/', subdir: '.'}
            ]
        };
    }

    config.set(karmaConfig);
};
