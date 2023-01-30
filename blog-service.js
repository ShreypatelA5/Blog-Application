//Retun JSON format to BLOG
const fs = require('fs');

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

//Return JSON format to POSTS
function getAllPosts() {
  return JSON.parse(fs.readFileSync('./data/posts.json'));
}

function getAllCategories() {
    return JSON.parse(fs.readFileSync('./data/categories.json'));
}


let posts = [];
let categories = [];

const getPosts = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/posts.json', 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        posts = JSON.parse(data);
        resolve(posts);
      }
    });
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/categories.json', 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        categories = JSON.parse(data);
        resolve(categories);
      }
    });
  });
};

const getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
    getPosts()
      .then(posts => {
        const publishedPosts = posts.filter(post => post.published);
        resolve(publishedPosts);
      })
      .catch(err => {
        reject(err);
      });
  });
};

module.exports = {
  getPosts,
  getCategories,
  getPublishedPosts,
};
