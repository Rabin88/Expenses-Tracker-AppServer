const mongoose = require('mongoose');

let mongoUser = 'rabin';
let mongoPass = encodeURIComponent('Thames@09');
let connectionStr = `mongodb+srv://${mongoUser}:${mongoPass}@cluster0-yazdi.mongodb.net/FinanceApp?retryWrites=true&w=majority`; 
mongoose.connect(connectionStr, {useNewUrlParser: true});


var schema = new mongoose.Schema({
    FirstName : {type: String, required: true},
    LastName : {type: String, required: true},
    Username : {type: String , required: true},
    Password : {type: String, required: true},
    Email : {type: String ,required: true, 
        match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/},
})
// var UserModel = mongoose.model('Users', schema, 'Users' );
// var user = {
//     /**
//      * This function is responsible for checking user credentials.
//      */
//     checkUserCredential: async (username, password) => {
//         console.log(`Validating user - username: ${username}, password: ${password}`);

//         try{
//             var result = await UserModel.findOne({Username: username});
//             console.log(result);
//             if(result){
//                 return true;
//             }else{
//                 return false;
//             }
//         }catch(e){
//             console.log('success');
//             console.log(e);  
//             return false; 
//         }  
//     }
// }
// module.exports = user;

    module.exports = mongoose.model('Users', schema, 'Users');