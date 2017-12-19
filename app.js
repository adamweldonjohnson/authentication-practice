// ----MODULE REQUIREMENTS----
const express = require('express');
const hbs = require('hbs');

let app = express();

app.set(express.static(__dirname + '/static'));
app.set('view engine', 'hbs');

// ----ENDPOINTS----
app.get('/', (req, res) => {
  res.render('home.hbs', {})
})


// -----LISTENING-----
app.listen(3008, () => {
  console.log('Now listening on port 3000');
})