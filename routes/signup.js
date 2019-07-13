var express = require('express');
var router = express.Router();

var user = require('../controller/user');

// POST Submit 
router.post('/', async function(req, res, next) {

    const post = new user({
      FirstName : req.body.FirstName,
      LastName: req.body.LastName,
      Username: req.body.Username,
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
  module.exports = router;