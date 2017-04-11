const dotenv = require('dotenv').config();  //hide important files
const express = require('express');
const bodyParser = require('body-parser');
const generateRandomString = require('./lib/generateShortUrl');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 8080;

// ---------------------------- dataBases ---------------------------- //
const urlDatabase = [
  {
    'b2xVn2': {
      shortUrl: 'b2xVn2',
      longUrl: 'http://www.lighthouselabs.ca',
      userID: 'userRandomID'
    }
  },
  {
    '9sm5xK': {
      shortUrl: '9sm5xK',
      longUrl: 'http://www.google.ca',
      userID: 'user2RandomID'
    }
  }
];
const userDB = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: '1'
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
  keys: [process.env.SESSION_SECRET || 'nikolovGeorgi'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
// ---------------------------- Main Page ---------------------------- //
app.get('/', (req, res) => {
  let currentUser = req.session.id;
  if (currentUser) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});
// ---------------------------- Check DataBase ---------------------------- //
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
// ---------------------------- Login Page ---------------------------- //
// if not loged in render out the login page / otherwise redirect to home page
app.get('/login', (req, res) => {
  let currentUser = req.session.id;
  if (currentUser) {
    res.redirect ('/');
  } else {
    res.render('login');
  }
});

app.post('/login', (req, res) => {
  //check if the person who is trying to log-in is already in the system by email
  for (let userID in userDB){
    if ((userDB[userID].email === req.body.email) && (bcrypt.compare(req.body.password, userDB[userID].password))){
      req.session.id = userDB[userID].id;
      return res.redirect('/');
    }
  }
  res.status(401).render('401');
});
// ---------------------------- Register Page ---------------------------- //
app.get('/register', (req, res) => {
  if(req.session.id){
    res.redirect('/');
  } else {
    res.render('register')
  }
});
app.post('/register', (req, res) => {
  if(!req.body.email || !req.body.password){
    return (() => {
      res.status(400).render('400');
    });
  }
  for(let userID in userDB){
    if(userDB[userID].email === req.body.email) {
      return (() => {
        res.status(400).render('400');
      });
    }
  }

  let newUserID = generateRandomString();
  userDB[`${newUserID}`] = {
    id: newUserID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }
  req.session.id = newUserID;
  res.redirect('/');
});

function findUserUrls(id){
  let userUrls = {};
  for (let shortUrl in urlDatabase){
    if(urlDatabase[shortUrl].userID === id){
      userUrls[shortUrl] = urlDatabase[shortUrl].longUrl;
    }
  }
  return userUrls;
}
app.get('/urls', (req, res) => {
  let currentUser = userDB[req.session.id];
  if (!currentUser){
    res.status(401).render('401');
  }
  let userUrls = findUserUrls(currentUser.id)
  var templateVars = {
    urlDatabase: userUrls,
    userID: req.session.id,
    userEmail: userDB[req.session.id].email
  }
  res.status(200).render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  let currentUser = req.session.id;
  if (currentUser) {
    let shortUrl = generateRandomString();
    let longUrl = req.body.longUrl;
    let newURL = {};
    newURL['shortUrl'] = shortUrl;
    newURL['longUrl'] = longUrl;
    newURL['userID'] = currentUser;

    urlDatabase[shortUrl] = newURL;
    res.redirect('/urls/' + shortUrl);
  } else {
    res.status(401).render('401');
  }
});

app.get('/urls/new', (req, res) => {
  let currentUser = req.session.id;
  if (currentUser){
    let templateVars = {
      userID: req.session.id,
      userEmail: userDB[req.session.id].email
    }
    res.render('urls_new', templateVars);
  } else {
    res.status(401).render('401');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.get('/urls/:id', (req, res) => {
  let currentUser = req.session.id;
  let shortUrl = req.params.id;
  let longUrl = urlDatabase[shortUrl].longUrl;

  if (!currentUser) {
    res.status(401).render('401');
    return;
  }
  if (!urlDatabase[shortUrl]){
    res.status(404).render('404');
    return;
  }
  if (currentUser !== urlDatabase[shortUrl].userID){
    res.status(403).render('403');
    return;
  }

  let templateVars = {
    shortUrl,
    longUrl,
    userID: currentUser,
    userEmail: userDB[currentUser].email
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  let currentUser = req.session.id;
  let shortUrl = req.params.id;

  if (!currentUser) {
    res.status(401).render('401');
    return;
  }
  if (!urlDatabase[shortUrl]){
    res.status(404).render('404');
  }
  if (currentUser !== urlDatabase[shortUrl].userID){
    res.status(403).render('403');
  }

  urlDatabase[shortUrl].longUrl = req.body.longUrl;
  res.redirect('/urls/' + shortUrl);
});

app.get('/u/:id', (req, res) => {
  let shortUrl = req.params.id;
  if (!urlDatabase[shortUrl]){
    res.status(404).render('404');
  } else {
    res.redirect(urlDatabase[shortUrl].longUrl);
  }
});
// ---------------------------- Delete URLs ---------------------------- //
app.post('/urls/:id/delete', (req, res) => {
  let currentUser = req.session.id;
  let shortUrl = req.params.id;
  if (currentUser === urlDatabase[shortUrl].userID){
    delete urlDatabase[shortUrl];
    res.redirect('/urls');
  } else {
    res.status(403).render('403');
  }
});
// ---------------------------- Ports ---------------------------- //
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

function urlCheck(input) {
  var regexr = input.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if (regexr === null)
    return false;
  else
    return true;
}
