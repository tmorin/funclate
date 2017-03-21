module.exports = {
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    },
    output: {
        library: 'funclate',
        libraryTarget: 'umd'
    }
};
