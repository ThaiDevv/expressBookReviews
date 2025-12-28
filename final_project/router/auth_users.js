const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  return !users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  return users.some(
    user => user.username === username && user.password === password
  );
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }
  if (authenticatedUser(username,password)) {
      const accessToken = jwt.sign(
        { username: username },
        "access",
        { expiresIn: "1h" }
      );
      req.session.authorization = {
        accessToken,
        username
      };
      return res.status(200).json({
        message: "User successfully logged in",
        token: accessToken
      });
  }
  return res.status(401).json({
    message: "Invalid username or password"
  });
});
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if (!req.session.authorization) {
    return res.status(401).json({ message: "User not logged in" });
  }
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  const review = req.query.review;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!req.session.authorization) {
    return res.status(401).json({ message: "User not logged in" });
  }
  const username = req.session.authorization.username;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  const reviews = books[isbn].reviews;
  if (!reviews[username]) {
    return res.status(404).json({ message: "You have no review for this book" });
  }
  delete reviews[username];
  return res.json({ 
    message: "Review deleted successfully",
    reviews: books[isbn].reviews});
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
