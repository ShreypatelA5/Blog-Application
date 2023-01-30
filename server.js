var express = require("express");
var app = express();
var path = require("path");
const blogService = require('./blog-service');
const fs = require('fs');

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static("public"));
// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
  res.redirect("/about");
});

app.get("/about", function (req, res) {
  res.sendFile(__dirname + "/views/about.html");
});

app.get('/blog', (req, res) => {
  const publishedPosts = blogService.getPublishedPosts();
  res.json(publishedPosts);
  });

  app.get('/posts', (req, res) => {
    const posts = blogService.getAllPosts();
    res.json(posts);
  });

  app.get('/categories', (req, res) => {
    const posts = blogService.getAllCategories();
    res.json(posts);
  });

  app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.jpeg'));
  });
  

  
blogService.initialize()
.then(() => {
  app.listen(HTTP_PORT, () => {
    console.log("Server started on port 8080");
  });
})
.catch(err => {
  console.error("Unable to start the server:", err);
});


// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);