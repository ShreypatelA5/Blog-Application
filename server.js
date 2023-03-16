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
const exphbs = require('express-handlebars');
const handlebars = require('express-handlebars');
var categories = require("./data/categories.json")
var posts = require("./data/posts.json")

const blogData = require("./blog-service");

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

const stripJs = require('strip-js');

// Set up handlebars engine
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));


// Set 'view engine' to use handlebrs
app.set('view engine', '.hbs');

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

// To fix "active" item in navigation bar
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, "")); app.locals.viewingCategory = req.query.category;
  next();
  });
 
  // helper custom handlebars
  app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function navLink(url, options) {
            return '<li' + ((url == app.locals.activeRoute) ? ' class="active"' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function equal(lvalue, rvalue, options) {
            if (arguments.length < 3) {
                throw new Error("Handlebars Helper equal needs 2 parameters");
            }
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context) {
            return stripJs(context);
        }
    }
}));

// get blog
app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogData.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogData.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})

});

// get posts with different arguments 
app.get("/posts", async (req, res) => {
  const category = req.query.category;
  if (category) {
    try {
      const posts = await blogService.getPostsByCategory(parseInt(category));
      res.render("posts", { posts: posts });
    } catch (error) {
      res.render("posts", { message: "no results" });
    }
  } else if (req.query.minDate) {
    try {
      const posts = await blogService.getPostsByMinDate(req.query.minDate);
      if (posts.length > 0) {
        res.render("posts", { posts: posts });
      } else {
        res.render("posts", { message: "no results" });
      }
    } catch (error) {
      res.render("posts", { message: "no results" });
    }
  } else {
    try {
      const posts = await blogService.getAllPosts();
      res.render("posts", { posts: posts });
    } catch (error) {
      res.render("posts", { message: "no results" });
    }
  }
});


// get categories 
app.get("/categories", (req, res) => {
  blogService.getCategories()
    .then((data) => {
      res.render("categories", { categories: data });
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
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
app.get("/about", function(req, res) {
  res.render("about");
});

 // adding route to support addPost.hbs
 app.get("/posts/add", (req, res) => {
  res.render("addPost"); // assuming "addPost.hbs" is located in the "views" directory
});

