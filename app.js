  const session = require('express-session');
  const express = require('express');
  const mongoose = require('mongoose');
  const bodyParser = require('body-parser');
  const bcrypt = require('bcrypt');

  const Note = require('./noteModel');
  const app = express();

  app.set('view engine', 'ejs');
  app.use(express.static('public'));
  app.use(bodyParser.urlencoded({ extended: true }));

  // Connect to MongoDB
  mongoose.connect("mongodb+srv://Akshat_mangal:tmkoc123@atlascluster.m1lktya.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true});

  // Define User Schema
  const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  });

  const newNote = new Note({
    title: String,
    content: String,
  });

  createNoteIfNotExists('My First Note', 'This is the content of my first note.');

  async function createNoteIfNotExists(title, content) {
    const existingNote = await Note.findOne({ title: title });
    if (!existingNote) {
      const newNote = new Note({
        title: title,
        content: content,
      });
      await newNote.save();
      console.log('Note saved successfully');
    } else {
      console.log('Note already exists');
    }
  }




  //   newNote.save()
  //   .then(() => {
  //     console.log('Note saved successfully');
  //   })
  //   .catch((err) => {
  //     console.error('Error saving note:', err);
  //   });

  const User = mongoose.model('User', userSchema);


  app.use(session({
    secret: 'e815f9452c4e3bbd3bde9406dcc87aebfedecdc91fec72f02a9a147000de971a', // Replace with your own secret key
    resave: false,
    saveUninitialized: true
  }));


  app.get('/', (req, res) => {
  res.render('login');
  });

  app.get('/login', (req, res) => {
  res.render('login');
  });

  // app.get('/signup', (req, res) => {
  // res.render('signup');
  // });

  app.post('/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await newUser.save();
    res.redirect('/notes');
  } catch {
    res.redirect('/login');
  }
  });

  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.username = username;// Store the username in the session
      req.session.userId = user._id; // Store the Id in the session
      res.redirect('/notes');
    } else {
        // alert('Wrong Password');
      res.redirect('/login');
    }
  });


  app.get('/notes', async (req, res) => {
    try {
        const userId = req.session.userId;
        console.log(userId); 
        const notes = await Note.find({ user: userId });
    res.render('notes', { username: req.session.username, notes: notes });
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).send('Internal Server Error');
  }
  });


  app.post('/add-note', async (req, res) => {
    const { title, content } = req.body;

    try {
      // Create a new Note document
      const userId = req.session.userId;
      console.log(userId); 
      const newNote = new Note({
        title: title,
        content: content,
        user: userId
      });

      // Save the new note to the database
      await newNote.save();
      console.log('Note added successfully');
      res.redirect('/notes');
    } catch (error) {
      console.error('Error adding note:', error);
      res.redirect('/notes');
    }
  });


  app.post('/delete-note/:note', async(req, res) => {
    const noteIdToDelete = req.params.note;
    try {
      
      await Note.findOneAndDelete({ _id: noteIdToDelete });
      // console.log('Note ID to delete:', noteIdToDelete);
      console.log('Note deleted successfully');
      res.redirect('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      res.redirect('/notes');
    }
  });

  app.get('/logout', (req, res) => {
    req.session.username = null; // Clear the username from the session
    res.redirect('/');
  });
  app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
  });