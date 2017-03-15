'use strick';
const dotenv = require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");  //allows us to use post request parameters
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
  res.render("urls_show", {urlDatabase});
  });

app.get('/about', (req, res) => {
  res.render('pages/about');
});


// ---------------------------- CREATE ---------------------------- //

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL);
  console.log(urlDatabase);
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
function generateRandomString() {
  return (Math.random().toString(36).substr(2, 5));
}
