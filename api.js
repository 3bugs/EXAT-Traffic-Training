const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cronJob = require("cron").CronJob;
const fetch = require('node-fetch');

app.use(express.static('./'));

io.on('connection', function (socket) {
  console.log('client connected');

  socket.on('disconnect', function () {
    console.log('client disconnected');
  });
});

new cronJob("*/1 * * * *", function () {
  console.log('CRON JOB RUN: ' + new Date());
  //io.emit('event-test', {msg: 'Hello Socket.IO'});

  fetch('https://alg.exat.co.th/api/roads/1', {
    method: 'get',
    headers: {'Authorization': 'Token 8a4e96ed4c9281af4d0c2189c6a72551fe940b43'},
  })
    .then(result => result.json())
    .then(result => {
      const chunks = result[0].chunks;
      console.log(chunks)
      io.emit('update-traffic', chunks);
    });
}, null, true);

http.listen(3000, function () {
  console.log('listening on *:3000');
});
