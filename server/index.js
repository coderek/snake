
class GameState {
}

class PlayerConnection {
}



// export class Server {
//     constructor() {
//         this._connections = new ConnectionManager();
//     }

//     onConnect() {
//     }

//     onMessage(m) {
//     }
// }


'use strict';

const express = require('express');
const path = require('path');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
    res.send('Hello fdduck\n');
});

app.use(express.static(path.normalize(path.join(__dirname, '..', 'build'))));
app.use(express.static(path.normalize(path.join(__dirname, '..', 'node_modules'))));


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
