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

const userDB = {
  'gnikolov@sfu.ca': {
    name: 'Georgi Nikolov',
    email: 'gnikolov@sfu.ca',
    password: '123a'
  }
}

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

// ---------------------------- Main Page ---------------------------- //
app.get('/', (req, res) => {
  const user = userDB[req.session.email];
  // console.log(req.user);
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
app.get('/login', (req, res) => {
  res.render('login');
});

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
app.get('/register', (req, res) => {
  res.render('register');
});

//Need to add the new user to the database

//SAVE the user information through checks!
app.post('/register', (req, res) => {
  //check email and pass be true!
  //if user email exists -> redirect them to home page
  if (req.body.email && req.body.password){
    for (let i in userDB){
      const user = userDB[i];
      if (user.email === req.body.email){
        res.redirect('/');
      };
    };
    userDB[`${req.body.email}`] = {
      // req.body.name: req.body.name, // change this
      email: req.body.email,
      password: req.body.password
    };
    res.redirect('/login');
    // Check to see if there is a user with the body email
    // const user = userDB[req.body.email];
    // Check to see if that user has the body password
    if(user && user.password === req.body.password){
      // If so, login, set email cookie, and redirect
      // res.cookie('email', req.body.email); // Cookie Version
      req.session.email = req.body.email; // Session Version
      //------------------------------------------
      //change redirection to user home page
      //------------------------------------------
      res.redirect('/urls');
    } else {
      // If not, send status 403 and show 403
      res.status(403).render('403');
    }
  }
  // add user to the db when added
});

// ---------------------------- User Home Page ---------------------------- //
//not sure where app get should be
app.get('/urls', (req, res) => {
  const user = userDB[req.body.email];
  if (user){
    res.render('user_home');
  } else {
    res.redirect('/login');
  };
});
// post is at the wrong place ?
// do i send post request from /urls or to /urls/:id
// or is it to /urls then i generate a new shortUrl
// set its value to the new Long urls
// and then redirect to the new short url by app.get('/urls/:id')
app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longUrl;
  res.redirect("/urls/" + shortUrl);
});

// ---------------------------- URL to Short URL ---------------------------- //
app.get('/urls/:id', (req, res) => {
  // in user specific will have to change if statements
  const user = userDB[req.body.email];
  if (user){
    if (req.params.id){
      const shortUrl = req.params.id;
      const longUrl = urlDatabase[shortUrl];
      res.render("user_home", {shortUrl, longUrl});
    } else {
      res.status(404).render('404');
    };
  } else {
    // choose one
    res.status(401).render('401');
    res.redirect('/login');
  };
});

app.post('/urls/:id', (req, res) => {
  const user = userDB[req.body.email];
  if (user) {
    if (req.params.id){
      const editUrl = req.body.editUrl; //longUrl
      urlDatabase[req.params.id] = editUrl
      res.redirect('/urls/' + req.params.id);
    } else {
      res.status(404).render('404');
    };
  } else {
    res.redirect('/login');
  }
});
// ---------------------------- New Short URL ---------------------------- //
app.get("/urls/new", (req, res) => {
  const user = userDB[req.body.email];
  if (user){
    res.render("urls_new");
  } else {
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
