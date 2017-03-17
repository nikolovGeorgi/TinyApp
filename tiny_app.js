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
let timesVisited = 0;
// ---------------------------- Configuration ---------------------------- //
app.set('view engine', 'ejs');
app.locals.title = "TinyApp";
appTitle = app.locals.title;
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
    let templateVars = {
      userID: req.session.id
    }
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
    if ((userDB[userID].email === req.body.email) && (userDB[userID].password === req.body.password)){
      req.session.id = userDB[userID].id;
      console.log(req.session.id, "ID");
      // req.session.email = userDB[userID].email;
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).render('403');
});
// ---------------------------- Register Page ---------------------------- //
// ------------------ TO DO ---------------------------
//  if loged redirect > '/'
//  if not loged > register form > post /register
// ----------------------------------------------------
app.get('/register', (req, res) => {
  if (req.session.id){
    let templateVars = {
      userID: req.session.id
    }
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
  if (req.session.id){
    console.log(req.session.email, " hi");
    console.log(req.session, "session");
    console.log(urlDatabase, "urlDatabase");
    var templateVars = {
      urlDatabase: urlDatabase,
      userID: req.session.id,
      userEmail: userDB[req.session.id].email
    }
    // console.log(userDB, "----------------");
    // console.log(templateVars, " hello ");
    // console.log(templateVars.urlDatabase, " My urlDatabase in templateVars");
    // for (var el in templateVars.urlDatabase){
    //   console.log(templateVars.urlDatabase[el], "------templateVars.urlDatabase[el]");
    //   console.log(el, "------templateVars.urlDatabase[el]");
    // }
    // console.log(templateVars.userID, " FUCKING");
    // console.log(req.session.email, " req.session.email");
    // console.log(userDB[templateVars.userID].email, " userDB[templateVars.userID]email");
    // render urls_index, templateVars;
    // res.render('urls_index', {urlDatabase});
    console.log(templateVars);
    res.render('./FinalPages/urls_index', templateVars);
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
  if(req.session.id){
    var templateVars = {
      urlDatabase: urlDatabase,
      userID: req.session.id,
      userEmail: req.session.email
    }
    // console.log(templateVars.userID, 'userid');
    // console.log(templateVars.longUrl, 'longUrl');
    // console.log(templateVars.shortUrl, 'shortUrl');
    // const shortUrl = req.params.id;
    // const longUrl = urlDatabase[shortUrl];
    // render urls_show, templateVars
    //urls_id
    // res.render("urls_show", {shortUrl, longUrl});
    res.render("./FinalPages/urls_show", templateVars);
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
  if(req.session.id){
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
  console.log(req.params.id, "req.params.id");
  console.log(urlDatabase[req.params.id], "haha"); // long
  // for (let urls in urlDatabase){
  //   console.log(urlDatabase[urls], "urlDatabase[urls]");
    if (req.params.id){
      // let longUrl = urlDatabase[urls][req.params.id]
      // res.redirect(`${longUrl}`);
      res.redirect(`${urlDatabase[req.params.id]}`);
      return;
      // break;
    }
  //   break;
  // }
  res.status(404).render('404');
});

// ---------------------------- New Short URL ---------------------------- //
// ------------------ TO DO ---------------------------
//  if not loged in > 401 + lnk to /login
// if loged > 200 + header + form [input field for original URL + submit > post/urls]
// ----------------------------------------------------
app.get("/urls/new", (req, res) => {
  if (req.session.id){
    res.render("./FinalPages/urls_new");
    return;
  }
  res.redirect('/login'); // give err 401 with link for /login
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

// ---------------------------- Count Views ---------------------------- //

// app.get('/urls/:id', (req, res)=> {
//   const timesVisited =  Number(req.cookies.timesVisited) || 0
//   res.cookie('timesVisited', timesVisited + 1);
// });

// ---------------------------- Logout Page ---------------------------- //
// app.post('/logout', (req, res) => {
//   // if (!req.session.id){
//   //   res.status(404).render('404');
//   //   return;
//   // }
//   // res.clearCookie('email'); // Cookie Version
//   // console.log(req.session.email, "before delete");
//   // delete req.session.email; // Session Version
//   // console.log(req.session.email, "after delete");
//   res.clearCookie(req.session.id);
//   res.redirect('/');
//   // return;
// });
app.post('/logout', (req, res) => {
  // res.clearCookie('email'); // Cookie Version
  delete req.session.id; // Session Version
  delete req.session.email; // Session Version
  res.redirect('/login');
});
// ---------------------------- Ports ---------------------------- //
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

// Keys in JS are Values in EJS
// EXAMPLE :
/*

  users {
  name: Georgi
  age: 1

  to access & print the name & age in EJS -> <%= name age %>
}

*/

// BOOTSTRAP stylesheet in _header
//<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootswatch/3.3.7/slate/bootstrap.min.css">
// http://stackoverflow.com/questions/14903205/changing-bootstraps-form-colors


/*request cookies = > check if it exists // collection coming from user
                    use to check if cookie exists

response cookies => send back cookies // send back to the client
*/

// res.cookie to set cookie

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
