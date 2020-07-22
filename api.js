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
  /*routeIdList.forEach(routeId => {
    fetch('https://alg.exat.co.th/api/roads/' + routeId, {
      method: 'get',
      headers: {'Authorization': 'Token 8a4e96ed4c9281af4d0c2189c6a72551fe940b43'},
    })
      .then(result => result.json())
      .then(emitResult);
  });*/

  const promiseList = [];
  routeIdList.forEach(routeId => {
    const promise = fetch('https://alg.exat.co.th/api/roads/' + routeId, {
      method: 'get',
      headers: {'Authorization': 'Token 8a4e96ed4c9281af4d0c2189c6a72551fe940b43'},
    })
      .then(result => result.json())
      .then(result => result[0].chunks);

    promiseList.push(promise);
  })

  Promise.all(promiseList).then(resultList => {
    const allRouteChunks = resultList.reduce((total, chunks) => {
      return total.concat(chunks.map(chunk => {
          return {
            id: chunk.chunk_id,
            idx: chunk.traffic_index
          };
        })
      );
    }, []);

    console.log(allRouteChunks);
    io.emit('update-traffic', allRouteChunks);
  });
};

emitResult = result => {
  /*new Promise((resolve, reject) => {
    resolve(result[0].chunks);
  });*/
  return result[0].chunks;
  /*const route = result[0];
  io.emit('update-traffic', route);*/
};

http.listen(3000, function () {
  console.log('listening on *:3000');
});
