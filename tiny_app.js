'use strick';
const dotenv = require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const generateRandomString = require('./lib/generateShortUrl');


const app = express();
const port = process.env.port;
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// ---------------------------- Configuration ---------------------------- //
app.set('view engine', 'ejs');
app.locals.title = "TinyApp";

// ---------------------------- Middlewares ---------------------------- //
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
// app.use(function (req, res, next) {
//   // check if client sent cookie
//   var cookie = req.cookies.cookieName;
//   if (cookie === undefined)
//   {
//     // no: set a new cookie
//     var randomNumber=Math.random().toString();
//     randomNumber=randomNumber.substring(2,randomNumber.length);
//     res.cookie('cookieName',randomNumber, { maxAge: 900000, httpOnly: true });
//     console.log('cookie created successfully');
//   }
//   else
//   {
//     // yes, cookie was already present
//     console.log('cookie exists', cookie);
//   }
//   next(); // <-- important!
// });
// ---------------------------- Retrieve ---------------------------- //

app.get('/', (req, res) => {
  res.render('pages/index', urlDatabase);
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
  res.render("urls_id", {shortUrl, longUrl});
});

app.get('/about', (req, res) => {
  res.render('pages/about');
});

// ---------------------------- CREATE ---------------------------- //

app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longUrl;
  res.redirect("/urls/" + shortUrl);
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

// ---------------------------- Ports ---------------------------- //
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

// to consider

// clicking submit button without anything generates a new string and takes us to the new pages
// delete the short link page after its been deleted => /urls/tacuu after tacuu has been deleted
