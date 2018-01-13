const path = require('path');

module.exports = {
    entry: {
        parametric: './client/ts/parametric.tsx',
        electric: './client/ts/electric.tsx',
        diff: './client/ts/diff.tsx',
        heat: './client/ts/heat.tsx'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'client/bundles'),
        publicPath: "client"
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
        extensions: [ '.tsx', '.ts', '.js' ]
    }
};