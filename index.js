const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();  // Import sqlite3
const app = express();
const session = require('express-session');
const bcrypt = require('bcrypt');
// const multer = require('multer'); // For image upload
// const fs = require('fs');

const PAGE_SIZE = 6; // Number of vehicles per page

// Set up session
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
}));

// Set up the view engine to use EJS
app.set('view engine', 'ejs');

// Parse application/x-www-form-urlencoded (form data)
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files (CSS, JS, Images)
app.use(express.static('public'));

app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Initialize SQLite Database (Create or open the database file)
const db = new sqlite3.Database('./jaysauto_db.db', (err) => {
  if (err) {
    console.error("Error opening database", err);
  } else {
    console.log("Database connected successfully");
  }
});

// Home route
// app.get('/', (req, res) => {
//   res.render('index', { errors: [], title: 'Home', user: req.session.user || null });

// });
app.get('/', (req, res) => {
  const query = `SELECT * FROM t_vehicles WHERE active = 1 ORDER BY id DESC LIMIT 3`;
  const errors = [];

  db.all(query, [], (err, rows) => {
      if (err) {
          console.error('Error retrieving comments:', err.message);
          res.status(500).send('Error retrieving comments.');
      } else {
          res.render('index', { title: 'Home', vehicles: rows, user: req.session.user || null, errors: errors || null });
      }
  });
});


// Submission Route
app.post('/submit-form', (req, res) => {
  const { name, email, phone, msg } = req.body;

  // Local errors array for this request
  const errors = [];

  // Validate form data (server-side)
  if (!name) errors.push("Name is required.");
  if (!email || !email.includes('@')) errors.push("Valid email is required.");
  if (!phone || isNaN(phone) || phone.length !== 10) errors.push("Phone number must be 10 digits.");
  if (!msg) errors.push("Message is required.");

  // If there are errors, send them back to the form page
  if (errors.length > 0) {
    console.log("Form data not valid");
    return res.render('index', { errors, title: 'Home', user: req.session.user || null });
  }

  // Insert form data into SQLite database
  const stmt = db.prepare('INSERT INTO t_enquiries (name, email, phone, message) VALUES (?, ?, ?, ?)');
  stmt.run(name, email, phone, msg, function(err) {
    if (err) {
      console.error("Error inserting data into database", err);
      return res.render('index', { errors: ["Database error. Please try again later."], title: 'Home' });
    }

    // Data inserted successfully
    const moto = `${name}, Your Inquiry has been Created Successfully!`;
    const _value = ``;
    const _value1 = `Name: ${name}`;
    const _value2 = `Email: ${email}`;
    const _value3 = `Phone Number: ${phone}`;
    const _value4 = `Your Message: ${msg}`;
    const _value5 = ``;
    const _value6 = ``;
    const _value7 = ``;
    console.log("New Inquiry Recieved.");

    res.render('thank-you', { moto, _value, _value1, _value2, _value3, _value4, _value5, _value6, _value7 });
  });

  stmt.finalize();
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Vehicles Route
// app.get('/vehicles', (req, res) => {
//   res.render('vehicles', { errors: [], title: 'Vehicles' });
// });

// Route to fetch vehicles with pagination
app.get('/vehicles', (req, res) => {
  let page = parseInt(req.query.page) || 1; // Get the page number from query param
  let offset = (page - 1) * PAGE_SIZE;

  // Get total number of vehicles
  db.get(`SELECT COUNT(*) AS count FROM t_vehicles WHERE active = 1`, (err, result) => {
      if (err) {
          console.error('Error fetching vehicle count:', err.message);
          return res.status(500).send('Error retrieving vehicle count.');
      }

      let totalVehicles = result.count;
      let totalPages = Math.ceil(totalVehicles / PAGE_SIZE);

      // Fetch paginated vehicles
      const query = `SELECT * FROM t_vehicles WHERE active = 1 ORDER BY id DESC LIMIT ? OFFSET ?`;
      db.all(query, [PAGE_SIZE, offset], (err, rows) => {
          if (err) {
              console.error('Error retrieving vehicles:', err.message);
              return res.status(500).send('Error retrieving vehicle data.');
          }

          res.render('vehicles', {
              title: 'Available Vehicles',
              vehicles: rows,
              currentPage: page,
              totalPages: totalPages,
              user: req.session.user || null
          });
      });
  });
});


////API
// Endpoint to fetch vehicle details by ID
app.get('/vehicle/details/:id', (req, res) => {
  const vehicleId = req.params.id; // Get vehicle ID from the URL parameters

  // Query to fetch vehicle details
  const query = `SELECT * FROM vw_vehicle_info WHERE id = ?`;

  db.get(query, [vehicleId], (err, row) => {
      if (err) {
          console.error('Error fetching vehicle details:', err.message);
          return res.status(500).send('Error fetching vehicle details');
      }

      if (row) {
          // Send vehicle details as JSON response
          res.json({
              id: row.id,
              yom: row.yom,
              engine: row.engine,
              body: row.body,
              millege: row.millege,
              other: row.other,
              gear: row.gear,
              fuel: row.fuel,
              codition: row.codition // Adjust to match the actual column in your database
          });
      } else {
          // If no vehicle found
          res.status(404).send('Vehicle data not found');
      }
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// About Us Route
// app.get('/about', (req, res) => {
//   // Example: you might want to set 'moto' based on session data or a query
//   //let moto = null;  // or some other logic to set moto
//   res.render('about', { errors: [], title: 'About Us'});
// });

// Fetch latest 5 comments
app.get('/about', (req, res) => {
  const query = `SELECT * FROM t_comment ORDER BY id DESC LIMIT 5`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error retrieving comments:', err.message);
      res.status(500).send('Error retrieving comments.');
    } else {
      res.render('about', { title: 'About Us', comments: rows, user: req.session.user || null });
    }
  });
});

// Submission Route
app.post('/about-form', (req, res) => {
  const { commentName, commentMessage, rating } = req.body;

  // Local errors array for this request
  const errors = [];

  // Validate form data (server-side)
  if (!commentName) errors.push("Name is required.");
  if (!commentMessage && !rating) errors.push("Comment or Rating is required.");

  // If there are errors, send them back to the form page
  if (errors.length > 0) {
    console.log("Form data not valid");
    return res.render('about', { errors, title: 'About Us', user: req.session.user || null });
  }

  // Insert form data into SQLite database
  const stmt = db.prepare('INSERT INTO t_comment (uname, comment, rate) VALUES (?, ?, ?)');
  stmt.run(commentName, commentMessage, rating, function(err) {
    if (err) {
      console.error("Error inserting data into database", err);
      return res.render('about', { errors: ["Database error. Please try again later."], title: 'About Us' });
    }

    // Data inserted successfully, fetch the latest comments again
    console.log("New Feedback Received.");

    // Fetch the latest comments to render after insertion
    const query = `SELECT * FROM t_comment ORDER BY id DESC LIMIT 5`;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error retrieving comments:', err.message);
        res.status(500).send('Error retrieving comments.');
      } else {
        // Render the about page with updated comments
        res.render('about', { title: 'About Us', comments: rows, user: req.session.user || null });
      }
    });
  });

  stmt.finalize();
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Services Route
app.get('/services', (req, res) => {
  res.render('services', { errors: [], title: 'Services', user: req.session.user || null });
});

// Services Submission Route
app.post('/submit-appoinment', (req, res) => {
  const { name, email, phone, service, date, time, message } = req.body;

  // Local errors array for this request
  const errors = [];

  // Validate form data (server-side)
  if (!name) errors.push("Name is required.");
  if (!phone || isNaN(phone) || phone.length !== 10) errors.push("Phone number must be 10 digits.");
  if (!service) errors.push("Service is required.");
  if (!date) errors.push("Date is required.");
  if (!time) errors.push("Time is required.");

  // If there are errors, send them back to the form page
  if (errors.length > 0) {
    console.log("Form data not valid");
    return res.render('services', { errors, title: 'Services', user: req.session.user || null });
  }

  // Insert form data into SQLite database
  const stmt = db.prepare('INSERT INTO t_appoinment (name, email, phone, service, date, time, message) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(name, email, phone, service, date, time, message, function(err) {
    if (err) {
      console.error("Error inserting data into database", err);
      return res.render('services', { errors: ["Database error. Please try again later."], title: 'Services' });
    }

    // Query to fetch the latest appointment ID
    db.get('SELECT id FROM t_appoinment ORDER BY id DESC LIMIT 1', (err, row) => {
      if (err) {
        console.error("Error fetching data from the database", err);
        return res.status(500).send("Error fetching data.");
      }

      // Use the latest appointment ID from the query
      const latestAppointmentId = row ? row.id : 'No appointments found';

      // Data inserted successfully
      const moto = `${name}, Your Appointment has been Created Successfully!`;
      const _value = `Your Appointment Number is ${latestAppointmentId}`;
      const _value1 = `Name: ${name}`;
      const _value2 = `Email: ${email}`;
      const _value3 = `Phone Number: ${phone}`;
      const _value4 = `Service: ${service}`;
      const _value5 = `Date: ${date}`;
      const _value6 = `Time: ${time}`;
      const _value7 = `Message: ${message}`;
      console.log("New Appointment Created.");

      res.render('thank-you', { moto, _value, _value1, _value2, _value3, _value4, _value5, _value6, _value7 });
    });
  });

  stmt.finalize();
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Profile Route
// app.get('/profile', (req, res) => {
//   res.render('profile', { errors: [], title: 'My Profile', user: req.session.user || null });
// });
// app.get('/profile', (req, res) => {
//   // Check if user is logged in by verifying req.session.user
//   if (!req.session.user) {
//     // If no user session exists, redirect to login page
//     return res.redirect('/login');
//   }

//   // If user session exists, render the profile page
//   res.render('profile', { errors: [], title: 'My Profile', user: req.session.user });
// });

app.get('/profile', (req, res) => {
  // Check if user is logged in by verifying req.session.user
  if (!req.session.user) {
      // If no user session exists, redirect to login page
      return res.redirect('/login');
  }

  const usrID = req.session.user.id;  // Assuming `req.session.user` contains an `id` field

  // Validate the user ID (optional but recommended)
  if (!usrID) {
      return res.redirect('/login');
  }

  const query = `SELECT * FROM vw_user_cart WHERE usr = ? ORDER BY id DESC`;

  // Execute the query with the user ID as a parameter
  db.all(query, [usrID], (err, rows) => {
      if (err) {
          console.error('Error retrieving appointments:', err.message);
          return res.status(500).send('Error retrieving appointments.');
      } else {
          // Log each service if needed
          // rows.forEach(row => {
          //     console.log(row.service);  // Assuming `service` is a column
          // });

          res.render('profile', {
              title: 'My Profile',
              cart: rows,  // Pass the fetched appointments to the view
              user: req.session.user  // User session info
          });
      }
  });
});


// Profile Submission Route
app.post('/updateProfile', async (req, res) => {
  const { fname, lname, dob, email, phone, upassword } = req.body;

  // Local errors array for this request
  const errors = [];

  // Validate form data (server-side)
  if (!fname) errors.push("First Name is required.");
  if (!dob) errors.push("Date of Birth is required.");
  if (!email || !email.includes('@')) errors.push("Valid email is required.");
  if (!phone || isNaN(phone) || phone.length !== 10) errors.push("Phone number must be 10 digits.");
  if (!upassword) errors.push("Password is required.");

  // If there are errors, send them back to the form page
  if (errors.length > 0) {
    console.log("Form data not valid");
    return res.render('profile', { errors, title: 'My Profile', user: req.session.user || null });
  }

  try {
    // Hash the password before updating
    const hashedPassword = await bcrypt.hash(upassword, 10);

    // Database query to update the user profile
    const query = `UPDATE users SET fname = ?, lname = ?, dob = ?, email = ?, phone = ?, password = ? WHERE id = ?`;

    // Run the update query
    db.run(query, [fname, lname, dob, email, phone, hashedPassword, req.session.user.id], function (err) {
      if (err) {
        console.error("Error updating data into database", err);
        return res.render('profile', { errors: ["Database error. Please try again later."], title: 'My Profile', user: req.session.user || null });
      }

      console.log("Profile Updated.");

      // After update, update the session user data with the new information
      req.session.user.fname = fname;
      req.session.user.lname = lname;
      req.session.user.dob = dob;
      req.session.user.email = email;
      req.session.user.phone = phone;

      // Redirect to profile page to show updated data
      res.redirect('/profile');
    });

  } catch (err) {
    console.error("Error hashing password:", err);
    return res.render('profile', { errors: ["Error processing your request. Please try again."], title: 'My Profile', user: req.session.user || null });
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// View Submissions Route
app.get('/view-submissions', (req, res) => {
  db.all('SELECT * FROM t_enquiries ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      console.error("Error fetching data from the database", err);
      return res.status(500).send("Error fetching data.");
    }

    res.render('view-submissions', { submissions: rows, title: 'View Submissions' });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Render Login Page
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login', errorMessage: null, user: req.session.user || null });
});

// Handle Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = ?`;

  db.get(query, [email], async (err, user) => {
      if (err) {
          console.error('Error fetching user:', err.message);
          return res.status(500).send('Internal Server Error');
      }

      if (!user) {
          console.log('User Did not Match with the Database');
          return res.render('login', { title: 'Login', errorMessage: 'Invalid Credentials', user: req.session.user || null });
      }

      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
          return res.render('login', { title: 'Login', errorMessage: 'Invalid email or password', user: req.session.user || null  });
      }

      // Save user session with relevant information
      req.session.user = {
          id: user.id,
          email: user.email,
          name: user.fname,  // Make sure you're storing the correct user info in the session
          lname: user.lname,
          dob: user.dob,
          phone: user.phone
      };

      console.log('User Login Success!', req.session.user.name); // Log the user's name from session after login

      // Redirect to home page or dashboard after successful login
      res.redirect('/');
  });
});


// Logout
app.post('/logout', (req, res) => {
  // Destroy the session to log the user out
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/'); // Redirect to home if there's an error
    }
    console.log('User Logout Success!');
    res.redirect('/login'); // Redirect to login page after successful logout
  });
});


// Protected Dashboard Route
app.get('/', (req, res) => {
  if (!req.session.user) {
      return res.redirect('/login');
  }
  res.render('index', { title: 'Home', user: req.session.user });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Render registration page
app.get('/register', (req, res) => {
  res.render('register', { title: 'Register', errorMessage: null, user: req.session.user || null });
});

// Handle user registration
app.post('/submit-register', async (req, res) => {
  const { firstName, lastName, dob, email, phone, image, password, confirmPassword } = req.body;

  // Ensure password is not empty
  if (!password || password.trim() === '') {
    return res.render('register', { title: 'Register', errorMessage: 'Password is required' });
  }

  // Validate passwords match
  if (password !== confirmPassword) {
    return res.render('register', { title: 'Register', errorMessage: 'Passwords do not match' });
  }

  try {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check if email already exists in the database
    const checkEmailQuery = `SELECT COUNT(*) AS count FROM users WHERE email = ?`;
    db.get(checkEmailQuery, [email], (err, row) => {
      if (err) {
        console.error('Error checking email:', err.message);
        return res.render('register', { title: 'Register', errorMessage: 'Something went wrong, please try again later.' });
      }

      if (row.count > 0) {
        return res.render('register', { title: 'Register', errorMessage: 'Email already exists' });
      }

      // Insert user into the database
      const query = `INSERT INTO users (fname, lname, dob, email, phone, image, password) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.run(query, [firstName, lastName, dob, email, phone, image, hashedPassword], function (err) {
        if (err) {
          console.error('Error inserting data:', err.message);
          return res.render('register', { title: 'Register', errorMessage: 'Error during registration, please try again.' });
        }
        console.log('User registered:', this.lastID);
        res.redirect('/login');
      });
    });

  } catch (err) {
    console.error('Error hashing password:', err.message);
    return res.render('register', { title: 'Register', errorMessage: 'Error during registration, please try again.' });
  }
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
