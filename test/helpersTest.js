const { getUserObjectByEmail } = require("../helperFunctions");
const { urlDatabase, userDatabase } = require("../databases");
const { assert } = require("chai");


describe('getUserObjectByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserObjectByEmail("ad@ad.ca", userDatabase);
    const expectedOutput = "userRandomID";
    assert.equal(getUserObjectByEmail("ad@ad.ca", userDatabase).email, "ad@ad.ca", "True, email exists, return user object");
  });
  it('should return undefined because email doesn\'t exist', function() {
    const user = getUserObjectByEmail("dsafadsgfgas@ad.ca", userDatabase);
    const expectedOutput = "false";
    assert.equal(getUserObjectByEmail("dsafadsgfgas@ad.ca", userDatabase), undefined, "Returns undefined, email doesn\'t exist");
  });
  it('should return undefined for blank email field', function() {
    const user = getUserObjectByEmail(" ", userDatabase);
    const expectedOutput = "false";
    assert.equal(getUserObjectByEmail(" ", userDatabase), undefined, "returns underfined, email blank");
  });
});


// assert.equal(getUserObjectByEmail("ad@ad.ca", true, userDatabase));
// assert.equal(getUserObjectByEmail("adadsfadsf@ad.ca", false, userDatabase));
// assert.equal(getUserObjectByEmail(" ", false, userDatabase));