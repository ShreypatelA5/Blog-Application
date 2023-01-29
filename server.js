const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}


app.get('/about/', function(req, res){
    res.send("Hello from the root application URL");
});

app.get('/about/views/', function(req, res){
    res.send("Hello from the 'test' URL");
});

app.listen(HTTP_PORT, onHttpStart);