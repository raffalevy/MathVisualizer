import * as express from 'express';
import {format} from "util";

const PORT = 3000;

const app = express();

app.use('/', express.static("./client"));

app.listen(PORT, () => {
    console.log(format("Listening on port %i", PORT))
});