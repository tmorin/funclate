const path = require("path");

module.exports = {
    entry: path.resolve(__dirname, 'src/runtime.ts'),
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
        libraryTarget: "umd",
        path: path.resolve(__dirname)
    }
};

