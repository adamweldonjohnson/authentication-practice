// ----MODULE REQUIREMENTS----
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const db = require('./db/db.js');
const expressValidator = require('express-validator');
const {
  check,
  validationResult
} = require('express-validator/check');

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
    heading: 'home'
  })
})
// ------------SIGNUP-----------
app.get('/signup', (req, res) => {
  res.render('registration', {
    heading: 'reg'
  })
})

app.post('/signup', [
  // SETS UP INPUT CHECKS FOR USERNAME LENGTH
  check('username').isLength({
    min: 1
    // PROVIDES MSG FOR USERNAME LENGTH ERROR
  }).withMessage('Username required')
], (req, res) => {
  // PUTS VALIDATION ERRORS INTO ERR VARIABLE
  const err = validationResult(req)
  // RUNS IF ERRORS ARE NOT EQUAL TO ZERO
  if (!errors.isEmpty()) {
    console.log(err.mapped());
    // RENDERS PAGE WITH ERROR MESSAGE
    res.render('register', {
      heading: 'Registration failed'
    });
    // CODE BELOW RUNS IF NO CHECK ERRORS FOUND
  } else {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let passwordConfirm = req.body.passwordConfirm
    // INSERTS PASSED USER VALUES INTO DB, INSERTS VALUES FOR '?' WITH CHECKED UN, EMAIL, PW VARIABLES
    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err, results, fields) => {
      if (err) {
        res.send('DB broken forevaaaaa ')
      }
    })
    // SENDS VALIDATION FOR USER REGISTRATION
    res.render('registration', {
      heading: 'WORKING NOW AND SIGNED UP AND STUFF'
    });
  }
})


// -----LISTENING-----
app.listen(3008, () => {
  console.log('Now listening on port 3008');
})