var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
res.redirect('/about', function(req,res){
    res.send("/views/about.html");
});

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.send("<h3>About</h3>");
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);