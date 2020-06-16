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

app.post('/signup', signup);
app.post('/login', login);
app.post('/user', addUserDetails);
app.get('/user/:handle', getUserDetails);
app.get('/user', getAuthenticatedUser);
app.post('/user/image', uploadImage);

exports.api = functions.region('europe-west1').https.onRequest(app);