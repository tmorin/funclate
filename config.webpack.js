module.exports = {
    resolve: {
        extensions: ['.ts', '.js', '.tsx', '.jsx']
    },
    module: {
        rules: [{
            test: /\.ts/,
            loader: 'tslint-loader',
            exclude: /node_modules/,
            enforce: 'pre'
        }, {
            test: /\.ts/,
            loader: 'ts-loader',
            exclude: /node_modules/
        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }]
    },
    output: {
        libraryTarget: 'umd'
    }
};
