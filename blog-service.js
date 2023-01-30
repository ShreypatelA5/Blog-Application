//Retun JSON format to BLOG
const fs = require('fs');

const getPublishedPosts = () => {
const filePath = './data/posts.json';
if (fs.existsSync(filePath)) {
