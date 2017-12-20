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

// -------SIGN IN-------
app.get('/login', (req, res) => {
  res.render('signin', {
    heading: 'Login'
  })
})

app.post('/login', (req, res) => {
  res.render('signin', {
    heading: 'Logged In!'
  })

  let username = req.body.username;
  let email = req.body.email;
  // VALIDATION GOES HERE
  // HASHING GOES HERE
  // QUERY DB FOR USERNAME
  // COMPARE HASHED PASSWORDS
})
// ------------SIGNUP-----------
app.get('/signup', (req, res) => {
  res.render('registration', {
    heading: 'reg'
  })
})

app.post('/signup', [
  // SETS UP INPUT CHECKS FOR USERNAME LENGTH, PROVIDES MSG FOR USERNAME LENGTH ERROR
  check('username').isLength({
    min: 4,
    max: 45
  }).withMessage('Username must be 4-45 characters.'),
  // CHECKS EMAIL FIELD TO MAKE SURE IT'S AN EMAIL, PROVIDES MSG FOR INVALID EMAIL ADDRESS
  check('email').isEmail().withMessage('Invalid email address.'),
  // CHECKS EMAIL LENGTH IS BETWEEN 6 AND 100, PROVIDES ERR MSG
  check('email').isLength({
    min: 6,
    max: 100
  }).withMessage('Email address must be between 4-100 characters.'),
  // CHECKS PASSWORD IS BETWEEN 8 AND 30 CHARACTERS, PROVIDES ERR MSG
  check('password').isLength({
    min: 8,
    max: 30
  }).withMessage('Password must be between 8-100 characters.'),
  // CHECKS PASSWORD WITH REG EXP'S TO ENSURE LOWERCASE, UPPERCASE, NUMBER, AND SPECIAL CHAR ARE USED, PROVIDES ERR MSG
  check("password").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i").withMessage("Password must contain one lowercase character, one uppercase character, a number, and a special character."),
  // CHECKS PASSWORD CONFIRMATION IS EQUAL TO THE PASSWORD, PROVIDES ERR MSG
  check('passwordConfirm').custom((value, {
    req
  }) => value === req.body.password).withMessage('Passwords do not match')

], (req, res) => {
  // PUTS VALIDATION ERRORS INTO ERR VARIABLE
  const err = validationResult(req)
  // RUNS IF ERRORS ARE NOT EQUAL TO ZERO
  if (!err.isEmpty()) {
    console.log(err.mapped());
    // RENDERS PAGE WITH ERROR MESSAGE
    res.render('registration', {
      heading: 'Registration failed',
      errors: err.array()
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