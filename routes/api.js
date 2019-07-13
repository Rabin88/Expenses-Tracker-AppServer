var express = require('express');
var router = express.Router();
const jwt = require ('jsonwebtoken');
const loginAuthCheck = require ('../controller/authCheck')

//var user = require('../controller/user');
var PostSubmit = require('../controller/user');


/* GET users listing. */
// router.post('/login', async function(req, res, next) {
  
//   let username = req.body.username;
//   let password = req.body.password;

//   let isValid = await user.checkUserCredential(username, password);
//   console.log('isValid: ',isValid);
  
//   var jsonObj = {"status": isValid, "error": false};
//   res.json(jsonObj);
// });

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
            var result = await PostSubmit.findOne({Username: username, Password: password});
              //var result = await PostSubmit.find({Username: username, Password: password});
              //var result = await PostSubmit.findOne({Password: password});

              if(result){
                  console.log('bb');
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
                      token: token
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

  let isValid = await user.checkUserCredential(username, password);
  // let  jsonObj= {"status": isValid, "error": false};
  // res.json(jsonObj);
});

//Get Test
router.get('/user/:user_id', function(req, res, next) {
  user.checkUserCredential('useradga','adga');
  var jsonObj = {"status": true, "error": false};
  res.json(jsonObj);
});

// POST Submit 
// router.post('/submit', async function(req, res, next) {

//   const post = new PostSubmit({
//     FirstName : req.body.FirstName,
//     LastName: req.body.LastName,
//     Username: req.body.username,
//     Password: req.body.password,
//     Email: req.body.Email
//   })
//   try {
//     //if(!req.body) return res.sendStatus(400);
//     const postSave = await post.save();
//     res.json(postSave)
//     .then (result => {
//       console.log(result)
//       res.status(200).json({message : "Successfully Registered"});
//     })
//   } catch (error) {
//     console.log(error)
//     res.status(400).json( {message: error});
//   }
// });

//GET Submit that list all the databases
router.get('/submit', async function(req, res, next) {
  try {
    const post = await PostSubmit.find();
    res.json(post);
  } catch (error) {
    res.json( {message: error});
  }
});

// GET 
// router.get('/submit/:Id', async function(req, res, next) {
//   try {
//     const post = await PostSubmit.findById(req.params.Id);
//     res.json(post);
//   } catch (error) {
//     res.json( {message: error});
//   }
// });

//DELETE Post
router.delete('/submit/:Id', async function(req, res, next) {
  try {
    const removePost = await PostSubmit.remove({_id: req.params.Id});
    res.json(removePost);
  } catch (error) {
    res.json( {message: error});
  }
});


module.exports = router;
