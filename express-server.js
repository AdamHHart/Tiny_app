const express = require("express");
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  
};

  let userObj = { 
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
  };


app.get('/', (req, res) => {
  console.log('Cookies: ', req.cookies);
  const templateVars = {
    user: userObj[req.cookies.userID], 
    // ... any other vars
  };
  res.render("urls_index", templateVars);
});

function generateRandomUserId() {
  const stringLength = 12;
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( var i = 0; i < stringLength; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  // console.log(result);
  return (result);
}

function generateRandomString() {
  const stringLength = 6;
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  // console.log(result);
  return (result);
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  console.log("[req.cookies.userID] = ", req.cookies.userID)
  const templateVars = {

    // userGroup: userObj,
    user: userObj[req.cookies.userID], 
    urls: urlDatabase 
  };
  console.log("userObj = ",userObj);
  console.log("templateVars =", templateVars);
  res.render("urls_index", templateVars);

});


// create new url
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let newUrl = generateRandomString(); 
  // console.log("newUrl = ", newUrl);
  urlDatabase[newUrl] = req.body.longURL;
  res.redirect(`/urls/${newUrl}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// 
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"] 
    
  };
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    user: userObj[req.cookies.userID], 
    shortURL: req.params.shortURL, 
    longURL: req.params.shortURL 
  };
  res.render("urls_show", templateVars);
});

// Reads short url and redirects you to the actual longURL webpage
app.get("/u/:shortURL", (req, res) => {
  // console.log(urlDatabase[req.params.shortURL]);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


// Registration routes
app.get("/register", (req, res) => {
  console.log("req.body['email'] email = ", req.body['email']);
  console.log("req.body['password'] password = ", req.body['password']);
  const userEmail = req.body['email'];
  const userPass = req.body['password'];
  // userObj.userEmail = userPass;


  res.render('register');
});

// submit handler (registration form)
app.post("/register", (req, res) => {
  console.log("register req.body = ", req.body);
  if (req.body['email'] !== undefined  && req.body['password'] !== undefined) {  //user passes in name and password
    const userEmail = req.body['email'];
    const userPass = req.body['password'];
    const randomId = generateRandomUserId();
    let newUserObj = {}
    newUserObj = {
      "id": randomId,
      "email": userEmail,
      "password": userPass
    };
    userObj[randomId] = newUserObj;
    console.log("newUserObj = ", newUserObj);
    console.log("userObj = ", userObj);

    res.cookie('userID', newUserObj['id']);
    res.redirect('/urls');
  }
  if (req.body['username'] === undefined  || req.body['password'] === undefined) {  //user passes in name and password
    res.redirect('/register');
  }
})

// Login routes
app.get("/login", (req, res) => {
  console.log("req.body['email'] email = ", req.body['email']);
  console.log("req.body['password'] password = ", req.body['password']);
  const userEmail = req.body['email'];
  const userPass = req.body['password'];
  userObj.userEmail = userPass;


  res.render('login');
});

// Login submit handler This adds the username to the cookie jar and refreshes the page
app.post("/login", (req, res) => {
  console.log("req.body = ", req.body);
  const userName = req.body['email'];
  const userPass = req.body['password'];

  // res.cookie('username', userName);
  // console.log('username =', userName);
  // res.redirect('/urls');
  if (userObj.userName && userObj.userName === userPass) {
  res.cookie('email', userName);
    res.redirect('/urls')
  }
  if (userObj.userName && userObj.userName === userPass) {
    res.redirect('/login')
  }
});

// This clears the cookie jar when you click logout
app.post("/logout", (req, res) => {
  res.clearCookie('email');
  res.redirect('/urls');
})

// Deletes a url from MyURLs
app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log("req.params.shortURL :", req.params.shortURL);
  const id = req.params.shortURL;
  delete urlDatabase[id];
  res.redirect('/urls/');
})

app.post("/urls/:shortURL", (req, res) => {
  console.log("This is req.params.shortURL: ", req.params.shortURL);
  console.log("This is urlDatabase[req.params.shortURL]: ", urlDatabase[req.params.shortURL]);
  console.log("This is req.body.changeName: ", req.body.changeName);

  urlDatabase[req.params.shortURL] = req.body.changeName; //want this to equal the input url from POST 
  res.redirect('/urls');
});

// Not yet working 
app.get("*", (req, res) => {
  // display the 404
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});