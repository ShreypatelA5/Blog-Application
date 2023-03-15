/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Shrey Patel Student ID: 158379214 Date: 15th February
*
* Cyclic Web App URL: https://distinct-veil-moth.cyclic.app
*
* GitHub Repository URL: https://github.com/ShreypatelA5/web322-app
*
********************************************************************************/
var express = require("express");
var app = express();
var path = require("path");
var blogService = require("./blog-service.js");

var categories = require("./data/categories.json")
var posts = require("./data/posts.json")

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

// no { storage: storage }
const upload = multer(); 

var HTTP_PORT = process.env.PORT || 8080;

blogService.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Server listening on port" + HTTP_PORT);
    });
  })
  .catch((error) => {
    console.error(`Error initializing the blog-service module: ${error}`);
  });


cloudinary.config({
  cloud_name: 'dniwkexwk',
  api_key: '346384146174639',
  api_secret: 'iNGot5Ot2LW8tYJfbjo_X_zA3KI',
  secure: true
});
 
// get blog
app.get("/blog", (req, res) => {
  const publishedPosts = posts.filter(post => post.published === true);
  //res.json(publishedPosts);
  blogService.getPublishedPosts()
  .then((data) => {
    res.json(data);
  })
  .catch((err) => {
    res.status(404).json({ error: err });
  });
});

// get posts with different arguments 
app.get("/posts", async (req, res) => {
  const category = req.query.category;
  if (category) {
    try {
      const posts = await blogService.getPostsByCategory(parseInt(category));
      res.json(posts);
    } catch (error) {
      res.status(404).send(error);
    }
   } else if(req.query.minDate){
      blogService.getPostsByMinDate(req.query.minDate)
      .then((data)=>{
          if(data.length > 0){
            res.json(data);
          }
          else{
            res.status(404).json({ message: "no results" });
          }
      })
      .catch(function(err){
        res.status(404).json({ message: "no results" });
      })
  }
  else
  {  
  blogService.getAllPosts()
  .then((data) => {
    res.json(data);
  })
  .catch((err) => {
    res.json({ message: err });
  });
  }
});


// get categories 
app.get("/categories", (req, res) => {
  //res.json(categories);
  blogService.getCategories()
  .then((data) => {
    res.json(data);
  })
  .catch((err) => {
    res.json({ message: err });
  });
});

 // adding route to support addPost.html
app.get("/posts/add",(req,res) => {
  res.sendFile(path.join(__dirname,"/views/addPost.html"))
});

app.use(express.static('public'));

app.get("/", function(req,res){
  res.redirect("/about");
});

// adding the "Post" route
app.post("/posts/add",upload.single("featureImage"),(req,res)=>{
  if(req.file){
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
    upload(req).then((uploaded)=>{
    processPost(uploaded.url);
    });
   }else{
    processPost("");
   }
   function processPost(imageUrl)
   {
    req.body.featureImage = imageUrl;
    
    blogService.addPost(req.body)
        .then(res.redirect('/posts'))
        .catch((err)=>
        {
            res.json({message: err});
        });
   } 
  });

  // create post ID route
  app.get('/post/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    blogService.getPostById(postId)
      .then((post) => {
        res.json(post);
      })
      .catch((err) => {
        res.status(404).json({ error: err });
      });
  });

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
  });


  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname,"/views/error.html"));
  });
