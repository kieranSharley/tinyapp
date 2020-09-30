const express = require("express");
//const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

//server
const app = express();
const PORT = 8080;

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


app.set("view engine", "ejs");

//datastore
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
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
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.cookies["userId"]
  };
  console.log(templateVars.userId);
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

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  //let longURL = req.body.longURL;
  //console.log(req.body);
  urlDatabase[shortURL] = req.body.longURL;
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

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    userId: req.cookies["userId"]
  };
  res.render("urls_show", templateVars);
});
//Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
//EDIT
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
//login // adapting... to userID
app.post('/login', (req, res) => {
  let email = req.body.email;
  console.log(email);
  let password = req.body.password;
  let founduser;
  for (let id in users) {
    if (email === users[id].email) {
      founduser = users[id];
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
// If the e-mail or password are empty strings, send back a response with the 400 status code.
// If someone tries to register with an email that is already in the users object,
// send back a response with the 400 status code. Checking for an email in the users 
// object is something we'll need to do in other routes as well. Consider creating
// an email lookup helper function to keep your code DRY

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password,
  };
  console.log(users);
  res.cookie('userId', userId);
  //console.log(users);

  res.redirect('/urls');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}
