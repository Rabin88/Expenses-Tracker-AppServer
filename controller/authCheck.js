const jwt = require ('jsonwebtoken');


var verifyToken =  (req, res, next) => {
	try{
		const token = req.headers.authorization.split(" ")[1];
		console.log('token: ',token)
		const decode = jwt.verify(token, "secretkey");
		//req.body = decode
		console.log('jwt correct');
		next();
	} catch (err){
		console.log('error in jwt');
		return res.json({
			message: 'Authentication Failed'
		});
    }
}
module.exports = verifyToken;


// var verifyToken =  (req, res, next) => {
//         const bearerHeader = req.headers["authorization"];
//         if (typeof bearerHeader != "undefined") {
//             const bearer = bearerHeader.split(" ");
//             const bearerToken =bearer[1];
//             req.token = bearerToken;
//             next();
//         } else {
// 	        res.json({
// 			message: 'Authentication Failed'
// 		});
//     }
// }

//  module.exports = verifyToken;