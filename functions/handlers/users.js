const { uuid } = require("uuidv4");
const firebase = require("firebase");
const { 
    validateSignupData,
    validateLoginData,
    reduceUserDetails,
} = require("../util/validators");

admin.initializeApp();
const db = admin.firestore();

firebase.initializeApp({
    apiKey: "AIzaSyD43v871x3P67UF41QR6lRU2vXXYVKQwm0",
    authDomain: "social-backend-3c9e5.firebaseapp.com",
    databaseURL: "https://social-backend-3c9e5.firebaseio.com",
    projectId: "social-backend-3c9e5",
    storageBucket: "social-backend-3c9e5.appspot.com",
    messagingSenderId: "911153537270",
});

// Register new user
exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    const { valid, errors } = validateSignupData(newUser);
    if (!valid) {
        return res.status(400).json(errors);
    }

    const defaultImg = "defaultImg.png";
    let token, userId;
    db.doc(`/users/${newUser.handle}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return res.status(400).json({
                    handle: "this handle is already taken"
                });
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                //TODO Append token to imageUrl. Work around just add token from image in storage.
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/social-backend-3c9e5.appspot.com/o/${defaultImg}?alt=media`,
                userId,
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({
                token
            });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
                return res.status(400).json({
                    email: "Email is already is use"
                });
            } else {
                return res
                    .status(500)
                    .json({
                        general: "Something went wrong, please try again"
                    });
            }
        });
};

// Log in user
exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    };

    const { valid, errors } = validateLoginData(user);
    if (!valid) return res.status(400).json(errors);
    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return res.json({
                token
            });
        })
        .catch((err) => {
            console.error(err);
            return res
                .status(403)
                .json({
                    general: "Wrong credentials, please try again"
                });
        });
};

// Add user details
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);
    db.doc(`/users/${req.user.handle}`)
        .update(userDetails)
        .then(() => {
            return res.json({
                message: "Details added successfully"
            });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({
                error: err.code
            });
        });
};

// Get user's details
exports.getUserDetails = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.params.handle}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                userData.user = doc.data();
                return db
                    .collection("screams")
                    .where("userHandle", "==", req.params.handle)
                    .orderBy("createdAt", "desc")
                    .get();
            } else {
                return res.status(404).json({
                    errror: "User not found"
                });
            }
        })
        .then((data) => {
            userData.screams = [];
            data.forEach((doc) => {
                userData.screams.push({
                    body: doc.data().body,
                    createdAt: doc.data().createdAt,
                    userHandle: doc.data().userHandle,
                    userImage: doc.data().userImage,
                    likeCount: doc.data().likeCount,
                    commentCount: doc.data().commentCount,
                    screamId: doc.id,
                });
            });
            return res.json(userData);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({
                error: err.code
            });
        });
};

// Get current user details
exports.getAuthenticatedUser = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.user.handle}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                userData.credentials = doc.data();
                return db
                    .collection("likes")
                    .where("userHandle", "==", req.user.handle)
                    .get();
            }
        })
        .then((data) => {
            userData.likes = [];
            data.forEach((doc) => {
                userData.likes.push(doc.data());
            });
            return db
                .collection("notifications")
                .where("recipient", "==", req.user.handle)
                .orderBy("createdAt", "desc")
                .limit(10)
                .get();
        })
        .then((data) => {
            userData.notifications = [];
            data.forEach((doc) => {
                userData.notifications.push({
                    recipient: doc.data().recipient,
                    sender: doc.data().sender,
                    createdAt: doc.data().createdAt,
                    screamId: doc.data().screamId,
                    type: doc.data().type,
                    read: doc.data().read,
                    notificationId: doc.id,
                });
            });
            return res.json(userData);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({
                error: err.code
            });
        });
};