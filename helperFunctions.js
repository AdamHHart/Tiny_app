const { urlDatabase, userDatabase } = require("./databases");

// Returns a single user object
const getUserObjectByEmail = function(emailParam, userDatabase) {
  for (const obj in userDatabase) {
    if (userDatabase[obj].email === emailParam) {
      console.log("TRUE, return userDatabase[obj] = ", userDatabase[obj]);
      return (userDatabase[obj]);
    } 
    // if (userDatabase[obj].email !== emailParam) {
    //   console.log("FALSE, email not found = ", emailParam);
    // }
  }
  return (undefined);
}


getUserObjectByEmail("ad@ad.ca", userDatabase);
getUserObjectByEmail("adfadsfd@ad.ca", userDatabase);

module.exports = { getUserObjectByEmail };
