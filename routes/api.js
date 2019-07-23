var express = require('express');
var router = express.Router();
const jwt = require ('jsonwebtoken');
//const mongoose = require('mongoose');
//const loginAuthCheck = require ('../controller/authCheck')

const UserModel = require('../controller/userSchema');
const TransactonSchema = require('../controller/transactionSchema');

router.post('/login', async function(req, res, next) {

	console.log(req.body);
	let username = req.body.user_name;
	let password = req.body.user_password;

	console.log('pre login');

		var user = {
			/**
			 * This function is responsible for checking user credentials.
			 */
			checkUserCredential: async (username, password) => {
				console.log(`Validating user - username: ${username}, password: ${password}`);

				try{
					console.log('aa');
					var result = await UserModel.findOne({Username: username, Password: password});
						//var result = await PostSubmit.find({Username: username, Password: password});
						//var result = await PostSubmit.findOne({Password: password});

						if(result){
								//return "Valid username and password";
								const token = jwt.sign({
									Username:username
								},
								"secretkey",{
									expiresIn: '10m'
								});
								return res.json(
									{
										message : "Valid username and password",
										token: token
									}
								);
				
						}else{
								console.log('cc');
								//return "Invalid, Please provide valid username and password"
								res.json({message :"Invalid, Please provide valid username and password"});
								return;
						}
				}catch(e){
					//console.log('success');
					console.log(e);  
					res.json( {message: e});
				}
			}
	}
	//This line is for my understanding and doesn't execute
	let isValid = await user.checkUserCredential(username, password);
	// let  jsonObj= {"status": isValid, "error": false};
	// res.json(jsonObj);
});
// POST HTTP request for signup Page
router.post('/signup', async function(req, res, next) {

	const post = new UserModel({
		//_id: new mongoose.Schema.Types.ObjectId(),
		Username: req.body.Username,
		FirstName : req.body.FirstName,
		LastName: req.body.LastName,
		Password: req.body.Password,
		Email: req.body.Email
	})
	try {
		//if(!req.body) return res.sendStatus(400);
		const postSave = await post.save();
		res.status(200).json({success: true, message : "Successfully Registered"});
	} catch (error) {
		console.log(error)
		res.status(400).json( {success: false, message: error});
	}
	});

//DELETE Post
router.delete('/:Id', async function(req, res, next) {
	try {
		const removePost = await PostSubmit.remove({_id: req.params.Id});
		res.json(removePost);
	} catch (error) {
		res.json( {message: error});
	}
});

// //GET 
// router.get('/submit/:Id', async function(req, res, next) {
//   try {
//     const id = await PostSubmit.findById(req.params.Id);
//     res.json(id);
//   } catch (error) {
//     res.json( {message: error});
//   }
// });


module.exports = router;
