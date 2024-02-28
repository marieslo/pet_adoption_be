const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./database'); 

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const petRoutes = require('./routes/petRoutes')

const app = express();

app.use(cors({ credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend running');
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/pets', petRoutes);

connectToDatabase(); 

module.exports = app;