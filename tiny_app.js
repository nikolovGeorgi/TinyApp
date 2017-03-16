'use strick';
const flash = require('connect-flash');
const dotenv = require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const generateRandomString = require('./lib/generateShortUrl');
const session = require('express-session');
//https://github.com/expressjs/session
//https://github.com/jaredhanson/connect-flash

const app = express();
const port = process.env.port;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    name: "tom",
    // email: "user@example.com",
    password: "123a"
  },
 "user2RandomID": {
    id: "test2",
    name: "georgi",
    // email: "user2@example.com",
    password: "asd1"
  }
};

// Configuration
app.set('view engine', 'ejs');
app.locals.title = "TinyApp";


//Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(flash());

app.use(session({
  secret: 'georgi',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}))
// ---------------------------- Retrieve ---------------------------- //

app.get('/urls', (req, res) => {
  // res.render('pages/index', urlDatabase);
  let templateVars = {
    username: req.cookies["username"],
    urlDatabase: urlDatabase
  }
  res.render("urls_index", {templateVars});   // Last change res.render("urls_index", templateVars);
});

// app.get("/urls", (req, res) => {
//   res.render("urls_index", {urlDatabase});
// });

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls/:id', (req, res) => {
  let templateVars = {
    shortUrl: req.params.id,
    longUrl: urlDatabase[req.params.id],
    username: req.cookies["username"],
    saved: req.flash('saved').length > 0
  };
  res.render("urls_id", templateVars);
});
// app.get('/urls/:id', (req, res) => {
//   const shortUrl = req.params.id;
//   const longUrl = urlDatabase[shortUrl];
//   // console.log(req.params.editUrl);
//   res.render("urls_id", {shortUrl, longUrl});
// });
// http://stackoverflow.com/questions/14902923/cannot-post-form-node-js-express
app.get('/register', (req, res) => {
  // res.render('urls_register', {
  //   email: userDatabse,
  //   password: userDatabse
  // });
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_register", templateVars);
  return;
});

app.get('/login', (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render('urls_index', {templateVars});
  return;
});

app.get("/u/:shortUrl", (req, res) => {
  let longUrl = url[req.params.shortUrl];
  console.log("Created shortUrl:", req.params.shortUrl);
  res.redirect(longUrl);
});

app.get('/about', (req, res) => {
  res.render('pages/about');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// ---------------------------- CREATE ---------------------------- //
// once i create a new short url
app.post("/urls", (req, res) => {
  if(req.cookies["username"] !== null){
    let shortUrl = generateRandomString();
    urlDatabase[shortUrl] = req.body.longUrl;
    req.flash("saved", true);
    res.redirect("/urls/" + shortUrl);
  }else{
    console.log("Log in!");
    res.sendStatus(403);
    return;
  }
  return;
});
// app.post("/urls", (req, res) => {
//
//   let shortUrl = generateRandomString();
//   urlDatabase[shortUrl] = req.body.longUrl;
//   res.redirect("/urls/" + shortUrl);
// });

// THIS IS EXECUTED IN /urls
app.post('/urls/:id', (req, res) => {
  const editUrl = req.body.editUrl; //longUrl
  urlDatabase[req.params.id] = editUrl;
  req.flash('saved', true);
  res.redirect('/urls/' + req.params.id);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  if( !((req.cookies["username"]) && (req.body.password)) ){
    res.sendStatus(400);
    return;
  }
  for (let el in userDatabase){
    if ((req.cookies["username"] === userDatabase[el].name)){
      console.log("Already Registered!");
      res.sendStatus(400);
      return;
    }
  }
  let newUser = generateRandomString();
  res.cookie("username", newUser);
  userDatabase[newUser] = {
    id: newUser,
    name: req.cookies["username"],
    password: req.body.password
  };
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
  for (let el in userDatabase){
    if((userDatabase[el].name === req.cookies["username"]) &&
       (userDatabase[el].password === req.body.password)){
         console.log("Existing user", userDatabase[el]);
         res.cookie("username", userDatabase[el].id);
         res.redirect("/urls");
         return;
       }
  }
  res.sendStatus(404);
  // let name = req.body.username;
  // res.cookie("username", name);
  // res.redirect('/urls');
});
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
  return;
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
