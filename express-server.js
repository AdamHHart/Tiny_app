const express = require("express");
var morgan = require('morgan')

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  
};

app.use(morgan('dev'));

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
  const templateVars = { urls: urlDatabase };
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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.shortURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // console.log(urlDatabase[req.params.shortURL]);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log("req.params.shortURL :", req.params.shortURL);
  const id = req.params.shortURL;
  delete urlDatabase[id];
  res.redirect('/urls/');
})

app.post("/urls/:shortURL", (req, res) => {
  console.log("This is req.params.shortURL: ", req.params.shortURL);
  console.log("This is urlDatabase[req.params.shortURL]: ", urlDatabase[req.params.shortURL]);
  console.log("This is req: ", req);

  urlDatabase[req.params.shortURL] = req.body.longURL; //want this to equal the input url from POST 
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