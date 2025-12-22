const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing connection to:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('SUCCESS');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE:', err.message);
        process.exit(1);
    });

setTimeout(() => {
    console.log('TIMEOUT');
    process.exit(1);
}, 10000);
