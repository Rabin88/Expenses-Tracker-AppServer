var express = require('express');
var router = express.Router();
const jwt = require ('jsonwebtoken');
const mongoose = require('mongoose');
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
										token: token,
										_id: result._id
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

//GET Total debit and credit amount
router.get('/balance', async function(req, res, next) {
	try {
		const balance = await TransactonSchema.aggregate([
			{ 
				$match : {user_id:'5d282ff16cbfe7be5df95615'}
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

//GET Total Balance by subtracting total debit amount and credit amount
router.get('/totalbalance', async function(req, res, next) {
	try {
		const totalbalance = await TransactonSchema.aggregate([
			{ 
				$match : {user_id:'5d282ff16cbfe7be5df95615'}
			},
			{
				$group : {_id :null,
				total_Debit:{ $sum: "$Debit_Amount" }, 
				total_Credit: { $sum: "$Credit_Amount"}, 
				count_transaction: { $sum: 1 }},			 
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
//POST route for the Main Categories Transactions
router.post('/categories', async function(req, res, next) {
	let startDate = req.body.start_date;
	let FinishDate = req.body.finish_date;

	console.log(`Validating - startDate: ${startDate}, FinishDate: ${FinishDate}`);
	try {
		// Main Categories Transactions
		const mainCategories = await TransactonSchema.aggregate(
			[
				{ 
				$match : {user_id:'5d282ff16cbfe7be5df95615', 
				Date:{$gte:new Date(startDate), $lt: new Date(FinishDate)} }
				},
			   {
				$group : {_id : {Categories: "$Categories"},
				total: { $sum: "$Credit_Amount" }, 
				count_transaction: { $sum: 1 }},			 
			   },
			   { "$sort": { "total": -1 } }
			]
		)
		res.json(mainCategories);
	} catch (error) {
		res.json( {message: error});
	}
});

//GET for the Main Categories Transactions

// router.get('/categories', async function(req, res, next) {
// 	try {
// 		// Main Categories Transactions
// 		const mainCategories = await TransactonSchema.aggregate(
// 			[
// 				{ 
// 				$match : {user_id:'5d282ff16cbfe7be5df95615', 
// 				Date:{$gte:new Date("2019-01-01T12:21:55.000+00:00"), $lt:new Date("2019-02-05T12:21:55.000+00:00")} }
// 				},
// 			   {
// 				$group : {_id : {Categories: "$Categories"},
// 				total: { $sum: "$Credit_Amount" }, 
// 				count_transaction: { $sum: 1 }},			 
// 			   }
// 			]
// 		)
// 		res.json(mainCategories);
// 	} catch (error) {
// 		res.json( {message: error});
// 	}
// });

//GET the list of sub-categories (Merchant) with the Credit_Amount spent
router.get('/categories/merchant/food', async function(req, res, next) {
	try {
		const merchant = await TransactonSchema.aggregate(
			[
				{ 
				$match : {user_id:'5d282ff16cbfe7be5df95615', Categories: 'Food',
				Date:{$gte:new Date("2019-01-01T12:21:55.000+00:00"), $lt:new Date("2019-02-05T12:21:55.000+00:00")}}
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
router.get('/categories/merchant/groceries', async function(req, res, next) {
	try {
		const merchant = await TransactonSchema.aggregate(
			[
				{ 
				$match : {user_id:'5d282ff16cbfe7be5df95615', Categories: 'Groceries',
				Date:{$gte:new Date("2019-01-01T12:21:55.000+00:00"), $lt:new Date("2019-02-05T12:21:55.000+00:00")}}
				},
			   {
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
//GET the list of sub-categories (Merchant) with the Credit_Amount spent
router.get('/categories/merchant/shopping', async function(req, res, next) {
	try {
		const merchant = await TransactonSchema.aggregate(
			[
				{ 
				$match : {user_id:'5d282ff16cbfe7be5df95615', Categories: 'Shopping',
				Date:{$gte:new Date("2019-01-01T12:21:55.000+00:00"), $lt:new Date("2019-02-05T12:21:55.000+00:00")}}
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
router.get('/categories/merchant/travel', async function(req, res, next) {
	try {
		const merchant = await TransactonSchema.aggregate(
			[
				{ 
				$match : {user_id:'5d282ff16cbfe7be5df95615', Categories: 'Travel',
				Date:{$gte:new Date("2019-01-01T12:21:55.000+00:00"), $lt:new Date("2019-02-05T12:21:55.000+00:00")}}
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
router.get('/categories/merchant/housing', async function(req, res, next) {
	try {
		const merchant = await TransactonSchema.aggregate(
			[
				{ 
				$match : {user_id:'5d282ff16cbfe7be5df95615', Categories: 'Housing',
				Date:{$gte:new Date("2019-01-01T12:21:55.000+00:00"), $lt:new Date("2019-02-05T12:21:55.000+00:00")}}
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
router.get('/categories/merchant/bills', async function(req, res, next) {
	try {
		const merchant = await TransactonSchema.aggregate(
			[
				{ 
				$match : {user_id:'5d282ff16cbfe7be5df95615', Categories: 'Bills',
				Date:{$gte:new Date("2019-01-01T12:21:55.000+00:00"), $lt:new Date("2019-02-05T12:21:55.000+00:00")}}
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
router.get('/categories/merchant/others', async function(req, res, next) {
	try {
		// const merchant = await TransactonSchema.find(
		// 	{user_id:'5d282ff16cbfe7be5df95615', Categories: 'Others', 
		// 	Date:{$gte:new Date("2019-01-01T12:21:55.000+00:00"), $lt:new Date("2019-02-05T12:21:55.000+00:00")}},
		// 	{_id:0, Merchant: 1,Credit_Amount:1});

		const merchant = await TransactonSchema.aggregate(
			[
				{ 
				$match : {user_id:'5d282ff16cbfe7be5df95615', Categories: 'Others',
				Date:{$gte:new Date("2019-01-01T12:21:55.000+00:00"), $lt:new Date("2019-02-05T12:21:55.000+00:00")}}
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
