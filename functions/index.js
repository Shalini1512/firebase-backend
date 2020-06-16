const functions = require('firebase-functions');
const express = require('express');

const {
    signup,
    login,
    addUserDetails,
    getAuthenticatedUser,
    getUserDetails,
} = require('./handlers/users');

app.post('/signup', signup);
app.post('/login', login);
app.post('/user', addUserDetails);
app.get('/user/:handle', getUserDetails);
app.get('/user', getAuthenticatedUser);

exports.api = functions.region('europe-west1').https.onRequest(app);