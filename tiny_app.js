'use strick';
const dotenv = require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const generateRandomString = require('./lib/generateShortUrl');
// const session = require('express-session');


const app = express();
const port = process.env.port;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabse = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123a"
  },
 "user2RandomID": {
    id: "test2",
    email: "user2@example.com",
    password: "asd1"
  }
};

// Configuration
app.set('view engine', 'ejs');
app.locals.title = "TinyApp";

//Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// app.use(session({
//   secret: 'george',
//   resave: false,
//   saveUninitialized: true,
//   cookie: {}
// }))
// ---------------------------- Retrieve ---------------------------- //

app.get('/', (req, res) => {
  // res.render('pages/index', urlDatabase);
  let templateVars = {
    username: req.cookies["username"],
    urlDatabase: urlDatabase
  }
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  res.render("urls_index", {urlDatabase});
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  const longUrl = urlDatabase[shortUrl];
  // console.log(req.params.editUrl);
  res.render("urls_id", {shortUrl, longUrl}); // if i wanna have single id & link => change this line
});
app.get('/register', (req, res) => {
  res.render('urls_register', {
    email: userDatabse,
    password: userDatabse
  });
});

app.get('/login', (req, res) => {
  res.render('urls_index')
});
app.get('/about', (req, res) => {
  res.render('pages/about');
});

// ---------------------------- CREATE ---------------------------- //
// once i create a new short url
app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longUrl;
  res.redirect("/urls/" + shortUrl);
});

// THIS IS EXECUTED IN /urls
app.post('/urls/:id', (req, res) => {
  const editUrl = req.body.editUrl; //longUrl
  urlDatabase[req.params.id] = editUrl
  res.redirect('/urls/' + req.params.id);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  // let username = req.body.userid
  // // let password = req.body.password
  // if (!userDatabase[username]) {
  //   res.redirect(401, '/urls');
  // } else if (userDatabase[username]) {
  // // should also check for password
  // req.session.isLoggedOn = true;
  // res.redirect('/urls' + username );
  // }
  let name = req.body.username;
  res.cookie("username", name);
  console.log(res.cookie)
  res.redirect('/');
});
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/');
});
// app.post('/urls/:id', (req, res) => {
//   let editUrl = urlDatabase[req.params.editUrl]; //longUrl
//   console.log(req.params);
//   res.redirect('/urls/'+ editUrl);
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

// to consider

// clicking submit button without anything generates a new string and takes us to the new pages
// delete the short link page after its been deleted => /urls/tacuu after tacuu has been deleted
