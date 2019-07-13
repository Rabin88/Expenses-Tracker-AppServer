var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require ('body-parser')

var apiRouter = require('./routes/api');
var userRouter = require('./routes/signup')

var app = express();

app.use (bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Hamdling API routes
app.use('/api', apiRouter);
app.use('/signup', userRouter);

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
