const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cronJob = require("cron").CronJob;
const fetch = require('node-fetch');

const routeIdList = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

app.use(express.static('./'));

io.on('connection', function (socket) {
  console.log('client connected');
  fetchData();

  socket.on('disconnect', function () {
    console.log('client disconnected');
  });
});

new cronJob("*/1 * * * *", function () {
  console.log('CRON JOB RUN: ' + new Date());
  fetchData();
}, null, true);

fetchData = () => {
  routeIdList.forEach(routeId => {
    fetch('https://alg.exat.co.th/api/roads/' + routeId, {
      method: 'get',
      headers: {'Authorization': 'Token 8a4e96ed4c9281af4d0c2189c6a72551fe940b43'},
    })
      .then(result => result.json())
      .then(emitResult);
  });
};

emitResult = result => {
  const route = result[0];
  //console.log(route)
  io.emit('update-traffic', route);
};

http.listen(3000, function () {
  console.log('listening on *:3000');
});
