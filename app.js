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
const bcrypt = require('bcrypt');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const mySQLStore = require('express-mysql-session');
const flash = require('connect-flash');

let app = express();

var options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Awj03130!',
  database: 'auth-practice',
};

var sessionStore = new mySQLStore(options);

hbs.registerPartials(__dirname + '/views/partials')
app.use(express.static(__dirname + '/static'));
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(flash())
app.use(expressSession({
  secret: 'jl1234oixcju0fpoopypants',
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}))

passport.use(new LocalStrategy((username, password, done) => {
  db.query('SELECT id, password FROM users WHERE username = ?', username, (err, results, fields) => {
    if (err) {
      done('you have an error ' + err);
    }
    if (results.length === 0) {
      console.log('attempted');
      done(null, false, {
        message: 'Username and password do not match.'
      });
    } else {
      const hash = results[0].password.toString();
      bcrypt.compare(password, hash, (err, res) => {
        if (res === true) {
          done(null, {
            user: results[0].id
          })
        } else {
          done(null, false)
        }
      })
      // done(null, true)
    }
  });
}));

app.use(passport.initialize());
app.use(passport.session());

// --------------ENDPOINTS-------------
// ----HOME---
app.get('/', (req, res) => {
  res.render('home', {
    heading: 'This is the homepage with a big photo.'
  })
})

// --------LOGOUT-------
app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/login')
})

// --------PROFILE------
app.get('/profile', isAuthenticatedMiddleware(), (req, res) => {
  // console.log(req.user);
  // console.log(req.isAuthenticated());
  db.query('SELECT * FROM users WHERE id = ?', req.user.user, (err, results, fields) => {
    let username = results[0].username
    let email = results[0].email

    res.render('profile', {
      heading: 'This is the profile page.',
      user: req.user.user_id,
      username,
      email
    });
  })
})

// -------SIGN IN-------
app.get('/login', (req, res) => {
  res.render('signin', {
    heading: 'Login',
    message: req.flash('error')
  })
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}))

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
  }
  // RUNS IF NO ERRORS
  else {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let passwordConfirm = req.body.passwordConfirm
    let bcrypt = require('bcrypt');
    const saltRounds = 10;
    const someOtherPlaintextPassword = 'not_bacon';

    // USES BCRYPT HASHING FOR DB INTERACTIONS
    bcrypt.hash(password, saltRounds, function(err, hash) {
      // INSERTS PASSED USER VALUES INTO DB, INSERTS VALUES FOR '?' WITH CHECKED UN, EMAIL, PW VARIABLES
      db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash], (err, results, fields) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            res.render('registration', {
              heading: 'Sad user was sad...',
              error: "There was an error..... You've already signed up!"
            })
          }
          // console.log(err);
          // res.send('DB broken forevaaaaa ');
          return;
        } else {
          db.query('SELECT LAST_INSERT_ID() as user', (err, results, fields) => {
            if (err) {
              res.send('It\'s totally broken, sorry!')
            } else {
              req.login(results[0], (err) => {
                res.redirect('/profile')
              })
            }
          })
        }
      })
    })
  }
})



// ==========PASSPORT SERIALIZATION/DESERIALIZATION===========
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  done(null, id);
});

// ==========AUTHENTICATION CHECK FUNCTION===========
function isAuthenticatedMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/login')
    }
  }
}

// -----LISTENING-----
app.listen(3008, () => {
  console.log('Now listening on port 3008');
})