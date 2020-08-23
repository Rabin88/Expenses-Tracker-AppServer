/**
 * This is a main api routes that communicates with client and database through RESTful API. 
 * The client will send the request to the server and sever will process the request to database
 * and send the response back to the client. This class have all necessary API routes used in building
 * Expense Tracker application. On a successful login, server will generate a unique token to each user
 * using 'jsonwebtoken' library. Moreover after successful registration, confirmation email will be sent
 * to a user.
 */


var express = require('express');
var router = express.Router();
const jwt = require ('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const authentication = require ('../controller/authCheck')

const UserModel = require('../controller/userSchema');
const BudgetModel = require('../controller/budgetSchema');
const TransactonSchema = require('../controller/transactionSchema');
const nodemailer = require("nodemailer");


  //GET request for login into the system
router.post('/login', async function(req, res, next) {

	let username = req.body.user_name;
	let password = req.body.user_password;

	var user = {
		/**
		 * This function is responsible for checking user credentials.
		 */
		checkUserCredential: async (username, password) => {
			try{
				//Find username in the database
				var result = await UserModel.findOne({Username: username});
				
				if(!result){
					return res.json({message :"The username doesn't exist"});
				}
				const passwordMatch = await result.isValidPassword(password)
				if(!passwordMatch){
					return res.json({message :"Password doesn't match"});
				
				}else {
					// Generate jwt token
					const token = jwt.sign({
						Username: username,
					},
					"secretkey",{
						expiresIn: '2d'
					});
					return res.json(
						{
							message : "Valid username and password",
							token: token,
							_id: result._id
						}
					);
				}
			}catch(e){
				//console.log('success');
				console.log(e);  
				res.json( {message: 'login unsuccessful'});
			}
		}
	}
	let isValid = await user.checkUserCredential(username, password);
});

	// POST request for signup 
router.post('/signup', async function(req, res, next) {

	 // create reusable transporter object using the Google SMTP transport
	 let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
		  user: 'rabinapp11@gmail.com', 
		  pass: process.env.EmailPassword
		}
	  });

	let EmailDetails = {
		from: "rabinapp11@gmail.com ", // sender address
		to: `${req.body.Email}`, // list of receivers
		subject: "Confirmation Email", // Subject line
		text: `Hello ${req.body.FirstName}! Thank you for registering with the Expense Tracker App. You can now login into your account.`,
	}
	
	const post = new UserModel({
		//_id: mongoose.Schema.Types.ObjectId(),
		Username: req.body.Username,
		FirstName : req.body.FirstName,
		LastName: req.body.LastName,
		Password: req.body.Password,
		Email: req.body.Email
	})
	try {
		// Check if username exist in the database and send response to client
		const findUser = await UserModel.findOne({Username: req.body.Username});
		if(findUser) {
			res.json({error: "Username is already in use"})
		} 
		// Check if exist exist in the database and send response to client
		const confirmEmail = await UserModel.findOne({Email: req.body.Email});
		if(confirmEmail) {
			res.json({emailError: "Email already exist"})
		}
		else {
			// Save users information, if all fields in signup form is filled correctly. 
			// Then, send a confirmation email to a user.
			const postSave = await post.save();
			res.status(200).json({success: true, message : "Successfully Registered"});
			
			await transporter.sendMail(EmailDetails, function (err, data){
				if(err){
					console.log("Email Declined: ", err);
				} else {
					console.log("Email sent successfully!!!");
				}
			})
		}
	} catch (error) {
		//console.log(error)
		res.status(400).json( {success: false, message: error});
	}
});

	// POST request of category amount for the current month, which is required for set budget
router.post('/budget', authentication,async function(req, res, next) {

	const post = new BudgetModel({
		user_id: req.body.user_id,
		categories : req.body.categories,
		amount: req.body.amount,
	})
	try {
		const postSave = await post.save();
		res.status(200).json({success: true, message : "Successfully budget saved"});
	} catch (error) {
		console.log(error)
		res.status(400).json( {success: false, message: error});
	}
});

	// GET request for set Budget for saved data
router.get('/budget',authentication, async function(req, res, next) {

	let user_id = req.query.user_id;
	
	try {
		var result = await BudgetModel.find({user_id: user_id});
		res.json(result);
	} catch (error) {
		res.json( {message: error});
	}
});

//GET  resquest for Total Balance 
router.get('/totalbalance', authentication, async function(req, res, next) {
	let user_id = req.query.user_id;
	try {
		// Query to calculate total balance by subtracting total credit amount from debit amount
		const totalbalance = await TransactonSchema.aggregate([
			{ 	
				$match : {user_id:user_id},
			},
			{
				$group : {_id :null,
				total_Debit:{ $sum: "$Debit_Amount" }, 
				total_Credit: { $sum: "$Credit_Amount"}, 
				count_transaction: { $sum: 1}},			 
			},
			{ 
				"$project":{
				balance: { "$subtract": ["$total_Debit", "$total_Credit"]}}
			}
		]);
		res.json(totalbalance);
	} catch (error) {
		res.json( {message: error});
	}
});

 //GET request for Total expense and income amount of the current month
router.post('/expenses', authentication, async function(req, res, next) {
	let startDate = req.body.start_date;
	let FinishDate = req.body.finish_date;
	let UserID = req.body.userid
	try {
		
		const balance = await TransactonSchema.aggregate([
			{ 
				$match : {user_id: UserID,
				Date:{$gte:new Date(startDate), $lt:new Date(FinishDate)}}
			},
			{
				$group : {_id :null,
				Expense: { $sum: "$Credit_Amount"}, 
				Income:{ $sum: "$Debit_Amount" }, 
				count_transaction: { $sum: 1 }},			 
			}
			]);
		res.json(balance);
	} catch (error) {
		res.json( {message: error});
	}
});


// POST request for categories to get the transaction categories data
router.post('/categories', authentication, async function(req, res, next) {
	let startDate = req.body.start_date;
	let FinishDate = req.body.finish_date;
	let UserID = req.body.userid

	console.log(`Validating - startDate: ${startDate}, FinishDate: ${FinishDate},`);
	console.log(req.body);
	try {
		const mainCategories =  await TransactonSchema.aggregate(
			[
				{ 
				$match : {user_id: UserID, 
				 Date:{$gte:new Date(startDate), $lt:new Date(FinishDate)}
				}
				},
			   {
				$group : {_id : {Categories: "$Categories"},
				total: { $sum: "$Credit_Amount" }, 
				count_transaction: { $sum: 1 }},			 
			   },
			   { "$sort": { "total": -1 } }
			]
		);
		res.json(mainCategories);
	} catch (error) {
		res.json( {message: error});
	}
});


//GET request for the list of Transactions (Merchant) with the Credit_Amount spent
router.get('/categories/merchant', authentication, async function(req, res, next) {
	let startDate = req.query.sdate;
	let FinishDate = req.query.fdate;
	let UserID = req.query.uid;
	let category = req.query.category;

	try {
		const merchant = await TransactonSchema.aggregate(
			[
				{ 
				$match : {user_id:UserID, Categories: category,
				Date:{$gte:new Date(startDate), $lt:new Date(FinishDate)}}
				},
			   {    //_id : {Merchant: "$Merchant"} if we need to add two merchant together
				$group : {_id : {Date: "$Date", Merchant: "$Merchant"},
				total: { $sum: "$Credit_Amount" }, 
				count_transaction: { $sum: 1 }},			 
			   },
			   { "$sort": { "total": -1 } }
			]
		)
		res.json(merchant);
	} catch (error) {
		res.json( {message: error});
	}
});


//GET request for monthly expenses and income in Budget Forecast screen
router.get('/monthlyBudget', authentication, async function(req, res, next) {
	try {
		let user_id = req.query.user_id;
		const merchant = await TransactonSchema.aggregate(
			[
				{ 
				$match : {user_id: user_id}
				//Date:{$gte:new Date(startDate), $lt:new Date(FinishDate)}}
				},
			   {
				$group : {_id : {"$month": "$Date"},
				expenses: { $sum: "$Credit_Amount" },
				income: { $sum: "$Debit_Amount" },
				count_transaction: { $sum: 1}},
			   },
				{"$sort": {"_id": 1}}		 
			]
		)
		res.json(merchant);
	} catch (error) {
		res.json( {message: error});
	}
});

//GET request for total sum of monthly expenses
router.get('/monthlyBudget/sum', async function(req, res, next) {
	try {
		const merchant = await TransactonSchema.aggregate(
			[
				{ 
				$match : {user_id:"5d4767d3b768cda660a354ba"}
				//Date:{$gte:new Date(startDate), $lt:new Date(FinishDate)}}
				},
			   {
				$group : {_id : {"$month": "$Date"},
				expenses: { $sum: "$Credit_Amount" },
				income: { $sum: "$Debit_Amount" },
				count_transaction: { $sum: 1}}		 
			   },
			   {
				$group : {_id : null,
				totalexpenses: { $sum: "$expenses" },
				totalincome: { $sum: "$income" },
				count_transaction: { $sum: 1},
				}		 
			   },
			   { 
				"$project":{
				totalexpense: { $sum: "$totalexpenses"},
				totalincome: { $sum: "$totalincome"},
				averageExpense: {$divide: ["$totalexpenses", "$count_transaction"]},
				averageIncome: {$divide: ["$totalincome", "$count_transaction"]}}
				}
			]
		)
		res.json(merchant);
	} catch (error) {
		res.json( {message: error});
	}
});

// Testing get request
router.get('/test', async function(req, res, next) {
	res.json( {message: "this is a test message from server!!"});
});

module.exports = router;
