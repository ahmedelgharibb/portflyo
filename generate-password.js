const bcrypt = require('bcrypt');

const password = 'your-chosen-password'; // Replace this with your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error generating hash:', err);
        return;
    }
    console.log('Your hashed password is:', hash);
    console.log('Use this hash in your server.js HASHED_PASSWORD constant');
}); 