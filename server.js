var express = require('express');
var app = express();
app.use('/', express.static('public'));

var twiliojs = require('./twilio.js');
const PORT = process.env.PORT || 8080;
var server = app.listen(PORT);
var io = require('socket.io')(server);

// socket request handling
io.on('connection', function(socket) {
    socket.emit('initial', 'io: connected');

    socket.on('text', function(data) {
        twiliojs.send_this_message( data );
    });
});
