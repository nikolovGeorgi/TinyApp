const dotenv = require('dotenv').config();  //hide important files
const express = require('express');
const bodyParser = require('body-parser');
const generateRandomString = require('./lib/generateShortUrl');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT;

// ---------------------------- dataBases ---------------------------- //
const urlDatabase = [
  {'b2xVn2': 'http://www.lighthouselabs.ca', 'userID': 'userRandomID'},
  {'9sm5xK': 'http://www.google.com', 'userID': 'userRandomID'}
];
const userDB = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
 'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
}
let timesVisited = 0;
// ---------------------------- Configuration ---------------------------- //
app.set('view engine', 'ejs');
app.locals.title = 'TinyApp';
appTitle = app.locals.title;
// ---------------------------- Middlewares ---------------------------- //
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
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
      userID: req.session.id,
    }
    res.redirect('/');
    return;
  }
  res.render('login');
});
app.post('/login', (req, res) => {
  //check if the person who is trying to log-in is already in the system by email
  for (let userID in userDB){
    if ((userDB[userID].email === req.body.email) && (userDB[userID].password === req.body.password)){
      req.session.id = userDB[userID].id;
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).render('403');
});
// ---------------------------- Register Page ---------------------------- //
app.get('/register', (req, res) => {
  // if (req.session.id){
  //   let templateVars = {
  //     userID: req.session.id
  //   }
  //   res.redirect('/');
  //   return;
  // }
  res.render('register');
});
app.post('/register', (req, res) => {
  // chec if the email & password are valid inputs
  if (req.body.email && req.body.password){
    for (let userID in userDB){
      const user = userDB[userID];
      // if the user inputs the right email & pass > direct them to urls
      if ((user.email === req.body.email) && (user.password === req.body.password)){
        res.redirect('/login');
        // console.log("redirecting to login----------------------------------------");
        return;
        // if the email is correct, but not the password > forbidden error
      } else if (user.email === req.body.email) {
        res.status(403).render('403');
        // console.log("$$$$$$$$$$$$$$ ERRR 403   $$$$$$$$$$$$$$$");
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
    // console.log("redirecting to / ----------------------------------------");
    return;
  }
  res.status(403).render('403');
  // console.log("$$$$$$$$$$$$$$ ERRR 403 BOTTOM  $$$$$$$$$$$$$$$");
});

app.get('/urls', (req, res) => {
  // console.log(userDB, "USER DB IN get / URLS");
  let currentUser = userDB[req.session.id];
  if (!currentUser){
    //TODO not according to requirements > fix
    return res.redirect('/register');
  }
  var templateVars = {
    urlDatabase: urlDatabase,
    userID: req.session.id,
    userEmail: userDB[req.session.id].email
  }
  res.render('./FinalPages/urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  let currentUser = userDB[req.session.id];
  if (!currentUser){
    //TODO not according to requirements > fix
    return res.redirect('/login');
  }
  // if (req.session.id){
    // console.log(userDB[req.session.id].id);
    let shortUrl = generateRandomString();  //shortUrl
    urlDatabase[shortUrl] = req.body.longUrl; // longUrl
    longUrl = req.body.longUrl;
    var newURL = {};
    newURL[shortUrl] = longUrl;
    newURL['userID'] = currentUser.id;

    // console.log(newURL, " ------------- newURL");
    urlDatabase.push(newURL);
    // console.log('--------urlDatabase.push(newURL);----------');
    // console.log(urlDatabase);
    // console.log('--------urlDatabase.push(newURL);----');
    // console.log(urlDatabase[shortUrl], "------------urlDatabase.shortul");
    res.redirect('/urls/' + shortUrl);
    return;
  // }
  // res.redirect('/login');
});

app.get('/urls/new', (req, res) => {
  // console.log("------------------------------------------");
  // console.log(userDB[req.session.id].id); // email
  // console.log("------------------------------------------");
  let currentUser = userDB[req.session.id];
  if (!currentUser){
    //TODO not according to requirements > fix
    return res.redirect('/login');
  }
  var templateVars = {
    urlDatabase: urlDatabase,
    userID: req.session.id,
    userEmail: userDB[req.session.id].email
  }
  // console.log(templateVars.urlDatabase, "---------templateVars.urlDatabase");
  res.render('./FinalPages/urls_new', templateVars);
  return;

  // res.redirect('/login');
});
app.post('/logout', (req, res) => {
  delete req.session.id;
  delete req.session.email;
  res.redirect('/login');
});
app.get('/urls/:id', (req, res) => {
  // console.log('---------------------------------------');
  if(req.session.id){
    var templateVars = {
      urlDatabase: urlDatabase,
      userID: req.session.id,
      userEmail: userDB[req.session.id].email
    }
    let newURL = req.params.id;
    let tempLongUrl = urlDatabase[newURL];
    let currentUser = userDB[req.session.id].id;

    // console.log(urlDatabase, "in SLOWWWWW");
    // console.log(urlDatabase.req.params);
    // console.log(userDB[req.session.id].id, "currentUser----------");
    // console.log(urlDatabase[newURL], "urlDatabase[req.params]"); // longUrl
    // console.log('_______________ AFTER');
    // console.log(newURL);                                    //short url
    // console.log(currentUser, "my CURRENT user ID");

    // console.log(urlDatabase, "urlDatabase AFTER CHANGES");
    // console.log(req.params, "req.params in _showwwwwwwwwwwwwwwwwwwwwwww");
    res.render('./FinalPages/urls_show', templateVars);
    return;
  }
  res.redirect('/login');
});

app.post('/urls/:id', (req, res) => {
  // console.log(req.body, " ------------ req.body");
  // console.log(req.params, " ------------ req.params");
  if(req.session.id){
    const editUrl = req.body.editUrl;
    if(!editUrl){
      res.status(404).render('404');
      return;
    }
    urlDatabase[req.params.id] = editUrl;
    // console.log(urlDatabase, "--------- is urlDatabase");
  } else {
    res.redirect('/login');
    return;
  }
  res.redirect('/urls/' + req.params.id);
});


app.get('/u/:id', (req, res) => {
    if (req.params.id){
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
// ---------------------------- Ports ---------------------------- //
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
