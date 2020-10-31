const functions = require('firebase-functions');
const express = require('express');
app = express();

const {
    signup,
    login,
    addUserDetails,
    getAuthenticatedUser,
    getUserDetails,
    uploadImage
} = require('./handlers/users');

const {
    getAllPosts,
    postOnePost,
    getPost,
    commentOnPost,
    likePost,
    unlikePost,
    deletePost
} = require('./handlers/posts');

// user api routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user', addUserDetails);
app.get('/user/:handle', getUserDetails);
app.get('/user', getAuthenticatedUser);
app.post('/user/image', uploadImage);

//post api routes
app.get('/posts', getAllPosts);
app.post('/post', postOnePost);
app.get('/post/:postId', getPost);
app.delete('/post/:postId', deletePost);
app.get('/post/:postId/like', likePost);
app.get('/post/:postId/unlike', unlikePost);
app.post('/post/:postId/comment', commentOnPost);

exports.api = functions.region(process.env.REGION).https.onRequest(app);
