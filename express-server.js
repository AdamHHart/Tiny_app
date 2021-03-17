const express = require("express");
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

// MIDDLEWEAR

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));


// DATABASES

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let userObj = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "ad@ad.ca", 
    password: "AD"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// FUNCTIONS

// userID
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

// shortURL
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

// Returns true if email already exists, false if not
const emailFinder = function(emailParam) {
  for (const obj in userObj) {
    console.log("userObj ========== ", userObj);
    console.log("userObj[obj] ========== ", userObj[obj]);
    console.log("userObj[obj].email ========== ", userObj[obj].email);
    if (userObj[obj].email === emailParam) {
      return (true);
    } 
  }
  return (false);
}
// Returns a single user object
const objectFinder = function(emailParam) {
  for (const obj in userObj) {
    if (userObj[obj].email === emailParam) {
      return (userObj[obj]);
    } 
  }
}
// Verify Password
const verifyPassword = function(password, userObject) {
  for (const key in userObject) {
    if (userObject.password === password) {
      return (true);
    } 
  }
}



// APP PAGES

app.get('/', (req, res) => {
  const templateVars = {
    user: userObj[req.cookies.userID], 
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});


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
    user: req.cookies["userID"] 
    
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
  res.render('register');
});

// submit handler (registration form)
app.post("/register", (req, res) => {
  if (req.body['email'] !== undefined  && req.body['password'] !== undefined) {  //user passes in name and password
    const userEmail = req.body['email'];
    const userPass = req.body['password'];
    const randomId = generateRandomUserId();
    //if email does not exist in database, and is valid
    if (emailFinder(userEmail) === false && (userEmail !== ""  || userPass !== "")) {
      let newUserObj = {}
      newUserObj = {
        "id": randomId,
        "email": userEmail,
        "password": userPass
      };
      userObj[randomId] = newUserObj; 
      res.cookie('userID', newUserObj['id']);
      res.redirect('/urls');
    }
    // if email already exists in database
    if (emailFinder(userEmail) === true) {
      res.status(404).render('404'); 
    }
  } if (req.body['email'] === undefined  || req.body['password'] === undefined) {  //user passes in name and password
    res.redirect('/register');
  }
})

// Login routes
app.get("/login", (req, res) => {
  const userEmail = req.body['email'];
  const userPass = req.body['password'];
  userObj.userEmail = userPass;


  res.render('login');
});

// Login submit handler This adds the username to the cookie jar and refreshes the page
app.post("/login", (req, res) => {
  const userName = req.body['email'];
  const userPass = req.body['password'];

  // if email exists in database
  if (emailFinder(userName) === true) {

    // isolates login object
    const specificUserObj = objectFinder(userName);
    console.log("specific user object = ", specificUserObj);
    
    // verify password 
    if (verifyPassword(userPass, specificUserObj) === true) {
      // console.log("PASSWORD VERIFIED");
      console.log("userObj[specificUserObj.id].id = ", userObj[specificUserObj.id].id);
      res.cookie('userID', userObj[specificUserObj.id].id);
      res.redirect('/urls');
    }
    if (!verifyPassword(userPass, specificUserObj)) {
      console.log("userObj[specificUserObj.id].id = ", userObj[specificUserObj.id].id);
      // alert("Wrong password");  // I'd like an alert here
      res.redirect('/login');
    }
  } 
  // if email does not exist in database
  if (emailFinder(userName) === false) {
    console.log("I'm supposed to return a 403 code, but I'd prefer to send you to the registration page.");
    // go to registration
    res.redirect('/register');
  } 

});

// This clears the cookie jar when you click logout
app.post("/logout", (req, res) => {
  res.clearCookie('userID');
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