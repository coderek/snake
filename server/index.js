var path = require('path');
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

app.use(express.static(
    path.normalize(path.join(__dirname, '..', 'build'))));
app.use(express.static(
    path.normalize(path.join(__dirname, '..', 'node_modules'))));

const rooms = [];

io.on('connection', function(socket){
    console.log('a user connected', socket.rooms);

    setTimeout(()=> {
        socket.send('hello');
    }, 100);

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('message', msg => {
        io.of('
        // for (let r of Object.keys(socket.rooms)) {
        //     io.to(r).emit('message', msg);
        // }
    });
});

app.get('/rooms', (req, res) => res.json(rooms));

http.listen(port, function(){
  console.log('listening on *:' + port);
});

function createRoom(name) {

}
