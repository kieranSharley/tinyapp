//helper functions

const findUserByEmail = (userDatabase, email) => {
  for (let userId in userDatabase) {
    const knownUser = userDatabase[userId];
    if (knownUser.email === email) {
      return knownUser;
    }
  }
  return false;
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~

const urlsForUser = function (urlDatabase, userId ) {
  let filteredURLs = {};
  for (let shortURL in urlDatabase) {
    if (userId === urlDatabase[shortURL]['userId']) {
      filteredURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredURLs;
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}
module.exports = { findUserByEmail, urlsForUser, generateRandomString }