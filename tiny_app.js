'use strick';
const dotenv = require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const generateRandomString = require('./lib/generateShortUrl');
const session = require('express-session');

const app = express();
const port = process.env.port;
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const userDatabse = {

};

// ---------------------------- Configuration ---------------------------- //
app.set('view engine', 'ejs');
app.locals.title = "TinyApp";

// ---------------------------- Middlewares ---------------------------- //
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(session({
  secret: 'george',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}))

// ---------------------------- Retrieve ---------------------------- //

app.get('/', (req, res) => {
  // console.log("Cookies: ", req.cookies);
  // res.cookie(name , 'value', {expire : new Date() + 9999});
  res.render('pages/index', urlDatabase);
});

app.get("/urls", (req, res) => {
  userDatabse['urlDatabase'] = urlDatabase,
  console.log(userDatabse);
  res.render("urls_index", userDatabse);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  const longUrl = urlDatabase[shortUrl];
  res.render("urls_id", {shortUrl, longUrl});
});

// app.get('/login', (req, res) => {
//   let cookie_id = req.body.username;
//   console.log(req.body.username);
//   res.render("pages/index", req.body.username);
// });
app.get('/login', (req, res) => {
  console.log(res.cookie);
  res.cookie(req.body.name, 'cookie_value').send('Username is set!');
  // let cookieName = res.cookies.name;
  // console.log(cookieName);
  console.log("Cookies: ", req.cookies);
});
// app.get('/clearcookie',(req,res) => {
//      clearCookie('cookie_name');
//      res.send('Cookie deleted');
// });
app.get('/about', (req, res) => {
  res.render('pages/about');
});

// ---------------------------- CREATE ---------------------------- //

app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longUrl;
  res.redirect("/urls/" + shortUrl);
});

app.post("/login", (req, res) => {
  userDatabse['username'] = req.body.username;
  res.redirect("/urls/"+ req.body.username);
});

app.post('/urls/:id', (req, res) => {
  const editUrl = req.body.editUrl; //longUrl
  urlDatabase[req.params.id] = editUrl
  res.redirect('/urls/' + req.params.id);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/login/', (req, res) => {
  let username = req.body.userid
  // let password = req.body.password
if (!userDatabase[username]) {
  res.redirect(401, '/urls')
} else if (userDatabase[username]) {
  // should also check for password
  req.session.isLoggedOn = true
  res.redirect('/urls' + username )
}

// ---------------------------- Ports ---------------------------- //
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
// to consider

// clicking submit button without anything generates a new string and takes us to the new pages
// delete the short link page after its been deleted => /urls/tacuu after tacuu has been deleted
