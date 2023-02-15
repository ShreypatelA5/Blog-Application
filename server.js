/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Shrey Patel Student ID: 158379214 Date: 1st February
*
* Cyclic Web App URL: https://distinct-veil-moth.cyclic.app
*
* GitHub Repository URL: https://github.com/ShreypatelA5/web322-app
*
********************************************************************************/


var express = require('express');
var app = express();
var path = require('path');
const blogService = require('./blog-service');
const fs = require('fs');

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const upload = multer();
let posts = [];

cloudinary.config({
  cloud_name: 'dniwkexwk',
  api_key: '346384146174639',
  api_secret: 'iNGot5Ot2LW8tYJfbjo_X_zA3KI',
  secure: true
});

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

// this function redirect the user to the about page
app.get("/about", function (req, res) {
  res.sendFile(__dirname + "/views/about.html");
});

//This function redirect the user to the blog page
app.get('/blog', (req, res) => {
  const publishedPosts = blogService.getPublishedPosts();
  res.json(publishedPosts);
  });

  //This function redirect the user to the posts page
  
  //This function redirect the user to the categories page
  app.get('/categories', (req, res) => {
    const posts = blogService.getAllCategories();
    res.json(posts);
  });


// Make call to the service and fetch data to be returned to the client
app.get('/blog', (req, res) => {
  blogService.getCategories()
    .then((data) => {
      res.json({blogs: data});
    })
    .catch((err) => {
      res.status(500).json({message: err});
    });
});

// Make call to the service and fetch data to be returned to the client
app.get('/posts', async (req, res) => {
  const category = req.query.category;
  const minDate = req.query.minDate;

  if (category) {
    try {
      const posts = await blogService.getPostsByCategory(parseInt(category));
      res.json(posts);
    } catch (error) {
      res.status(404).send(error);
    }
  } else if (minDate) {
    try {
      const posts = await blogService.getPostsByMinDate(minDate);
      res.json(posts);
    } catch (error) {
      res.status(404).send(error);
    }
  } else {
    const posts = blogService.getAllPosts();
    res.json(posts);
  }
});


// Make call to the service and fetch data to be returned to the client
app.get('/categories', (req, res) => {
  blogService.getCategories()
    .then((data) => {
      res.json({categories: data});
    })
    .catch((err) => {
      res.status(500).json({message: err});
    });
});

app.use(express.static(path.join(__dirname, 'public')));

// adding route to support addPost.html
app.get('/posts/add', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/addPost.html'));
});

app.post('/posts/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }
    upload(req).then((uploaded) => {
      processPost(uploaded.url);
    });
  } else {
    processPost('');
  }

  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;

    const published = req.body.published !== undefined;

  // Create a new blog post object
  const newPost = {
    id: posts.length + 1,
    title: req.body.title,
    content: req.body.content,
    published: published,
    featureImage: imageUrl
  };

  // Add the new post to the array of posts
  posts.push(newPost);

  // Redirect to the /posts route
  res.redirect('/posts');
  }
});

app.get('/post/:id', async (req, res) => {
  const postId = parseInt(req.params.id);
  try {
    const post = await blogService.getPostById(postId);
    res.json(post);
  } catch (error) {
    res.status(404).send('Post not found');
  }
});


 // This function called when no any matching route found in URL
 app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, '/views/vecteezy_404-landing-page_6549647.jpg'));
});

//Initialize the blog service 
blogService.initialize()
.then(() => {
  // Start the server if the initialize() method is successful
  app.listen(HTTP_PORT, () => {
    console.log("Server started on port" + HTTP_PORT);
  });
})
.catch(err => {
  // Output an error message if the initialize() method returns a
  console.error("Unable to start the server:", err);
});
