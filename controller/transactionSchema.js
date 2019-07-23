const mongoose = require('mongoose');

var transactions = new  mongoose.Schema({
	Merchant: {type: String},
	Categories: {type: String},
	Credit_Amount: {type: Number},
	Debit_Amount: {type: Number},
	Date: {type: Date, default: Date.now}
})
var TransactonSchema = mongoose.model('Transactions', transactions, 'Transactions' );
  module.exports =  TransactonSchema;