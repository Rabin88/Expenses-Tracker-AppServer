const mongoose = require('mongoose');

var transactions = new  mongoose.Schema({
	user_id: {
		type:mongoose.Schema.Types.ObjectId,
		//ref: "Users",
		required: true
	},
	Merchant: {type: String, required: true},
	Categories: {type: String, required: true},
	Credit_Amount: {type: Number, required: true},
	Debit_Amount: {type: Number, required: true},
	Date: {type: Date, default: Date.now, required: true}
})
var TransactonSchema = mongoose.model('Transactions', transactions, 'Transactions' );
  module.exports =  TransactonSchema;