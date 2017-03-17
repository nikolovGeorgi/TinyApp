const dotenv = require('dotenv').config();  //hide important files
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const generateRandomString = require('./lib/generateShortUrl');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
// const passport = require('passport')
//   , LocalStrategy = require('passport-local').Strategy;


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
// const userDB = {
//   'gnikolov@sfu.ca': {
//     name: 'Georgi Nikolov',
//     email: 'gnikolov@sfu.ca',
//     password: '123a'
//   }
// }
let timesVisited = 0;
// ---------------------------- Configuration ---------------------------- //
app.set('view engine', 'ejs');
app.locals.title = "TinyApp";

// ---------------------------- Middlewares ---------------------------- //
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     User.findOne({ username: username }, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) {
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       if (!user.validPassword(password)) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, user);
//     });
//   }
// ));

// ---------------------------- Custom Middleware ---------------------------- //
app.use((req, res, next) => {
  // console.log('Custom User Middleware Session', req.session);
  // Find a user from the cookies
  // const user = userDB[req.cookies.email]; // Cookie Version
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

// ------------------ TO DO ---------------------------
//  if loged in -> direct to /urls
// ----------------------------------------------------
app.get('/', (req, res) => {
  // does it mean if cookie exists that user is loged in ?
  // if user is loged in > redirect to urls && if not > to the login page
  if (req.session.id){
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});
// ---------------------------- Login Page ---------------------------- //
// ------------------ TO DO ---------------------------
// if loged > redirect '/'
// if not loged > form email + pass > submit button > post/login
// ----------------------------------------------------
app.get('/login', (req, res) => {
  // res.render('login');
  if (req.session.id){
    res.redirect('/');
  }
  // render user_login, templateVars
  res.render('login');
});
// ------------------ TO DO ---------------------------
//  if email & pass params match an existing user > set cookie & redirect > '/'
// if they dont match > err 401
// ----------------------------------------------------
app.post('/login', (req, res) => {
  //check if the person who is trying to log-in is already in the system by email
  for (let userID in userDB){
    if (userDB[userID].email === req.body.email){
      const user = userDB[userID];
      // if email is valid -> check for the password
      if(user && (user.password === req.body.password)){
        // If so, login, set email cookie, and redirect
        req.session.id = user.id;
        res.redirect('/urls');
        return;
        // if email is valid, but password is not redirect to attempt logging again
      } else {
        res.redirect('/login')
        // If not, send status 403 and show 403
      }
    } else {
      // if email is invalid error 403
      res.status(403).render('403');
    }
  }
  // if user is not in the database > redirect to register page
  res.redirect('/register');
});

// ---------------------------- Register Page ---------------------------- //
// ------------------ TO DO ---------------------------
//  if loged redirect > '/'
//  if not loged > register form > post /register
// ----------------------------------------------------
app.get('/register', (req, res) => {
  if (req.session.id){
    res.redirect('/');
    return;
  }
  // render of user_register, templateVars
  res.render('register');
});

// ------------------ TO DO ---------------------------
//  if email or pass is empty > 400
//  if email exists > 400
//  if all well -> create user & encrypt pass with bcrypt
// set cookie & redirect > '/'
// ----------------------------------------------------
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
    req.session.id = newUserID; // res.session.id = newUserID
    // once user is registered > redirect to /urls;
    res.redirect('/');
    return;
    // req.session.email = req.body.email; // Session Version
  }
  // if invalid email and password
  res.status(403).render('403');
});

// ---------------------------- User Home Page ---------------------------- //
// ------------------ TO DO ---------------------------
//if user not loged > 401 + link to /login
//if user loged in > 200 + site header
// link to create a new short link > urls/new
// ----------------------------------------------------
app.get('/urls', (req, res) => {
  // const user = userDB[req.session.email];
  if (res.session.id){
    // render urls_index, templateVars;
    res.render('urls_index', {urlDatabase});
    return;
  }
  res.redirect('/login'); // give err 401 with link for /login
});

// ------------------ TO DO ---------------------------
// if user loged > generate short url and save to that user
// redirect > urls/:id
// if not loged > 401 + link to /login
// ----------------------------------------------------
app.post("/urls", (req, res) => {
  if (res.session.id){
    let shortUrl = generateRandomString();
    urlDatabase[shortUrl] = req.body.longUrl;
    res.redirect("/urls/" + shortUrl);
    return;
  }
  res.redirect('/login'); // give err 401 with link for /login
});

// ---------------------------- URL to Short URL ---------------------------- //
// ------------------ TO DO ---------------------------
//  if url w/ :id does NOT exist > 404
// if user not loged > 401 + link to /login
// if user loged but url does not belong > 403
// if all well > 200 + short url, date, visits, longUrl +
// update button >post/urls/:id
// delete button > post/urls/:id/delete
// ----------------------------------------------------
app.get('/urls/:id', (req, res) => {
  if(res.session.id){
    const shortUrl = req.params.id;
    const longUrl = urlDatabase[shortUrl];
    // render urls_show, templateVars
    res.render("urls_id", {shortUrl, longUrl});
    return;
  }
  res.redirect('/login'); // give err 401 with link for /login

  // const user = userDB[req.session.email];
  // console.log(user);
  // if (user){
  //   // if (req.params.id){
  //     const shortUrl = req.params.id;
  //     const longUrl = urlDatabase[shortUrl];
  //     res.render("urls_id", {shortUrl, longUrl});
  //   // } else {
  //     // res.status(404).render('404');
  //   // };
  // } else {
  //   // choose one
  //   res.status(401).render('401');
  //   res.redirect('/login');
  // };
});

// ------------------ TO DO ---------------------------
// if url :id does NOT exist > 404
// if not loged > 401 + link to /login
// if user does not match url owner > err 403
// if all well > update url > redirect /urls:id
// ----------------------------------------------------
app.post('/urls/:id', (req, res) => {
  if(res.session.id){
    const editUrl = req.body.editUrl; //longUrl
    if(!editUrl){
      res.status(404).render('404');
      return;
    }
    urlDatabase[req.params.id] = editUrl;
  } else {
    res.redirect('/login'); // give err 401 with link for /login
    return;
  }
  res.redirect('/urls/' + req.params.id);

  // const user = userDB[req.session.email];
  // if (user) {
  //   // if (req.params.id){
  //     const editUrl = req.body.editUrl; //longUrl
  //     urlDatabase[req.params.id] = editUrl;
  //     // const timesVisited =  Number(req.cookies.timesVisited) || 0
  //     // res.cookie('timesVisited', timesVisited + 1);
  //
  //   // } else {
  //   //   res.status(404).render('404');
  //   // };
  // } else {
  //   res.redirect('/login');
  // }
  // res.redirect('/urls/' + req.params.id);
});

// ---------------------------- Short URL Redirection ---------------------------- //
// ------------------ TO DO ---------------------------
//  if id exists > redirect to longurl
// if not > err 404
// ----------------------------------------------------
app.get('/u/:id', (req, res) => {
  for (let userID in userDB){
    if (req.params.id){
      let longUrl = userDB[userID][req.params.id]
      res.redirect(`${longUrl}`);
      return;
    }
    return;
  }
  res.status(404).render('404');
});

// ---------------------------- New Short URL ---------------------------- //
// ------------------ TO DO ---------------------------
//  if not loged in > 401 + lnk to /login
// if loged > 200 + header + form [input field for original URL + submit > post/urls]
// ----------------------------------------------------
app.get("/urls/new", (req, res) => {
  if (res.session.id){
    res.render("urls_new");
    return;
  }
  res.redirect('/login'); // give err 401 with link for /login
});

// ---------------------------- Delete URLs ---------------------------- //
app.post('/urls/:id/delete', (req, res) => {
  if (!res.session.id){
    res.status(404).render('404');
    return;
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// ---------------------------- Count Views ---------------------------- //

// app.get('/urls/:id', (req, res)=> {
//   const timesVisited =  Number(req.cookies.timesVisited) || 0
//   res.cookie('timesVisited', timesVisited + 1);
// });

// ---------------------------- Logout Page ---------------------------- //
app.post('/logout', (req, res) => {
  if (!res.session.id){
    res.status(404).render('404');
    return;
  }
  // res.clearCookie('email'); // Cookie Version
  // console.log(req.session.email, "before delete");
  // delete req.session.email; // Session Version
  // console.log(req.session.email, "after delete");
  res.clearCookie(req.session.id);
  res.redirect('/');
  return;
});

// ---------------------------- Ports ---------------------------- //
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

// header
//  if a user is loged in > header shows :
// user email
// my links > /urls
// logout button > post /logout
//
// if not loged in :
// link to login page
// link to registration page

// how do i check which ejs page i am reading from in a particular get/post(view counts)

// redirect when user is loged in and tries to log in again
// redirect when user is loged in and tries to register
// change header when user is loged in and is in the /urls/:id page
