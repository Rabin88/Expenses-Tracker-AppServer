const mongoose = require('mongoose');

var budget = new  mongoose.Schema({
	user_id: {
		type:mongoose.Schema.Types.ObjectId,
		required: true
	},
	categories: {type: String, required: true},
	amount: {type: Number, required: true},
})

var BudgetSchema = mongoose.model('Budget', budget, 'Budget' );
module.exports =  BudgetSchema;