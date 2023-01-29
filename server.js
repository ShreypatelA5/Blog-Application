var express = require('express');
var app = express();
var PORT = 3000;
app.use(express.static('views'));
// Without middleware
app.get('/', function(req, res){
    res.redirect('/about');
});
  
app.get('/about', function(req, res){
    res.redirect('/views/about.html');
});
  
app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});