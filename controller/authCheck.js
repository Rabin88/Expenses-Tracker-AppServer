const jwt = require ('jsonwebtoken');


var loginAuth =  (req, res, next) => {
    try{
        const token = req.headers.authorization.split()[1];
        console.log(token)
        const decode = jwt.verify(token, "secretkey");
        req.body = decode;
        next();
    } catch (err){
        return res.json({
            message: 'Login Failed'
        });
    }
  
}

module.exports = loginAuth;