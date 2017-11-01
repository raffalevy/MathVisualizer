const path = require('path');

module.exports = {
    entry: './client/ts/reactTest.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'client')
    }
};