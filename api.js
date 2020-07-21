const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cronJob = require("cron").CronJob;

app.use(express.static('./'));

io.on('connection', function (socket) {
  console.log('client connected');

  socket.on('disconnect', function () {
    console.log('client disconnected');
  });
});

new cronJob("*/1 * * * *", function() {
  console.log('CRON JOB RUN: ' + new Date());
  io.emit('event-test', {msg: 'Hello Socket.IO'});
}, null, true);

http.listen(3000, function () {
  console.log('listening on *:3000');
});
