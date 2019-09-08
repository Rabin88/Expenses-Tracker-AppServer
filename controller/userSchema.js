/**
 * This is a userSchema class which is used to make users schema. The users schema has
 * Username, FirstName, LastName, Password and Email as a Field. The validation is done in user schema,
 * where username minlength must be 4, password minlength must be 5 and should contain at least one number and letter.
 * Email is validated using regular expression. In addition password is hashed using 'bcrypt' library.
 */


const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// connecting to MongoDB
let mongoUser = 'rabin';
let mongoPass = encodeURIComponent('Thames@09');
let connectionStr = `mongodb+srv://${mongoUser}:${mongoPass}@cluster0-yazdi.mongodb.net/FinanceApp?retryWrites=true&w=majority`; 
mongoose.connect(connectionStr, {useNewUrlParser: true});

// Users Schema
var schema = new mongoose.Schema({
	//_id: {type: mongoose.Schema.Types.ObjectId},
	Username : {type: String , required: true, minlength:4},
	FirstName : {type: String, required: true},
	LastName : {type: String, required: true},
	Password : {type: String, required: true, minlength:5, match: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z0-9])/ },
	Email : {type: String ,required: true,
		match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/},
	
	Date: {type: Date, default: Date.now, required: true}
})
	
schema.pre('save', async function (next) {
	try {
		const salt = await bcrypt.genSalt(10)
		const hashPassword = await bcrypt.hash(this.Password, salt)
		this.Password = hashPassword
		next();
	}catch (error){
		next (error);
	}	 
});
schema.methods.isValidPassword = async function (dbPassword){
	try{
		return await bcrypt.compare(dbPassword, this.Password)
	} catch (error){
		throw new Error(error)
	}
}

 //	var UserModel = mongoose.model('Users', schema, 'Users' );
module.exports = mongoose.model('Users', schema, 'Users');
