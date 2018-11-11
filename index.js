const express = require('express');
const SocketServer = require('ws').Server;
const sqlite3 = require('sqlite3').verbose();
const auth = require('./auth');
const PORT = process.env.PORT || 5000

var app = express();

app.use(auth);
app.use(express.static('www'));
app.use(express.static('src'));
app.use(express.static('downloads'));





const server = app.listen(PORT, () => console.log(`Listening on ${ PORT }`))



const wss = new SocketServer({ server });
wss.on('connection', function connection(ws) {

    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
    });
  
    var db = new sqlite3.Database('db/galaga.sqlite');
    var sql = "SELECT * FROM top10scores";
    db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        }

        var msg = {

            type: "top10Scores"
        }
        var scoressArray = [];
          
        rows.forEach((row) => {
            var score = {name: row.name, score: row.score};
            scoressArray.push(score);
        });

        msg.scores = scoressArray;
        var msgStr = JSON.stringify(msg);
        ws.send(msgStr);
      });
      db.close();
  
});