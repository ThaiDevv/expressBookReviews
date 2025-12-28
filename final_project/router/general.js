const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios");
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // 1. Kiểm tra thiếu username hoặc password
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  // 2. Kiểm tra username đã tồn tại
  const userExists = users.some(users => users.username === username);
  if (userExists) {
    return res.status(409).json({
      message: "Username already exists"
    });
  }

  // 3. Đăng ký user mới
  users.push({ username, password });
  return res.status(200).json({
    message: "User registered successfully"
  });
});
public_users.get('/', function (req, res) {
  res.status(200).send(JSON.stringify(books));
});
public_users.get("/axios", async (req, res) => {
  const response = await axios.get("http://localhost:5000/");
  res.json(response.data);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if(books[isbn]){
    res.status(200).json(books[isbn])
  }
  else{
    res.status(404).json({message:"book not found"})
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
// Duyệt object và lọc sách theo tác giả
  const result = [];
  for (const key in books) {
    if (books[key].author === author) {
        result.push(books[key]);
    }
  }
  if (result.length > 0) {
      res.status(200).json(result);
  } else {
      res.status(404).json({ message: "Author not found" });
  }
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
   const title = req.params.title;
// Duyệt object và lọc sách theo tác giả
  const result = [];
  for (const key in books) {
    if (books[key].title === title) {
        result.push(books[key]);
    }
  }
  if (result.length > 0) {
      res.status(200).json(result);
  } else {
      res.status(404).json({ message: "title not found" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if(books[isbn]){
    res.json(books[isbn].reviews);
  }else{
    res.json({message: "not have isbn"})
  }
});
public_users.get("/axios/isbn/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    res.json(response.data);
  } catch (error) {
    res.status(404).json({ message: "Book not found" });
  }
});
public_users.get("/axios/author/:author", async (req, res) => {
  try {
    const author = req.params.author;
    const response = await axios.get(
      `http://localhost:5000/author/${author}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(404).json({ message: "No books found for this author" });
  }
});
public_users.get("/axios/title/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const response = await axios.get(
      `http://localhost:5000/title/${title}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(404).json({ message: "No books found with this title" });
  }
});

module.exports.general = public_users;
