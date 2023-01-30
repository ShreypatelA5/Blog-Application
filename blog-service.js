const fs = require('fs');

const getPublishedPosts = () => {
const rawData = fs.readFileSync('.data/posts.json');
const posts = JSON.parse(rawData);
const publishedPosts = posts.filter(post => post.published === true);
return publishedPosts;
};

module.exports = {
getPublishedPosts,
};