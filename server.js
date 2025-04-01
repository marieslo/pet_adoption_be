const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./database'); 

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const petRoutes = require('./routes/petRoutes')
const postRoutes = require('./routes/postRoutes')

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:8080',
  'https://pet-adoption-fe.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend running');
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/pets', petRoutes);
app.use('/posts', postRoutes);

connectToDatabase(); 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});