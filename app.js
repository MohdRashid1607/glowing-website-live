const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Serve HTML/CSS/JS
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb+srv://2004moras_db_user:mKPBFgtELBO1swUV@cluster0.yasc6li.mongodb.net/')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// ROUTES
app.use('/auth', require('./routes/auth'));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
