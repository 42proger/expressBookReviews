const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "Username already taken" });
  }
  const newUser = { username: username, password: password };
  users.push(newUser);
  return res
    .status(200)
    .json({
      message: "User successfully registered. Now you can login.",
      user: newUser,
    });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  const availableBooks = Object.values(books);
  return res.status(200).json({ books: availableBooks });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = parseInt(req.params.isbn);
  const book = books[isbn];

  if (book) {
    return res.status(200).json({ book: book });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.keys(books)
    .filter((isbn) => {
      return books[isbn].author === author;
    })
    .map((isbn) => {
      return books[isbn];
    });

  if (booksByAuthor.length > 0) {
    return res.status(200).json({ books: booksByAuthor });
  } else {
    return res.status(404).json({ message: "Books by author not found" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter((book) => {
    return book.title.toLowerCase().includes(title.toLowerCase());
  });

  if (booksByTitle.length > 0) {
    return res.status(200).json({ books: booksByTitle });
  } else {
    return res.status(404).json({ message: "Books with title not found" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = parseInt(req.params.isbn);
  const book = books[isbn];
  if (book) {
    const reviews = book.reviews;
    if (reviews && Object.keys(reviews).length > 0) {
      return res.status(200).json({ reviews: reviews });
    } else {
      return res.status(200).json({ message: "No reviews found for the book" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
