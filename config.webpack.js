'use strict';

const webpack = require('webpack');

module.exports = {
    module: {
        rules: [
            {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'},
            {test: /\.json/, loader: 'json-loader'}
        ]
    },
    output: {
        library: 'funclate',
        libraryTarget: 'umd'
    }
};
