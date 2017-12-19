// ----MODULE REQUIREMENTS----
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const db = require('./db/db.js');

let app = express();

app.use(express.static(__dirname + '/static'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials')
app.use(bodyParser.urlencoded({
  extended: false
}))

// ----ENDPOINTS----
app.get('/', (req, res) => {
  res.render('home', {
    test: 'home'
  })
})
// ------------SIGNUP-----------
app.get('/signup', (req, res) => {
  res.render('registration', {
    test: 'reg'
  })
})
app.post('/signup', (req, res) => {

  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let passwordConfirm = req.body.passwordConfirm

  db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err, results, fields) => {
    if (err) {
      res.send('broken forevaaaaa ')
    }
  })

  res.render('registration', {
    test: 'WORKING NOW AND SIGNED UP AND STUFF'
  });
})


// -----LISTENING-----
app.listen(3008, () => {
  console.log('Now listening on port 3008');
})