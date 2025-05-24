const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cookieParser());

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use morgan for logging
app.use(morgan('dev'));

// Use body-parser to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const LOGIN_FILE = path.join(__dirname, 'data', 'login.txt');
const PET_FILE = path.join(__dirname, 'data', 'pets.txt');

// Use express-session for managing sessions
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Middleware to set the layout
app.use((req, res, next) => {
  res.locals.layout = 'layout';
  next();
});

// Add this after you set up `express-session`
app.use(flash());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to make flash messages available in templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.info_msg = req.flash('info_msg');
  next();
});

// Create an account
  app.get('/createaccount', (req, res) => {
    res.render('createaccount');
  });
  
  app.post('/create-account', (req, res) => {
    const { username, password } = req.body;
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/;
  
    if (!usernameRegex.test(username) || !passwordRegex.test(password)) {
      req.flash('error_msg', 'Invalid username or password format. Only alphanumeric characters are allowed. Password must be at least 4 characters long and contain both letters and numbers.');
      return res.redirect('/createaccount');
    }
  
    try {
      const users = fs.readFileSync(LOGIN_FILE, 'utf-8').split('\n').map(line => line.split(':')[0]);
      if (users.includes(username)) {
        req.flash('error_msg', 'Username already exists. Please choose a different username.');
        return res.redirect('/createaccount');
      }
    } catch (error) {
      req.flash('error_msg', 'Error reading user data. Please try again later.');
      return res.redirect('/createaccount');
    }
  
    // Save the new username and password
    try {
      fs.appendFileSync(LOGIN_FILE, `\n${username}:${password}`);
      req.flash('success_msg', 'Account created successfully. You are now ready to login whenever you want.');
      res.redirect('/createaccount');
    } catch (error) {
      req.flash('error_msg', 'Error saving account data. Please try again later.');
      res.redirect('/createaccount');
    }
  });
  
  // Log in
  app.get('/login', (req, res) => {
    res.render('login');
  });
  
  app.post('/log-in', (req, res) => {
    const { username, password } = req.body;
    const users = fs.readFileSync(LOGIN_FILE, 'utf-8').split('\n').map(line => line.split(':'));
  
    const user = users.find(u => u[0] === username && u[1] === password);
    if (user) {
      req.session.username = username;
      req.flash('success_msg', 'Login successful');
      res.redirect('/haveapettogiveaway');
    } else {
      req.flash('error_msg', 'Invalid username or password');
      res.redirect('/login');
    }
  });
  
  // Have a pet to give away (requires login)
  app.get('/haveapettogiveaway', (req, res) => {
    if (!req.session.username) {
      req.flash('error_msg', 'You must be logged in to register a pet.');
      return res.redirect('/login');
    }
    res.render('haveapettogiveaway');
  });
  
  app.post('/haveapettogiveaway', (req, res) => {
    if (!req.session.username) {
      req.flash('error_msg', 'You must be logged in to register a pet.');
      return res.redirect('/login');
    }
  
    const petData = req.body;
    try {
      const pets = fs.readFileSync(PET_FILE, 'utf-8').split('\n').filter(line => line);
      const petId = pets.length ? parseInt(pets[pets.length - 1].split(':')[0]) + 1 : 1;
      const petEntry = `${petId}:${req.session.username}:${Object.values(petData).join(':')}\n`;
      fs.appendFileSync(PET_FILE, petEntry);
      req.flash('success_msg', 'Pet registered successfully.');
      res.redirect('/haveapettogiveaway');
    } catch (error) {
      req.flash('error_msg', 'Error registering pet. Please try again later.');
      res.redirect('/haveapettogiveaway');
    }
  });
 // Find a cat/dog
  app.get('/findadogcat', (req, res) => {
    res.render('findadogcat', { pets: [] });
  });
  
  app.post('/findadogcat', (req, res) => {
    const { id, username, pet_type, cat_breed, dog_breed, age, gender, friendly1, friendly2, friendly3, ownername, ownerpet, comment} = req.body;
    // Log the data retrieved from the 'findadogcat' form
    console.log('Form data:', req.body);
    let pets = [];

    try {
      pets = fs.readFileSync(PET_FILE, 'utf-8').split('\n').filter(line => line && !line.startsWith('ID'));
      console.log('Pets data:', pets); // // Log the data retrieved from the 'haveapettogiveaway' form
    } catch (error) {
      req.flash('error_msg', 'Error reading pet data. Please try again later.');
      return res.redirect('/findadogcat');
    }
  
    const filteredPets = pets.filter(pet => {
      const petData = pet.split(':');
      const [ , , petType, catBreed, dogBreed, petAge, petGender, petFriendly1, petFriendly2, petFriendly3 , , ] = petData;
  
      return (!pet_type || petType === pet_type) &&
           (petType === 'cat' ? (!cat_breed || catBreed === cat_breed || cat_breed === "Doesn't matter") : (!dog_breed || dogBreed === dog_breed || dog_breed === "Doesn't matter")) &&
           (!age || petAge === age || age === "Doesn't matter") &&
           (!gender || petGender === gender || gender === "Doesn't matter") &&
           (!friendly1 || petFriendly1 === friendly1) &&
           (!friendly2 || petFriendly2 === friendly2) &&
           (!friendly3 || petFriendly3 === friendly3);
    });
    console.log('Filtered pets:', filteredPets); // Log the filtered pets data
  
    if (filteredPets.length === 0) {
      req.flash('info_msg', 'No pets found matching your criteria.');
    }
  
    res.render('findadogcat', { pets: filteredPets });
  });

  // Log out
  
// Route to serve the logout page
app.get('/logout', (req, res) => {
  const message = req.query.message;
  res.render('logout', { message: message });
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          // Redirect with error message
          return res.redirect('/logout?message=Error logging out');
      }
      // Redirect with success message
      res.redirect('/logout?message=Logged out successfully');
  });
});
  
  // Other unchanged routes
  app.get('/', (req, res) => {
    res.render('mainpage');
  });
  
  app.get('/homepage', (req, res) => {
    res.render('homepage');
  });

  app.get('/petcare', (req, res) => {
    res.render('petcare');
  });
  
  app.get('/catcare', (req, res) => {
    res.render('catcare');
  });
  
  app.get('/contactus', (req, res) => {
    res.render('contactus');
  });

// Exercice 1 
// Function to validate phone number format
function validatePhoneNumber(phoneNumber = '') {
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phoneNumber);
}

// findSummation
function findSummation(n = 1) {
  if (typeof n !== 'number' || n <= 0 || !Number.isInteger(n)) {
      return false;
  }
  let sum = 0;
  for (let i = 1; i <= n; i++) {
      sum += i;
  }
  return sum;
}

// uppercaseFirstandLast
function uppercaseFirstandLast(input = '') {
  if (typeof input !== 'string') {
      return false;
  }
  return input.split(' ').map(word => {
      if (word.length === 0) return word;
      const firstChar = word[0].toUpperCase();
      const lastChar = word[word.length - 1].toUpperCase();
      if (word.length === 1) {
          return firstChar;
      }
      return firstChar + word.slice(1, -1) + lastChar;
  }).join(' ');
}

// findAverageAndMedian
function findAverageAndMedian(numbers = []) {
  if (!Array.isArray(numbers) || numbers.some(num => typeof num !== 'number')) {
      return false;
  }
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  const length = sortedNumbers.length;
  const sum = sortedNumbers.reduce((acc, num) => acc + num, 0);
  const average = sum / length;
  const median = length % 2 === 0
      ? (sortedNumbers[length / 2 - 1] + sortedNumbers[length / 2]) / 2
      : sortedNumbers[Math.floor(length / 2)];
  return { average, median };
}

// find4Digits
function find4Digits(inputString = '') {
  if (typeof inputString !== 'string') {
      return false;
  }
  const match = inputString.match(/\b\d{4}\b/);
  return match ? match[0] : false;
}

// Route for functions  
// `findSummation`
app.post('/findSummation', (req, res) => {
  const num = parseInt(req.body.number);
  const result = findSummation(num);
  res.send(`The summation of numbers from 1 to ${num} is: ${result}`);
});


//`uppercaseFirstandLast`
app.post('/uppercaseFirstandLast', (req, res) => {
  const inputString = req.body.inputString;
  const result = uppercaseFirstandLast(inputString);
  res.send(`Modified string: ${result}`);
});

// `findAverageAndMedian`
app.post('/findAverageAndMedian', (req, res) => {
  const numbers = req.body.numbers.split(',').map(Number);
  const result = findAverageAndMedian(numbers);
  if (result === false) {
      res.send('Invalid input. Please provide a valid array of numbers.');
  } else {
      res.send(`Average: ${result.average}, Median: ${result.median}`);
  }
});

// `find4Digits`
app.post('/find4Digits', (req, res) => {
  const inputString = req.body.inputString;
  const result = find4Digits(inputString);
  res.send(result !== false ? `First four-digit number: ${result}` : 'No four-digit number found.');
});

// phone number validation
app.post('/validatePhoneNumber', (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const isValid = validatePhoneNumber(phoneNumber);
  if (isValid) {
      res.send('The phone number is in the correct format.');
  } else {
      res.send('The phone number is incorrect. Please use the format ddd-ddd-dddd.');
  }
});

// `numOfVisits`
app.get('/numOfVisits', (req, res) => {
  let visits = parseInt(req.cookies.visits) || 0;
  let lastVisit = req.cookies.lastVisit || 'N/A';

  visits += 1;
  const now = new Date();
  const options = { timeZone: 'America/New_York', year: 'numeric', month: 'short', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const formattedDate = now.toLocaleString('en-US', options);

  res.cookie('visits', visits, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year
  res.cookie('lastVisit', formattedDate, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year

  if (visits === 1) {
      res.send('Welcome to my webpage! It is your first time that you are here.');
  } else {
      res.send(`Hello, this is the ${visits} time that you are visiting my webpage.<br>Last time you visited my webpage on: ${lastVisit}`);
  }
});

// exercise1 HTML file
app.get('/exercice1', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'exercice1.html'));
});

// numOfVisits HTML file
app.get('/numOfVisits', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'numOfVisits.html'));
});

// exercise3 HTML file
app.get('/validatePhoneNumber', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'exercice3.html'));
});

  // Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });