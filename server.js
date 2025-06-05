const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'server/public/uploads')));

// Also serve client/build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/question-bank', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Routes
const questionRoutes = require('./server/routes/questions');
app.use('/api/questions', questionRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
}); 