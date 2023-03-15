const fs = require("fs");

const { resolve } = require("path");

let posts = [];
let categories = [];


// Intitalization function
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

// getAllPosts() function
function getAllPosts() {
  return new Promise((resolve, reject) => {
    if (posts.length === 0) {
      return reject("no results returned");
    }
    resolve(posts);
  });
}

//Return JSON format to Categories
function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(post => post.category === category);
    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } 
    else {
      reject('no results returned');
    }
  });
}

// get posts by categories function
function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(post => new Date(post.postDate) >= new Date(minDateStr));
    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } 
    else {
      reject('no results returned');
    }
  });
}


// getPostById(postId) function
function getPostById(id) {
  return new Promise((resolve, reject) => {
    const foundPost = posts.find(post => post.id === id);
    if (foundPost) {
      resolve(foundPost);
    } 
    else {
      reject('no result returned');
    }
  });
}


// addPost function
function addPost (postData) {
  return new Promise((resolve,reject)=> {
    //postData.published = (postData.published) ? true : false;
    postData.published = Boolean(postData.published);
    postData.id = posts.length + 1;
    posts.push(postData);
    resolve(postData).catch(reject('unable to create post'));
  })
}

// getPublishedPosts() function
function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter(post => post.published === true);
    if (publishedPosts.length === 0) {
      return reject("no results returned");
    }
    resolve(publishedPosts);
  });
}

 // getCategories() function
function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
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
  getPostById 
};