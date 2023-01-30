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

const getPublishedPosts = () => {
  const filePath = './data/posts.json';
  if (fs.existsSync(filePath)) {
  const rawData = fs.readFileSync(filePath);
  const posts = JSON.parse(rawData);
  const publishedPosts = posts.filter(post => post.published === true);
  return publishedPosts;
  } else {
  console.error(`Error: The file ${filePath} could not be found`);
  }
  };

app.get('/blog', (req, res) => {
  const publishedPosts = blogService.getPublishedPosts();
  res.json(publishedPosts);
  });

  //Return JSON format to POSTS
function getAllPosts() {
  return JSON.parse(fs.readFileSync('./data/posts.json'));
}


  app.get('/posts', (req, res) => {
    const posts = blogService.getAllPosts();
    res.json(posts);
  });

  function getAllCategories() {
    return JSON.parse(fs.readFileSync('./data/categories.json'));
}

  app.get('/categories', (req, res) => {
    const posts = blogService.getAllCategories();
    res.json(posts);
  });

  app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.jpeg'));
  });
  
  module.exports = {
    getPublishedPosts,
    getAllPosts,
    getAllCategories
};



// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);