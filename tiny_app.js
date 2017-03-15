'use strick';
const dotenv = require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");  //allows us to use post request parameters
const generateRandomString = require('./lib/generateShortUrl');


const app = express();
const port = process.env.port;
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// Configuration
app.set('view engine', 'ejs');
app.locals.title = "TinyApp";

//Middlewares
app.use(bodyParser.urlencoded({extended: true}));


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
  // const editUrl = req.params.
  res.render("urls_id", {shortUrl, longUrl}); // if i wanna have single id & link => change this line
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

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
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
