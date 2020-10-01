const express = require("express");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

//server
const app = express();
const PORT = 8080;

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));


app.set("view engine", "ejs");

//data storage
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    user2RandomID: "aJ48lW"
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

app.get("/", (req, res) => {
  res.redirect('/urls');
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.cookies["userId"]
  };
  //console.log("this is urlDatabase", urlDatabase);

  res.render("urls_index", templateVars);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
app.get("/urls/new", (req, res) => {
  const templateVars = {
    userId: req.cookies["userId"]
  };
  res.render("urls_new", templateVars);
});
//GET /login
app.get("/login", (req, res) => {
  const templateVars = {
    userId: req.cookies["userId"]
  };
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  //let longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL, userId: req.cookies["userId"]
  };
  res.redirect(`/urls/${shortURL}`);
});

//create register page
app.get('/register', (req, res) => {
  const templateVars = {
    userId: req.cookies["userId"],
    userId: req.cookies["userId.password"]
  };
  res.render('urls_register', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let { shortURL } = req.params;
  console.log("shortURL==", shortURL);
  const obj = urlDatabase[shortURL];
  console.log("obj==", obj);
  console.log("obj.longURL==", obj.longURL);
  res.redirect(obj.longURL);
});
// new shortURL page when submit on createurl
app.get("/urls/:shortURL", (req, res) => {
  let { shortURL } = req.params;
  // console.log("shortURL===",shortURL)
  let obj = urlDatabase[shortURL];
  console.log("obj probs undefined===", obj.longURL); //{longURL: example.com, UserId: 'h1234q'}
  const templateVars = {
    userId: req.cookies["userId"],
    shortURL: shortURL,
    longURL: obj.longURL
  };
  res.render("urls_show", templateVars);
});

//Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  let userId = req.cookies['userId'];
  if (userId) {
    let shortURL = req.params.shortURL;
    if (urlDatabase[shortURL]) {
      delete urlDatabase[shortURL];
    } else {
      res.status(401).send('You cannot delete URLs if you are not logged in!');
    }
    res.redirect('/urls');
  } else 
  //send a message with this
    res.redirect('/login')
  res.redirect('/register');
});
//EDIT
app.post('/urls/:shortURL', (req, res) => {
  let newShortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[newShortURL] = {
    longURL: longURL,
    userId: req.cookies["userId"]
  };
  res.redirect(`/urls/${newShortURL}`);
});
//login // adapting... to userID
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let founduser;
  for (let id in userDatabase) {
    if (email === userDatabase[id].email && password === userDatabase[id].password) {
      founduser = userDatabase[id];
    }
  }
  if (founduser) {
    res.cookie('userId', founduser.id);
    res.redirect('/urls');
  } else {
    res.send('user not found!');
  }

});
//logout
app.post('/logout', (req, res) => {
  res.clearCookie('userId', 'password');
  res.redirect('/urls');
});
//register 
// Checking for an email in the userDatabase 
// object is something we'll need to do in other routes as well. Consider creating
// an email lookup helper function to keep your code DRY

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  console.log("password is =", password);
  for (let id in userDatabase) {
    if (email === userDatabase[id].email) {
      res.status(400).send('This email is already registered.');
      return;
    }
  }
  if (!email || !password) {
    res.status(400).send('You must enter in a valid username and password');
    return;
  }

  userDatabase[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie('userId', userId);
  res.redirect('/urls');


});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const findUserByEmail = (userDatabase, email) => {
  for (let shortURL in userDatabase) {
    const obj = userDatabase[shortURL];
    if (obj.email === email) {
      return obj;
    }
  }
  return false;
};
