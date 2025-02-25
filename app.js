var createError = require('http-errors');
var express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');

const participantsRouter =  require('./routes/participants');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use('/participants', participantsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;

