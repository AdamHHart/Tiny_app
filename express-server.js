const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const { getUserObjectByEmail } = require("./helperFunctions")

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

// MIDDLEWEAR

app.use(cookieSession ({
  name: "SUPERCRYPT",
  keys: ['key1', 'key2', 'key3', 'key4']
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));


// DATABASES

const urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca", 
    userID: "userRandomID"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com", 
    userID: "userRandomID"
  }
};


let userDatabase = { 
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
  for (const key in userDatabase) {
    const keyRecord = userDatabase[key];
    console.log("keyRecord = ", keyRecord);
    if (keyRecord.email === emailParam) {
    console.log("EMAIL FOUND keyRecord.email = ", keyRecord.email);  
      return (true);
    } 
  }
  return (false);
}




// Verify Password
const verifyPassword = function(password, userObject) {
  for (const key in userObject) {
    if (userObject.password === password) {
      return (true);
    } 
  }
}

// Transfer only user's urls to template vars 

const urlsForUser = function(id) {
  let userURLs = {};
  for (const key in urlDatabase) {
    const urlRecord = urlDatabase[key];
    

    if (urlRecord.userID === id) {
      userURLs[key] = urlRecord;
    }
    
  }
  console.log("userURLs = ", userURLs);
  return (userURLs);
}



// APP PAGES

app.get('/', (req, res) => {
  const templateVars = {
    user: userDatabase[req.session["userID"]], 
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {

  console.log("req.session[userID] =", req.session["userID"]);
  const userID = req.session["userID"];
  // console.log("userID =", userID);
  const user = userDatabase[userID];
  console.log("LOGGED IN AS user = ", userDatabase);
  const urls = urlsForUser(userID);
  
  let templateVars = { urls, user };

  res.render("urls_index", templateVars);
});



// create new url
app.post("/urls", (req, res) => {
  

  // console.log(req.body);  // Log the POST request body to the console
  let newUrl = generateRandomString(); 
  // console.log("newUrl = ", newUrl);
  const templateVars = {

    // userGroup: userObj,
    user: userDatabase[req.session["userID"]]
  };

  urlDatabase[newUrl] =    {
    shortURL: newUrl,
    longURL: req.body.longURL, 
    userID: req.session["userID"]
  }

  res.redirect(`/urls/${newUrl}`);         // Respond with 'Ok' (we will replace this)

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Get route
app.get("/urls/new", (req, res) => {
  if (req.session["userID"]) {
    const templateVars = { 
      user: userDatabase[req.session["userID"]], 
    };
    res.render("urls_new", templateVars);
  } else {
    const templateVars = { 
      user: null
    };
    res.render("login", templateVars);
  }
});



app.get("/urls/:shortURL", (req, res) => {

  const newShortUrl = req.params.shortURL;

  const templateVars = { 
    user: userDatabase[req.session["userID"]], 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[newShortUrl].longURL
  };

  // console.log("urlDatabase[newShortUrl].longURL = ", urlDatabase[newShortUrl].longURL);
  res.render("urls_show", templateVars);
});

// Reads short url and redirects you to the actual longURL webpage
app.get("/u/:shortURL", (req, res) => {
  // console.log(urlDatabase[req.params.shortURL]);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  // console.log("urlDatabase[req.params.shortURL].longURL", urlDatabase[req.params.shortURL].longURL);
  // console.log("req.params.shortURL", req.params.shortURL);

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
    const userHashedPass = bcrypt.hashSync(req.body['password'], 10);
    const randomId = generateRandomUserId();
    console.log("userHashedPass = ", userHashedPass);
    req.session.userID = userEmail;

    //if email does not exist in database, and is valid
    if (emailFinder(userEmail) === false && (userEmail !== ""  || userPass !== "")) {
      let newUserObj = {}
      newUserObj = {
        "id": randomId,
        "email": userEmail,
        "password": userHashedPass
      };
      userDatabase[randomId] = newUserObj; 
      res.cookie('userID', newUserObj['id']);
      res.redirect('/urls');
      return;
    }

    // if email already exists in database
    if (emailFinder(userEmail) === true) {
      res.status(404).render('404'); 
      return;
    }
  } if (req.body['email'] === undefined  || req.body['password'] === undefined) {  //user passes in name and password
    res.redirect('/register');
    return;
  }
})

// Login routes
app.get("/login", (req, res) => {
  const userEmail = req.body['email'];
  const userPass = req.body['password'];
  userDatabase.userEmail = userPass;


  res.render('login');
});

// Login submit handler This adds the username to the cookie jar and refreshes the page
app.post("/login", (req, res) => {
  const userName = req.body['email'];
  const inputPassword = req.body['password'];
  req.session.userID = userName;
  
  console.log("userPass = ", inputPassword);

  console.log("current available users (userObj) = ", userDatabase);

  // if email exists in database
  if (emailFinder(userName) === true) {

    // isolates login object
    const specificUserObject = getUserObjectByEmail(userName, userDatabase);
    console.log("specific user password = ", specificUserObject);
    
    // verify password 
    if (bcrypt.compareSync(inputPassword, specificUserObject.password)) {
      console.log("PASSWORD VERIFIED");
      // console.log("userObj[specificUserObj.id].id = ", userObj[specificUserObject.id].id);
      req.session["userID"] = userDatabase[specificUserObject.id].id;
      res.redirect('/urls');
    }
    if (!bcrypt.compareSync(inputPassword, specificUserObject.password)) {
      // console.log("userObj[specificUserObj.id].id = ", userObj[specificUserObject.id].id);
      console.log("Wrong password, because not hashed = specificUserObject.password? inputPassword: ", inputPassword, "specificUserObject.password: ", specificUserObject.password );  // I'd like an alert here
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
  req.session['userID'] = null;
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
  res.redirect('/login');
});

// Not yet working 
app.get("*", (req, res) => {
  // display the 404
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});