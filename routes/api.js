var express = require('express');
var router = express.Router();
const jwt = require ('jsonwebtoken');
const mongoose = require('mongoose');

const authentication = require ('../controller/authCheck')

const UserModel = require('../controller/userSchema');
const BudgetModel = require('../controller/budgetSchema');
const TransactonSchema = require('../controller/transactionSchema');

  //GET route for login 
router.post('/login', async function(req, res, next) {

	//console.log(req.body);
	let username = req.body.user_name;
	let password = req.body.user_password;

	//console.log('pre login');

	var user = {
		/**
		 * This function is responsible for checking user credentials.
		 */
		checkUserCredential: async (username, password) => {
			console.log(`Validating user - username: ${username}, password: ${password}`);

			try{
				
				var result = await UserModel.findOne({Username: username});
				
				if(!result){
					return res.json({message :"The username doesn't exist"});
				}
				const passwordMatch = await result.isValidPassword(password)
				if(!passwordMatch){
					return res.json({message :"Password doesn't match"});
				
				}else {
					//return "Valid username and password";
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

	// POST HTTP request for signup Page
router.post('/signup', async function(req, res, next) {

	const post = new UserModel({
		//_id: mongoose.Schema.Types.ObjectId(),
		Username: req.body.Username,
		FirstName : req.body.FirstName,
		LastName: req.body.LastName,
		Password: req.body.Password,
		Email: req.body.Email
	})
	try {
		const findUser = await UserModel.findOne({Username: req.body.Username});
		if(findUser) {
			res.json({error: "Username is already in use"})
			return;
		} else {
		const postSave = await post.save();
		res.status(200).json({success: true, message : "Successfully Registered"});
		}
	} catch (error) {
		console.log(error)
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

//GET Total Balance by subtracting total debit amount and credit amount
router.get('/totalbalance', authentication, async function(req, res, next) {
	let user_id = req.query.user_id;
	try {
		const totalbalance = await TransactonSchema.aggregate([
			{ 
				$match : {user_id: user_id},
				//Date:{$gte:new Date("2019-01-01T12:21:55.000+00:00"), $lt:new Date("2019-02-05T12:21:55.000+00:00")}
			},
			{
				$group : {_id :null,
				total_Debit:{ $sum: "$Debit_Amount" }, 
				total_Credit: { $sum: "$Credit_Amount"}, 
				count_transaction: { $sum: 1}},			 
			},
			{ 
				"$project":{
				"balance": { "$subtract": ["$total_Debit", "$total_Credit"]}}
			}
		]);
		res.json(totalbalance);
	} catch (error) {
		res.json( {message: error});
	}
});
 //GET Total expense and income amount of the current month
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

//GET Total debit and credit amount
// router.get('/balance', async function(req, res, next) {
// 	try {
// 		const balance = await TransactonSchema.aggregate([
// 			{ 
// 				$match : {user_id:'5d4767d3b768cda660a354ba'}
// 			},
// 			{
// 				$group : {_id :null,
// 				Expense: { $sum: "$Credit_Amount"}, 
// 				Income:{ $sum: "$Debit_Amount" }, 
// 				count_transaction: { $sum: 1 }},			 
// 			}
// 			]);
// 		res.json(balance);
// 	} catch (error) {
// 		res.json( {message: error});
// 	}
// });

router.post('/categories', authentication, async function(req, res, next) {
	let startDate = req.body.start_date;
	let FinishDate = req.body.finish_date;
	let UserID = req.body.userid

	console.log(`Validating - startDate: ${startDate}, FinishDate: ${FinishDate},`);
	console.log(req.body);
	try {
		// Main Categories Transactions
		const mainCategories =  await TransactonSchema.aggregate(
			[
				{ 
				// test UserID: "5d4767d3b768cda660a354ba"
				$match : {user_id: UserID, 
				 Date:{$gte:new Date(startDate), $lt:new Date(FinishDate)}
				// Date:{$gte:new Date("2019-01-01T12:21:55.000+00:00"), $lt:new Date("2019-02-05T12:21:55.000+00:00")}
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


//GET the list of sub-categories (Merchant) with the Credit_Amount spent
router.get('/categories/merchant', authentication, async function(req, res, next) {
	let startDate = req.query.sdate;
	let FinishDate = req.query.fdate;
	let UserID = req.query.uid;
	let category = req.query.category;

	//console.log(req.query);
	//console.log('query-log: ',startDate, FinishDate, UserID, category);

	try {
		const merchant = await TransactonSchema.aggregate(
			[
				{ 
				$match : {user_id:UserID, Categories: category,
				Date:{$gte:new Date(startDate), $lt:new Date(FinishDate)}}
				},
			   {
				$group : {_id : {Merchant: "$Merchant"},
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
//GET the list of sub-categories (Merchant) with the Credit_Amount spent
// router.get('/categories/merchant/groceries', async function(req, res, next) {
// 	try {
// 		const merchant = await TransactonSchema.aggregate(
// 			[
// 				{ 
// 				$match : {user_id:'5d4767d3b768cda660a354ba', Categories: 'Groceries',
// 				Date:{$gte:new Date("2019-01-01T12:21:55.000+00:00"), $lt:new Date("2019-02-05T12:21:55.000+00:00")}}
// 				},
// 			   {
// 				$group : {_id : {Date: "$Date", Merchant: "$Merchant"},
// 				total: { $sum: "$Credit_Amount" }, 
// 				count_transaction: { $sum: 1 }},			 
// 			   },
// 			   { "$sort": { "total": -1 } }
// 			]
// 		)
// 		res.json(merchant);
// 	} catch (error) {
// 		res.json( {message: error});
// 	}
// });


//DELETE Post
// router.delete('/:Id', async function(req, res, next) {
// 	try {
// 		const removePost = await PostSubmit.remove({_id: req.params.Id});
// 		res.json(removePost);
// 	} catch (error) {
// 		res.json( {message: error});
// 	}
// });

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
