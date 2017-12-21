
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

var path = require('path');
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

app.use(express.static(path.normalize(path.join(__dirname, '..', 'build'))));
app.use(express.static(path.normalize(path.join(__dirname, '..', 'node_modules'))));


io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
