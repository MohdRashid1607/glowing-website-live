const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files
app.use(express.static('public'));

// MongoDB Connection (Updated)
mongoose.connect('mongodb+srv://2004moras_db_user:mKPBFgtELBO1swUV@cluster0.yasc6li.mongodb.net/')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Routes
app.use('/users', require('./routes/users'));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.use('/auth', require('./routes/auth'));
