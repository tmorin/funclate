const path = require("path");

module.exports = {
    entry: path.resolve(__dirname, 'src/index.ts'),
    module: {
        rules: [
            {
                test: /\.(ts|js)$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                    options: {}
                },

            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js", ".json"]
    },
    output: {
        library: "funclate",
        libraryTarget: "umd2",
        path: path.resolve(__dirname)
    }
};

