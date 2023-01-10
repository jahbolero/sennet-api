require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");

// app.use(cors({ origin: process.env.LOCAL_CLIENT }));
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
// Set up the API routes
const applications = require("./routes/applications");
const authorize = require("./routes/authorize");
app.use("/api", applications);
app.use("/api", authorize);

// Start the server
var server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = {
  server,
};
