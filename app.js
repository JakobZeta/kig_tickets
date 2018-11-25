var express = require('express');
var http = require('http');
var path = require('path');
var app = express();

function normalizePort(val) {
    var port = parseInt(val, 10);
  
    if (isNaN(port)) {
      // named pipe
      return val;
    }
  
    if (port >= 0) {
      // port number
      return port;
    }
  
    return false;
  }

if (process.env.NODE_ENV != 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
}

app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = http.createServer(app);

server.listen(port);