const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{ username: "test", password: "test1234" }];

const isValid = (username) => {
  return true;
};

const authenticatedUser = (username, password) => {
  return true;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  const user = users.find((user) => user.username === username);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  req.session.user = { username: user.username };
  const token = jwt.sign(
    { username: user.username },
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoibWFyY2VsbGluZyIsImlhdCI6MTYyMzE4MjM2Nn0.sdiyM0xJK8SLNnAgmfb_pLMVUpD5GudE5rSw_m9eS2A"
  );
  return res.status(200).json({ message: "Login successful", token: token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = parseInt(req.params.isbn);
  const review = req.query.review;
  const username = req.session.user.username;
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!book.reviews) {
    book.reviews = {};
  }
  const existingReview = book.reviews[username];
  if (existingReview) {
    // Modify existing review
    existingReview.review = review;
    return res.status(200).json({ message: "Review modified successfully" });
  } else {
    // Add new review
    book.reviews[username] = { review: review };
    return res.status(200).json({ message: "Review added successfully" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = parseInt(req.params.isbn);
  const username = req.session.user.username;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const reviewsArray = Object.values(book.reviews);

  const filteredReviews = reviewsArray.filter(
    (review) => review.username !== username
  );

  const updatedReviews = {};
  filteredReviews.forEach((review) => {
    updatedReviews[review.username] = review;
  });

  book.reviews = updatedReviews;

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
