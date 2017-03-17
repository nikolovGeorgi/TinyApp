const dotenv = require('dotenv').config();  //hide important files
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const generateRandomString = require('./lib/generateShortUrl');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');


const app = express();
const port = process.env.PORT;

// ---------------------------- dataBases ---------------------------- //
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// const users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk"
//   }
// }
const userDB = {
  'gnikolov@sfu.ca': {
    name: 'Georgi Nikolov',
    email: 'gnikolov@sfu.ca',
    password: '123a'
  }
}
let timesVisited = 0;
// ---------------------------- Configuration ---------------------------- //
app.set('view engine', 'ejs');
app.locals.title = "TinyApp";

// ---------------------------- Middlewares ---------------------------- //
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// ---------------------------- Custom Middleware ---------------------------- //
app.use((req, res, next) => {
  // console.log('Custom User Middleware Session', req.session);
  // Find a user from the cookies
  // const user = userDB[req.cookies.email]; // Cookie Version
  const user = userDB[req.session.email]; // Session Version
  // If the user is found, add it to the request
  if (user) {
    req.user = user;
  }
  next();
});
function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}
// ---------------------------- Main Page ---------------------------- //

// ------------------ TO DO ---------------------------
//  if loged in -> direct to /urls
// ----------------------------------------------------
app.get('/', (req, res) => {
  const user = userDB[req.session.email];
  console.log(req.user);
  if (user){
    res.render('pages/index', {user: req.user});
    // res.render('pages/index', urlDatabase);
  } else {
    res.redirect('/login');
  };
});

//if at somepoint i need to redirect back to the main page
// app.post('/', (req, res) => {
//   res.redirect()
// });

// ---------------------------- Login Page ---------------------------- //
// ------------------ TO DO ---------------------------
// if loged > redirect '/'
// if not loged > form email + pass > submit button > post/login
// ----------------------------------------------------
app.get('/login', (req, res) => {
  res.render('login');
});
// ------------------ TO DO ---------------------------
//  if email & pass params match an existing user > set cookie & redirect > '/'
// if they dont match > err 401
// ----------------------------------------------------
app.post('/login', (req, res) => {
  //check emailo and pass be true!
  // Check to see if there is a user with the body email
    const user = userDB[req.body.email];
    console.log(user, "user");
    console.log("------------------------");
    console.log(user.name, "user.name");
    console.log(user.email, "user.email");
    console.log(user.password, "user.pass");
    console.log("------------------------");
    console.log(req.body.email, " user.email");
    console.log(req.body.password, " user.pass");
    // if(req.user.email && req.user.password){
    // Check to see if that user has the body password
    if(user && (user.password === req.body.password)){
      // If so, login, set email cookie, and redirect

      // res.cookie('email', req.body.email); // Cookie Version
      req.session.email = req.body.email; // Session Version
      //------------------------------------------
      //change redirection to user home page
      //------------------------------------------
      // console.log(user, " Is User");
      // console.log(user.password, " Is user pass");
      // console.log(req.body.password, " is req.body pass");
      // console.log(req.session.email, " is req.session email");
      // console.log(req.body.email, " is req.body email");
      res.redirect('/');
    } else {
      // If not, send status 403 and show 403
      res.status(403).render('403');
    }
  // } else {
  //   res.redirect('/');
  // };
});

//------------------------------
//Skipped Part here!!!!       ||
// ---------------------------- Register Page ---------------------------- //
// ------------------ TO DO ---------------------------
//  if loged redirect > '/'
//  if not loged > register form > post /register
//
// ----------------------------------------------------
app.get('/register', (req, res) => {
  res.render('register');
});

//Need to add the new user to the database

//SAVE the user information through checks!
// ------------------ TO DO ---------------------------
//  if email or pass is empty > 400
//  if email exists > 400
//  if all well -> create user & encrypt pass with bcrypt
// set cookie & redirect > '/'
// ----------------------------------------------------
app.post('/register', (req, res) => {
  //check email and pass be true!
  //if user email exists -> redirect them to home page
  if (req.body.email && req.body.password){
    for (let i in userDB){
    // if valid inputs make a user check
      const user = userDB[i];
      if (req.body.email === user.email){
        res.redirect('/');
      };
    };
    userDB[`${req.body.email}`] = {
      name: req.body.email,
      email: req.body.email,
      password: req.body.password
    };
    // res.redirect('/login');
    // If so, login, set email cookie, and redirect

    // login = true?
    console.log(userDB);
    // res.cookie('email', req.body.email); // Cookie Version
    req.session.email = req.body.email; // Session Version
  } else {
    res.status(403).render('403');
  }
  res.redirect('/');
});

// ---------------------------- User Home Page ---------------------------- //
// app.get('/urls/:id', (req, res)=> {
//   const timesVisited =  Number(req.cookies.timesVisited) || 0
//   res.cookie('timesVisited', timesVisited + 1);
// });

// ------------------ TO DO ---------------------------
//if user not loged > 401 + link to /login
//if user loged in > 200 + site header
// link to create a new short link > urls/new
// ----------------------------------------------------
app.get('/urls', (req, res) => {
  const user = userDB[req.session.email];
  if (user){
    res.render('urls_index', {urlDatabase});
  } else {
    res.redirect('/login');
  }
});
// post is at the wrong place ?
// do i send post request from /urls or to /urls/:id
// or is it to /urls then i generate a new shortUrl
// set its value to the new Long urls
// and then redirect to the new short url by app.get('/urls/:id').

// ------------------ TO DO ---------------------------
// if user loged > generate short url and save to that user
// redirect > urls/:id
// if not loged > 401 + link to /login
// ----------------------------------------------------
app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longUrl;
  res.redirect("/urls/" + shortUrl);
});

// ---------------------------- URL to Short URL ---------------------------- //
//GIT check in urls_id vs user_home -> checked

// ------------------ TO DO ---------------------------
//  if url w/ :id does NOT exist > 404
// if user not loged > 401 + link to /login
// if user loged but url does not belong > 403
// if all well > 200 + short url, date, visits, longUrl +
// update button >post/urls/:id
// delete button > post/urls/:id/delete
// ----------------------------------------------------
app.get('/urls/:id', (req, res) => {
  // in user specific will have to change if statements
  const user = userDB[req.session.email];
  console.log(user);
  if (user){
    // if (req.params.id){
      const shortUrl = req.params.id;
      const longUrl = urlDatabase[shortUrl];
      res.render("urls_id", {shortUrl, longUrl});
    // } else {
      // res.status(404).render('404');
    // };
  } else {
    // choose one
    res.status(401).render('401');
    res.redirect('/login');
  };
});
// ------------------ TO DO ---------------------------
// if url :id does NOT exist > 404
// if not loged > 401 + link to /login
// if user does not match url owner > err 403
// if all well > update url > redirect /urls:id
// ----------------------------------------------------
app.post('/urls/:id', (req, res) => {
  const user = userDB[req.session.email];
  if (user) {
    // if (req.params.id){
      const editUrl = req.body.editUrl; //longUrl
      urlDatabase[req.params.id] = editUrl;
      // const timesVisited =  Number(req.cookies.timesVisited) || 0
      // res.cookie('timesVisited', timesVisited + 1);

    // } else {
    //   res.status(404).render('404');
    // };
  } else {
    res.redirect('/login');
  }
  res.redirect('/urls/' + req.params.id);
});

// ---------------------------- Short URL Redirection ---------------------------- //
// ------------------ TO DO ---------------------------
//  if id exists > redirect to longurl
// if not > err 404
// ----------------------------------------------------
// app.get('/r/:id', (req, res){
  // for (var i in db){
  //   longurl = db[i][req.params.id];
  // }
  // shorturl = req.params.id
// });
// ---------------------------- New Short URL ---------------------------- //
//git check urls_new with urls_new

// ------------------ TO DO ---------------------------
//  if not loged in > 401 + lnk to /login
// if loged > 200 + header + form [input field for original URL + submit > post/urls]
// ----------------------------------------------------
app.get("/urls/new", (req, res) => {
  const user = userDB[req.session.email];
  // console.log(user);
  if (user){
    res.render("urls_new");
  } else {
    //Unauthorized err
    res.status(401).render('401');
  };
});

// ---------------------------- Delete URLs ---------------------------- //
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// ---------------------------- Count Views ---------------------------- //

// app.get('/urls/:id', (req, res)=> {
//   const timesVisited =  Number(req.cookies.timesVisited) || 0
//   res.cookie('timesVisited', timesVisited + 1);
// });

// ---------------------------- Logout Page ---------------------------- //
app.post('/logout', (req, res) => {
  // res.clearCookie('email'); // Cookie Version
  console.log(req.session.email, "before delete");
  delete req.session.email; // Session Version
  console.log(req.session.email, "after delete");
  res.redirect('/');
});

// ---------------------------- Ports ---------------------------- //
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

// header
//  if a user is loged in > header shows :
// user email
// my links > /urls
// logout button > post /logout
//
// if not loged in :
// link to login page
// link to registration page

// how do i check which ejs page i am reading from in a particular get/post(view counts)

// redirect when user is loged in and tries to log in again
// redirect when user is loged in and tries to register
// change header when user is loged in and is in the /urls/:id page
