const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./database'); 

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const petRoutes = require('./routes/petRoutes')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend running');
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/pets', petRoutes);

connectToDatabase(); 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});