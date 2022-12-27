require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');

app.use(cors({ origin: process.env.LOCAL_CLIENT}));



app.use(express.json())
// Set up the API routes
const applications = require('./routes/applications');
app.use('/api', applications);

// Start the server
var server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports ={
  server
}