const path = require('path');

module.exports = {
    entry: {
        reactTest: './client/ts/reactTest.js',
        electric: './client/ts/electric.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'client')
    }
};