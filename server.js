const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./database'); 

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const petRoutes = require('./routes/petRoutes');

const app = express();

app.use(cors({ credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);

connectToDatabase(); 

module.exports = app;