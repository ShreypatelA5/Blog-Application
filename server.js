var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.static("views/about.html"));

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/about",function(res){
    res.redirect('/views/about.html');
});



// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);