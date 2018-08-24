const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const localDB = '';

mongoose.connect(localDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


//Define a schema
var Schema = mongoose.Schema;

var UserModelSchema = new Schema({
    username: String,
    password: String,
    superAdmin: Boolean,
    groups: [{
        name: String,
        
    }]
});

// Compile model from schema
var UserModel = mongoose.model('UserModel', UserModelSchema);


/* GET api listing. */
router.get('/', (req, res, next) => {
    res.send('api works');
});


/*GET user group */
router.get('/group', (req, res, next) => {
    var obj = {};
    res.json(obj)
});

/*POST */
router.post('/verify', (req, res, next) => {

});

module.exports = router;