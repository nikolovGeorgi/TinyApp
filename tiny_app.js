// DEBUG=express:* node tiny_app.js

const dotenv = require('dotenv').config();  //hide important files
const express = require("express");
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const generateRandomString = require('./lib/generateShortUrl');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT;

// ---------------------------- dataBases ---------------------------- //
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const userDB = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
let timesVisited = 0;
// ---------------------------- Configuration ---------------------------- //
app.set('view engine', 'ejs');
app.locals.title = "TinyApp";
appTitle = app.locals.title;
// ---------------------------- Middlewares ---------------------------- //
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// ---------------------------- Custom Middleware ---------------------------- //
app.use((req, res, next) => {
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
app.get('/', (req, res) => {
  // if user is loged in > redirect to urls && if not > to the login page
  if (req.session.id){
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});
// ---------------------------- Login Page ---------------------------- //
app.get('/login', (req, res) => {
  // res.render('login');
  if (req.session.id){
    let templateVars = {
      userID: req.session.id
    }
    res.redirect('/');
  }
  res.render('login');
});
app.post('/login', (req, res) => {
  //check if the person who is trying to log-in is already in the system by email
  for (let userID in userDB){
    if ((userDB[userID].email === req.body.email) && (userDB[userID].password === req.body.password)){
      req.session.id = userDB[userID].id;
      console.log(req.session.id, "ID");
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).render('403');
});
// ---------------------------- Register Page ---------------------------- //
app.get('/register', (req, res) => {
  if (req.session.id){
    let templateVars = {
      userID: req.session.id
    }
    res.redirect('/');
    return;
  }
  // render of user_register, templateVars
  res.render('register');
});
app.post('/register', (req, res) => {
  // chec if the email & password are valid inputs
  if (req.body.email && req.body.password){
    for (let userID in userDB){
      const user = userDB[userID];
      // if the user inputs the right email & pass > direct them to urls
      if ((user.email === req.body.email) && (user.password === req.body.password)){
        res.redirect('/');
        return;
        // if the email is correct, but not the password > forbidden error
      } else if (user.email === req.body.email) {
        res.status(403).render('403');
        return;
      }
    }
    // otherwise create a new user!
    let newUserID = generateRandomString();
    userDB[`${newUserID}`] = {
      id: newUserID,
      email: req.body.email,
      password: req.body.password
    }
    req.session.id = newUserID;
    res.redirect('/');
    return;
  }
  res.status(403).render('403');
});
app.get('/urls', (req, res) => {
  if (req.session.id){
    console.log(req.session.email, " hi");
    console.log(req.session, "session");
    console.log(urlDatabase, "urlDatabase");
    var templateVars = {
      urlDatabase: urlDatabase,
      userID: req.session.id,
      userEmail: userDB[req.session.id].email
    }
    console.log(templateVars);
    res.render('./FinalPages/urls_index', templateVars);
    return;
  }
  res.redirect('/login');
});
app.post("/urls", (req, res) => {
  if (res.session.id){
    let shortUrl = generateRandomString();
    urlDatabase[shortUrl] = req.body.longUrl;
    res.redirect("/urls/" + shortUrl);
    return;
  }
  res.redirect('/login');
});
app.get('/urls/:id', (req, res) => {
  if(req.session.id){
    var templateVars = {
      urlDatabase: urlDatabase,
      userID: req.session.id,
      userEmail: req.session.email
    }
    res.render("./FinalPages/urls_show", templateVars);
    return;
  }
  res.redirect('/login');
});
app.get("/urls/new", (req, res) => {
  console.log("hi");
  console.log(req.session.id);
  if (req.session.id){
    res.render("./FinalPages/urls_new");
    return;
  }
  res.redirect('/login');
});
app.post('/urls/:id', (req, res) => {
  if(req.session.id){
    const editUrl = req.body.editUrl;
    if(!editUrl){
      res.status(404).render('404');
      return;
    }
    urlDatabase[req.params.id] = editUrl;
  } else {
    res.redirect('/login');
    return;
  }
  res.redirect('/urls/' + req.params.id);
});
app.get('/u/:id', (req, res) => {
    if (req.params.id){
      console.log(req.params.id);
      res.redirect(`${urlDatabase[req.params.id]}`);
      return;
    }
  res.status(404).render('404');
});

// ---------------------------- Delete URLs ---------------------------- //
app.post('/urls/:id/delete', (req, res) => {
  if (!req.session.id){
    res.status(404).render('404');
    return;
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  delete req.session.id;
  delete req.session.email;
  res.redirect('/login');
});
// ---------------------------- Ports ---------------------------- //
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
