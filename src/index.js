const express = require('express');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {
  fs.readFile(__dirname+"/public/home.html", 'utf8', (err, html) => {

    if(err) {
      response.status(500).send('sorry, out of order');
    }

    response.send(html);
  })
})

app.listen(process.env.PORT || 3001, () => console.log('app avaiable on http://localhost:3001!'))
