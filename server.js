const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const bodyParser = require('body-parser');
const blogRoutes = require('./routes/blogRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static('static'));

// Routes
app.use('/api', authRoutes);
app.use('/blogs', blogRoutes);

// Serve HTML pages
app.get('/', (_, res) => res.redirect('/signup.html'));

// DB & Server Start
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  app.listen(3000, () => console.log("Server running on http://localhost:3000"));
})
.catch(err => console.error("MongoDB connection error:", err));
