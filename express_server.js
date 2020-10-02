const express = require("express");
const morgan = require('morgan');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { findUserByEmail, urlsForUser, generateRandomString } = require('./helpers');

//~~~~~SERVER~~~~~
const app = express();
const PORT = 8080;

//~~~~~MIDDLEWARE~~~~~
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey1', 'secretkey2'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");

//~~~~~ DATA STORAGE~~~~~
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userId: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "aJ48lW"
  }
};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
};

//~~~~~~~~~~ROUTES~~~~~~~~~~

//~~~~~URL PAGES~~~~~

//~~~~~HOME~~~~~
app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//~~~~~MY URLS PAGE~~~~~
app.get("/urls", (req, res) => {
  let userId = req.session['userId'];
  if (userDatabase[userId]) {
    let usersURLs = urlsForUser(urlDatabase, userId);
    const templateVars = {
      urls: usersURLs,
      userId: req.session['userId']
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }
});
//~~~~~ CREATE URL PAGE~~~~~
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: req.session["userId"]
  };
  res.redirect(`/urls/${shortURL}`);
});

//~~~~~ NEW URLS PAGE~~~~~
app.get("/urls/new", (req, res) => {
  let userId = req.session['userId'];
  if (userDatabase[userId]) {
    const templateVars = {
      userId
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});
//~~~~~ YOUR CREATED URL PAGE
app.get("/urls/:shortURL", (req, res) => {
  let { shortURL } = req.params;
  let urlObj = urlDatabase[shortURL];
  const templateVars = {
    userId: req.session["userId"],
    shortURL: shortURL,
    longURL: urlObj.longURL
  };
  res.render("urls_show", templateVars);
});

//~~~~~DELETE URL~~~~~
app.post('/urls/:shortURL/delete', (req, res) => {
  let userId = req.session['userId'];
  if (userId) {
    let shortURL = req.params.shortURL;
    if (urlDatabase[shortURL]) {
      delete urlDatabase[shortURL];
    } else {
      res.status(401).send('You cannot delete URLs if you are not logged in!');
    }
    res.redirect('/urls');
  } else
  res.redirect('/login');
});

//~~~~~EDIT URL~~~~~
app.post('/urls/:shortURL', (req, res) => {
  let userId = req.session['userId'];
  if (userId) {
    let newShortURL = req.params.shortURL;
    let longURL = req.body.longURL;
    if ((urlDatabase[newShortURL])) {
      urlDatabase[newShortURL] = {
        longURL: longURL,
        userId: req.session["userId"]
      };
    }
    res.redirect(`/urls/${newShortURL}`);
  }
  res.redirect('/register');
});
//~~~~~REDIRECT TO LONG URL~~~~~
app.get('/u/:shortURL', (req, res) => {
  let { shortURL } = req.params;
  const urlObj = urlDatabase[shortURL];
  res.redirect(urlObj.longURL);
});


//~~~~~~~~~~REGISTER - LOGIN - LOGOUT ROUTES~~~~~~~~~~~~~~~~~~~~

//~~~~~GET REGISTER~~~~~
app.get('/register', (req, res) => {
  const templateVars = {
    userId: req.session["userId"],
    password: req.session["userId.password"]
  };
  res.render('urls_register', templateVars);
});

//~~~~~POST REGISTER~~~~~
app.post('/register', (req, res) => {
  const userId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  for (let user in userDatabase) {
    if (email === userDatabase[user].email) {
      res.status(400).send('This email is already registered.');
      return;
    }
  }
  if (!email || !password) {
    res.status(400).send('You must enter in a valid username and password');
    return;
  }
  bcrypt.hash(password, 6, function (err, hashedPassword) {
    user = {
      id: userId,
      email,
      password: hashedPassword
    };
    userDatabase[userId] = user;
    req.session.userId = userId;
    console.log(req.session.userId);
    res.redirect('/urls');

  });
});

//~~~~~GET LOGIN~~~~~
app.get("/login", (req, res) => {
  const templateVars = {
    userId: req.session["userId"]
  };
  res.render("urls_login", templateVars);
});

//~~~~~POST LOGIN~~~~~
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const existingUser = findUserByEmail(userDatabase, email);
  if (!email || !password) {
    res.status(400).send('You must enter in a valid username and password');
    return;
  }
  if (existingUser) {
    bcrypt.compare(password, existingUser.password, function (err, isPasswordMatched) {
      if (isPasswordMatched) {
        req.session.userId = existingUser.id;
        res.redirect('/urls');
      } else {
        res.redirect('/login');
      }
    });
  } else {
    res.status(400);
    res.redirect('/register');
  }
});

//~~~~~POST LOGOUT~~~~~
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});