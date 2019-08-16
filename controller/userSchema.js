const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;


let mongoUser = 'rabin';
let mongoPass = encodeURIComponent('Thames@09');
let connectionStr = `mongodb+srv://${mongoUser}:${mongoPass}@cluster0-yazdi.mongodb.net/FinanceApp?retryWrites=true&w=majority`; 
mongoose.connect(connectionStr, {useNewUrlParser: true});


var schema = new mongoose.Schema({
	//_id: {type: mongoose.Schema.Types.ObjectId},
	Username : {type: String , required: true, minlength:4},
	FirstName : {type: String, required: true},
	LastName : {type: String, required: true},
	// special characters + number + lower and uppercase    match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,1024}$/
	Password : {type: String, required: true, minlength:5, match: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z0-9])/ },
	Email : {type: String ,required: true,
		//match: /^(([^<>()[]\.,;:s@"]+(.[^<>()[]\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/},
		match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/},
	
	Date: {type: Date, default: Date.now, required: true}
})
	
schema.pre('save', async function (next) {
	try {
		const salt = await bcrypt.genSalt(10)
		const hashPassword = await bcrypt.hash(this.Password, salt)
		//console.log(this.Password)
		this.Password = hashPassword
		//console.log (hashPassword)
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
