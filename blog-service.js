const fs = require('fs');

// Getting all the publised post which are TRUE
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

//Return JSON format to Categories
function getAllCategories() {
    return JSON.parse(fs.readFileSync('./data/categories.json'));
}

// Global post and categories array type variable 
let posts = [];
let categories = [];

// The function is designed to wor with the both posts and categories datasets.
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

// Initialize() function
const initialize = () => {
return new Promise((resolve, reject) => {
fs.readFile("./data/posts.json", "utf8", (err, data) => {
if (err) {
reject("Unable to read posts file");
}
posts = JSON.parse(data);
fs.readFile("./data/categories.json", "utf8", (err, data) => {
if (err) {
reject("Unable to read categories file");
}
categories = JSON.parse(data);
resolve();
});
});
});
};

// getAllPosts() function
const getsAllPosts = () => {
  return new Promise((resolve, reject) => {
  if (posts.length === 0) {
  reject("No results returned");
  } else {
  resolve(posts);
  }
  });
  };

// getPublishedPosts() function
  const getPublishPosts = () => {
    return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter(post => post.published === true);
    if (publishedPosts.length === 0) {
    reject("No results returned");
    } else {
    resolve(publishedPosts);
    }
    });
    };

    // getCategories() function
    const getCategories = () => {
      return new Promise((resolve, reject) => {
      if (categories.length === 0) {
      reject("No results returned");
      } else {
      resolve(categories);
      }
      });
      };


      const post_s = [
        // existing posts
      ];
      
      function addPost(postData) {
        return new Promise((resolve, reject) => {
          if (postData.published === undefined) {
            postData.published = false;
          } else {
            postData.published = true;
          }
          postData.id = post_s.length + 1;
          post_s.push(postData);
          resolve(postData);
        });
      }

      // Function to get all posts by category
      const getPostsByCategory = (category) => {
        return new Promise((resolve, reject) => {
          const filteredPosts = posts.filter(post => post.category === category);
          if (filteredPosts.length > 0) {
            resolve(filteredPosts);
          } else {
            reject("no results returned");
          }
        });
      };
      
      // Function to get all posts by minimum date
      const getPostsByMinDate = (minDateStr) => {
        return new Promise((resolve, reject) => {
          const filteredPosts = posts.filter(post => new Date(post.postDate) >= new Date(minDateStr));
          if (filteredPosts.length > 0) {
            resolve(filteredPosts);
          } else {
            reject("no results returned");
          }
        });
      };
      
      // Function to get a single post by id
      const getPostById = (id) => {
        return new Promise((resolve, reject) => {
          const post = posts.find(post => post.id === id);
          if (post) {
            resolve(post);
          } else {
            reject("no result returned");
          }
        });
      };
      


module.exports = {
  getAllPosts,
  getAllCategories,
  getPublishedPosts,
  initialize,
  getsAllPosts,
  getPublishPosts,
  getCategories,
  addPost: addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById
};
