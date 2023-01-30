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

module.exports = {
   // init,
    getPosts,
    getCategories
  };
  

let posts = [];
let categories = [];

const readData = (fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(`./data/${fileName}.json`, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

const init = async () => {
  try {
    posts = await readData('posts');
    categories = await readData('categories');
  } catch (err) {
    console.error(err);
  }
};

const getPosts = () => {
  return posts;
};

const getCategories = () => {
  return categories;
};


module.exports = {
   init,
  // getPosts,
 //  getCategories
 };
