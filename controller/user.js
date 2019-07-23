const mongoose = require('mongoose');

let mongoUser = 'xxxxxxxx';
let mongoPass = encodeURIComponent('xxxxxxxxx');
let connectionStr = `mongodb+srv://${mongoUser}:${mongoPass}@cluster0-yazdi.mongodb.net/FinanceApp?retryWrites=true&w=majority`; 
mongoose.connect(connectionStr, {useNewUrlParser: true});


var schema = new mongoose.Schema({
	Username : {type: String , required: true},
	FirstName : {type: String, required: true},
	LastName : {type: String, required: true},
	Password : {type: String, required: true},
	Email : {type: String ,required: true, required: true,
		match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/},
	Date: {type: Date, default: Date.now}
})
 //	var UserModel = mongoose.model('Users', schema, 'Users' );
module.exports = mongoose.model('Users', schema, 'Users');
