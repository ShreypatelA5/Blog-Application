var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

res.redirect("/about", function(req,res){
    res.send("/views/about.html");
});

app.listen(HTTP_PORT, onHttpStart);