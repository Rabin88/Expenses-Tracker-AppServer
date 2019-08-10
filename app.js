var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require ('body-parser')

var apiRouter = require('./routes/api');

var app = express();

app.use (bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(function(req, res, next) {

// 	// Website you wish to allow to connect
// 	res.setHeader('Access-Control-Allow-Origin', '*');
  
// 	// Request methods you wish to allow
// 	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
// 	// Request headers you wish to allow
// 	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
  
// 	// Set to true if you need the website to include cookies in the requests sent
// 	// to the API (e.g. in case you use sessions)
// 	res.setHeader('Access-Control-Allow-Credentials', true);
  
// 	// Pass to next layer of middleware
// 	next();
//   });

// Hamdling API routes
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	console.log('catching 404');
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	let errorMsg = err.message;
	let localError = req.app.get('env') === 'development' ? err : {};
	let errStatus = err.status || 500;

	res.json({
		message: errorMsg,
		devMsg: localError,
		status: errStatus
	});
});

module.exports = app;
