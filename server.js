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


var express = require("express");
var app = express();
var path = require("path");
const blogService = require('./blog-service');
const fs = require('fs');

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

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
  app.get('/posts', (req, res) => {
    const posts = blogService.getAllPosts();
    res.json(posts);
  });

  //This function redirect the user to the categories page
  app.get('/categories', (req, res) => {
    const posts = blogService.getAllCategories();
    res.json(posts);
  });

  // This function called when no any matching route found in URL
  app.use((req, res, next) => {
    res.status(404).sendFile(__dirname + "/views/vecteezy_404-landing-page_6549647.jpg");
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
app.get("/posts", (req, res) => {
  const category = req.query.category;
  const minDate = req.query.minDate;
  if (category) {
    blogService.getPostsByCategory(category).then(posts => {
      res.json(posts);
    });
  } else if (minDate) {
    blogService.getPostsByMinDate(minDate).then(posts => {
      res.json(posts);
    });
  } else {
    blogService.getPosts().then(posts => {
      res.json(posts);
    });
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


// adding route to support addPost.html
app.get('/posts/add', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/addPost.html'));
})

const upload = multer(); // no { storage: storage } since we are not using disk storage

cloudinary.config({
  cloud_name: 'dniwkexwk',
  api_key: '346384146174639', 
  api_secret: 'iNGot5Ot2LW8tYJfbjo_X_zA3KI',
   secure: true
});


app.post('/post/add', upload.single('featureImage'), (req, res) => {
  let imageUrl = '';
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }
    upload(req).then((uploaded) => {
      imageUrl = uploaded.url;
      processPost(imageUrl);
    });
  } else {
    processPost(imageUrl);
  }

  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;
    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
  }
});

// To correctly add the new blog post before redirecting the user 
app.post('/posts/add', (req, res) => {
  const postData = req.body;
  blogService
    .addPost(postData)
    .then(post => {
      res.redirect('/posts');
    })
    .catch(error => {
      // handle error
    });
});

// 
app.use(express.json());

app.get('/posts', (req, res) => {
  if (category) {
    // Return all posts with the specified category
    blogService.getPostsByCategory(category)
      .then((posts) => {
        res.send(posts);
      })
      .catch((error) => {
        res.status(500).send({ error: error });
      });
  } else if (minDate) {
    // Return all posts with postDate equal or greater than minDate
    blogService.getPostsByMinDate(minDate)
      .then((posts) => {
        res.send(posts);
      })
      .catch((error) => {
        res.status(500).send({ error: error });
      });
  } else {
    // Return all posts without any filter
    blogService.getPosts()
      .then((posts) => {
        res.send(posts);
      })
      .catch((error) => {
        res.status(500).send({ error: error });
      });
  }
});

// "/post/value" route
app.get('/post/:id', (req, res) => {
  const postId = req.params.id;
  const post = blogService.getPostById(postId);

  if (!post) {
    return res.status(404).send({ error: 'Post not found' });
  }

  return res.send({ post });
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

