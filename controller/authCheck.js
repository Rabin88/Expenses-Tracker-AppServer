/**
 * This authCheck class is responsible for authentication. This require 'jsonwebtoken' library.
 * If the signature matched then the authentication will pass else authentication will fail.
 */

const jwt = require ('jsonwebtoken');

// Function to verity the token
var verifyToken =  (req, res, next) => {
	try{
		const token = req.headers.authorization.split(" ")[1];
		const decode = jwt.verify(token, "secretkey");
		next();
	} catch (err){
		return res.json({
			message: 'Authentication Failed'
		});
    }
}
module.exports = verifyToken;
