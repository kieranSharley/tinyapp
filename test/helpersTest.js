const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
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
describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail(testUsers, "user@example.com")
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput)
  });
  it('should return false as email is not in database', function() {
    const user = findUserByEmail(testUsers, "imposter@example.com")
    const expectedOutput = "userRandomID";
    assert.notEqual(user.id, expectedOutput)
  });
});