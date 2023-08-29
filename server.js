
const bodyParser = require("body-parser");

const Sequelize = require("sequelize");
const pg = require("pg");
const exphbs = require("express-handlebars");
var blogService = require("./blog-service.js");
var categories = require("./data/categories.json");

var path = require("path");
var express = require("express");
const stripJs = require("strip-js");


var app = express();

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const upload = multer(); 

var HTTP_PORT = process.env.PORT || 8080;

app.engine(".hbs",
    exphbs.engine({ extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return ( "<li" + (url == app.locals.activeRoute ? ' class="active" ' : "") + '><a href="' +
          url + '">' + options.fn(this) + "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
      console: function (context) {
        return console.log(context);
      },
    },
  })
);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", ".hbs");

// Cloudinary configuration 
cloudinary.config({
  cloud_name: "dniwkexwk",
  api_key: "346384146174639",
  api_secret: "iNGot5Ot2LW8tYJfbjo_X_zA3KI",
  secure: true,
});

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    route == "/" ? "/" : "/" + route.replace(/\/(.*)/, "");
  app.locals.viewingCategory = req.query.category;
  next();
});

// redirect '/' path to /blog path
app.get("/", (req, res) => {
  res.redirect("/blog");
});

// render abput.hbs at /about route
app.get("/about", (req, res) => {
  res.render(path.join(__dirname, "/views/about.hbs"));
});

// '/blog' route
app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
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
      let categories = await blogService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})

});


// "/posts" route 
app.get("/posts", (req, res) => {
  if (req.query.category) {
    blogService
      .getPostsByCategory(req.query.category)
      .then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch(function (err) {
        res.render("posts", { message: "no results" });
      });
  } else if (req.query.minDate) {
    blogService
      .getPostsByMinDate(req.query.minDate)
      .then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch(function (err) {
        res.render("posts", { message: "no results" });
      });
  } else {
    blogService
      .getAllPosts()
      .then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }
});

// "/categories" route
app.get("/categories", (req, res) => {
  blogService
    .getCategories()
    .then((data) => {
      if (data.length > 0) {
        res.render("categories", { categories: data });
      } else {
        res.render("categories", { message: "no results" });
      }
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});


// "/blog/:id" route
app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the post by "id"
      viewData.post = await blogService.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
      
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
});

// "/posts/add" route to add posts
app.get("/posts/add", (req, res) => {
  blogService
    .getCategories()
    .then((data) => res.render("addPost", { categories: data }))
    .catch((err) => {
      res.render("addPost", { categories: [] });
    });
});

app.use(express.static("public"));

// "/post/:id" route 
app.get("/post/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  blogService
    .getPostById(postId)
    .then((data) => {
      res.render("post", { post: data });
    })
    .catch((err) => {
      res.render("post", { message: "no results" });
    });
});

// "/posts/:categories" route
app.get("/posts/:category", (req, res) => {
  blogService
    .getAllPosts()
    .then((data) => {
      return res.json({ data });
    })
    .catch((err) => {
      return { message: err.message };
    });
});

// "posts add" route to post new added posts
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
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
    processPost("");
  }
  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;
    blogService.addPost(req.body).then(res.redirect("/posts"))
      .catch((err) => {
        res.json({ message: err });
      });
  }
});

blogService.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Server listening on port" + HTTP_PORT);
    });
  }).catch((error) => {
    console.error(`Error initializing the blog-service module: ${error}`);
  });

app.use(function (req, res, next) {
  res.status(404);
  res.render("404", {
    title: "Error : 404 Not Found - Sorry :(",
  });
});

app.get("*", (req, res) => {
  res.status(404);
  res.render("404", {
    title: "Error: 404 Not Found - Sorry :(",
  });
});
