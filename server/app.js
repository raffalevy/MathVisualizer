const express = require('express');
const format = require('util').format;

const PORT = 3000;

const app = express();

app.use('/', express.static("./client", {extensions: ['html']}));

app.listen(PORT, () => {
    console.log(format("Listening on port %i", PORT))
});