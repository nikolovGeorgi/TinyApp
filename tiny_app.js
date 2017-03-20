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
  {"shortUrl":'b2xVn2', "longUrl": 'http://www.lighthouselabs.ca', 'userID': 'userRandomID'},
  {"shortUrl":'9sm5xK', "longUrl": 'http://www.google.com', 'userID': 'userRandomID'}
];
const userDB = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: '$2a$10$8KEfUx4.j5wVSU86ssHOHOTWH75FS51IZnXZoG25ZMGoegjGKo6Uy'
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
  let currentUser = userDB[req.session.id];
  console.log(userDB);
  if (!currentUser){
    return res.redirect('/login');
  }
  res.redirect('/urls');
});
// ---------------------------- Login Page ---------------------------- //
app.get('/login', (req, res) => {
  let currentUser = userDB[req.session.id];
  if (!currentUser){
    return res.render('login');
  }
  let templateVars = {
    userID: currentUser.id
  }
  res.redirect('/');
});

app.post('/login', (req, res) => {
  //check if the person who is trying to log-in is already in the system by email
  for (let userID in userDB){
    if ((userDB[userID].email === req.body.email) && (userDB[userID].password === req.body.password)){
      req.session.id = userDB[userID].id;
      return res.redirect('/');
    }
  }
  res.status(401).render('401');
});
// ---------------------------- Register Page ---------------------------- //
app.get('/register', (req, res) => {
  let currentUser = userDB[req.session.id];
  if (!currentUser){
    return res.render('register');
  }
  let templateVars = {
    userID: currentUser.id
  }
  res.redirect('/');
});
app.post('/register', (req, res) => {
  // chec if the email & password are valid inputs
  if (req.body.email && req.body.password){
    for (let userID in userDB){
      const user = userDB[userID];
      // if the user inputs the right email & pass > direct them to urls
      if ((user.email === req.body.email) && (user.password === req.body.password)){
        res.redirect('/login');
        console.log("redirecting to /login -----------HERE------------------");

        return;
        // if the email is correct, but not the password > forbidden error
      } else if (user.email === req.body.email) {
        res.status(403).render('403');
        console.log("redirecting to / -----------HERE------------------");
        return;
      }
    }
    // otherwise create a new user!
    let newUserID = generateRandomString();
    userDB[`${newUserID}`] = {
      id: newUserID,
      email: req.body.email,
      password: hashPass(req.body.password)
    }
    req.session.id = newUserID;
    res.redirect('/');
    console.log("redirecting to / ----------------------------------------");
    return;
  }
  res.status(400).render('400');
  console.log("$$$$$$$$$$$$$$ ERRR 403 BOTTOM  $$$$$$$$$$$$$$$");
});
// + Header
app.get('/urls', (req, res) => {
  let currentUser = userDB[req.session.id];
  // console.log(currentUser);
  if (!currentUser){
    return res.status(401).render('401');
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
    return res.status(401).render('401');
  }
  let shortUrl = generateRandomString();
  let longUrl = req.body.longUrl;
  var newURL = {};
  newURL['shortUrl'] = shortUrl;
  newURL['longUrl'] = longUrl;
  newURL['userID'] = currentUser.id;

  urlDatabase.push(newURL);
  res.redirect('/urls/' + shortUrl);
  return;
});

// + header
app.get('/urls/new', (req, res) => {
  let currentUser = userDB[req.session.id];
  if (!currentUser){
    return res.status(401).render('401');
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

  // check if url with /:id exists > err 404
  let currentUser = userDB[req.session.id];
  if (!currentUser){
    return res.status(401).render('401');
  }

  // if the user does not match the user that owns the url > 403
  // loop through the url database and check for user ID
  let currentID = {};
  for (var i = 0; i < urlDatabase.length; i++){
      if (req.params.id === urlDatabase[i].shortUrl){
        currentID['shortUrl'] = req.params.id;
        currentID['longUrl'] = urlDatabase[i].longUrl;
      }
  }
  var templateVars = {
    urlDatabase: currentID,
    userID: req.session.id,
    userEmail: userDB[req.session.id].email
  }
  let newURL = req.params.id;
  let tempLongUrl = urlDatabase[newURL];
  res.render('./FinalPages/urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  let currentUser = userDB[req.session.id];
  if (!currentUser){
    return res.status(401).render('401');
  }
  const editUrl = req.body.editUrl;
  if(!urlCheck(req.body.longUrl)){
    return res.status(404).render('404');
  }
  for (let idCheck in userDB){
    console.log(idCheck, "idCheck");
    console.log(userDB, "userDB");
    if (currentUser.id !== idCheck){
      return res.status(400).render('400');
    }
  }
  urlDatabase[req.params.id] = editUrl;
  res.redirect('/urls/' + req.params.id);
});

app.get('/u/:id', (req, res) => {
  let currentShorUrl = req.params.id;
  if(!currentShorUrl){
    return res.status(404).render('404');
  }
  for (let i = 0; i < urlDatabase.length; i++){
    if (currentShorUrl === urlDatabase[i].shortUrl){
      return res.redirect(urlDatabase[i].longUrl)
    }
  }
});
// ---------------------------- Delete URLs ---------------------------- //
app.post('/urls/:id/delete', (req, res) => {
  if (!req.session.id){
    res.status(404).render('404');
    return;
  }
  let currentShorUrl = req.params.id;
  for (let i = 0; i < urlDatabase.length; i++){
    if (currentShorUrl === urlDatabase[i].shortUrl){
      delete urlDatabase[i];
      res.redirect('/urls');
    }
  }
});
// ---------------------------- Ports ---------------------------- //
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

function hashPass(password){
  return hashed_password = bcrypt.hashSync(password, 10);
}
function urlCheck(input) {
  var regexr = input.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if (regexr === null)
    return false;
  else
    return true;
}
