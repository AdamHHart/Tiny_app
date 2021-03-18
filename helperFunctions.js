// Returns a single user object
const getUserObjectByEmail = function(emailParam, userDatabase) {
  for (const obj in userDatabase) {
    if (userDatabase[obj].email === emailParam) {
      return (userDatabase[obj]);
    } 
  }
}


module.exports = { getUserObjectByEmail };