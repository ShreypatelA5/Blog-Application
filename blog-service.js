const fs = require("fs");
const Sequelize = require("sequelize");
const { resolve } = require("path");

let posts = [];
let categories = [];


// blog-service Initialization
function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", "utf8", (err, data) => {
      if (err) {
        return reject("unable to read file");
      }
      posts = JSON.parse(data);
      fs.readFile("./data/categories.json", "utf8", (err, data) => {
        if (err) {
          return reject("unable to read file");
        }
        categories = JSON.parse(data);
        resolve();
      });
    });
  });
}

// Get all posts function
function getAllPosts() {
  return new Promise((resolve, reject) => {
    if (posts.length === 0) {
      return reject("no results returned");
    }
    resolve(posts);
  });
}

function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter((post) => post.category == category);
    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("no results returned");
    }
  });
}

// get posts by minimum date function
function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(
      (post) => new Date(post.postDate) >= new Date(minDateStr)
    );
    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("no results returned");
    }
  });
}

// get posts by Identity Number function
function getPostById(id) {
  return new Promise((resolve, reject) => {
    const foundPost = posts.find((post) => post.id == id);
    if (foundPost) {
      resolve(foundPost);
    } else {
      reject("no result returned");
    }
  });
}

// Add new post function
function addPost(postData) {
  return new Promise((resolve, reject) => {
    //postData.published = (postData.published) ? true : false;
    postData.published = Boolean(postData.published);
    postData.id = posts.length + 1;
    const date = new Date();
    const formattedDate =
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    postData.postDate = formattedDate;
    posts.push(postData);
    resolve(postData).catch(reject("unable to create post"));
  });
}

// get published posts by category function
function getPublishedPostsByCategory(mCategory) {
  return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter(
      (post) => post.published == true && post.category == mCategory
    );
    if (publishedPosts.length > 0) {
      resolve(publishedPosts);
    } else {
      reject("no results returned");
    }
  });
}

// get published posts function
function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter((post) => post.published === true);
    if (publishedPosts.length === 0) {
      return reject("no results returned");
    }
    resolve(publishedPosts);
  });
}

// get categories function
function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length == 0) {
      return reject("no results returned");
    }
    resolve(categories);
  });
}

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  getPublishedPostsByCategory,
};
