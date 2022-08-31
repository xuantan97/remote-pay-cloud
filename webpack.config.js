const path = require('path');

module.exports = {
    mode: 'production',
    entry: "./dist/src/com/clover/index.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        library: {
            name: 'clover',
            type: 'umd'
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    }
};