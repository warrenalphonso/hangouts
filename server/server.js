const path = require('path');
const express = require('express');

const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000; //process.env.PORT works for heroku
//heroku deployment: in package.json, added start and engines scripts

var app = express(); //configure app

app.use(express.static(publicPath)); //connect public folder

app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
