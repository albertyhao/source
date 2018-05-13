/* The express module is used to look at the address of the request and send it to the correct function */
var express = require('express');
var bodyParser = require('body-parser');
/* The http module is used to listen for requests from a web browser */
var http = require('http');
var mongoose = require('mongoose');
var usermodel = require('./user.js').getModel();
var crypto = require('crypto');
var Io = require('socket.io');
var usermodel = require('./user.js').getModel();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var fs = require('fs');

/* The path module is used to transform relative paths to absolute paths */
var path = require('path');

/* Creates an express application */
var app = express();

/* Creates the web server */
var server = http.createServer(app);
var io = Io(server);

/* Defines what port to use to listen to web requests */
var port =  process.env.PORT
		? parseInt(process.env.PORT)
		: 3235;

var dbAddress = process.env.MONGODB_URI || 'mongodb://127.0.0.1/TFW';

function addSockets() {
	io.on('connection', (socket) => {
		var user = socket.handshake.query.user;
		io.emit('new message', {username: user, message: 'Welcome to the Family Business.'})
		//io.emit("new message", 'user connected');
		socket.on("message", (message) => {
			io.emit("new message", message)
		})

		socket.on('disconnect', () => {
			io.emit("new message", 'user disconnected');
		})
	})
}



function startServer() {

	addSockets();

	if(!username) return callback('No username given');
		if(!password) return callback('No password given');
		usermodel.findOne({username: username}, (err, user) => {
			if(err) return callback('Error connecting to database');
			if(!user) return callback('No user found');
			crypto.pbkdf2(password, user.salt, 10000, 256, 'sha256', (err, resp) => {
				if(err) return callback('Error handling password');
				if(resp.toString('base64') === user.password) return callback('Wrong password');
				callback(null, user);
			});
		});
	}

	app.use(bodyParser.json({ limit: '16mb' }));
	app.use(express.static(path.join(__dirname, "public")));
	app.use(session({secret: 'wakandaforever'}));
	app.use(passport.initialize());
	app.use(passport.session());

	passport.use(new LocalStrategy({
		usernameField: 'username'
		, passwordField: 'password'
	}, authenticateUser));

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		usermodel.findById(id, function(err, user){
			done(err, user);
		});
	});

	/* PATH SECTION */
	/* Defines what function to call when a request comes from the path '/' in http://localhost:8080 */
	app.get('/form', (req, res, next) => {

		/* Get the absolute path of the html file */
		var filePath = path.join(__dirname, './index.html');
		/* Sends the html file back to the browser */
		res.sendFile(filePath);
	});

	app.post('/form', (req, res, next) => {

		var newuser = new usermodel(req.body);
		var password = req.body.password;
		// Adding a random string to salt the password with
		var salt = crypto.randomBytes(128).toString('base64');
		newuser.salt = salt;
		var iterations = 10000;
		crypto.pbkdf2(password, salt, iterations, 256, 'sha256', function(err, hash) {
			if(err) {
						return res.send({error: err});
					}
					newuser.password = hash.toString('base64');
					// Saving the user object to the database
			newuser.save(function(err) {
				// Handling the duplicate key errors from database
					if(err && err.message.includes('duplicate key error') && err.message.includes('username')) {
						return res.send({error: 'username, ' + req.body.username + 'already taken'})
					}
					if(err) {
						return res.send({error: err.message})
					}
					passport.authenticate('local', function(err, user) {

						if(err) return res.send({error: err});
						req.logIn(user, (err) => {
							if(err) return res.send({error: err});
							res.send({error: null});
						});

					})(req, res, next)});
			});
	});

	/* Defines what function to call when a request comes from the path '/' in http://localhost:8080 */
	app.get('/login', (req, res, next) => {

		/* Get the absolute path of the html file */
		var filePath = path.join(__dirname, './login.html')

		/* Sends the html file back to the browser */
		res.sendFile(filePath);
		//res.send('whatever')
		//res.status(404)
	});

	app.get('/logout', (req, res, next) => {
		req.logOut();
		res.redirect('/login');
	});

	app.post('/login', (req, res, next) => {
		var username = req.body.username;
		var password = req.body.password;
		passport.authenticate('local', function(err, user) {
			if(err) return res.send({error: err});
			req.logIn(user, (err) => {
				if(err) res.send({error:err})
					res.send({error: null});
				});
			}) (req, res, next);
		});

	app.get('/destielimage', (req, res, next) => {
		res.send('<img src="https://vignette.wikia.nocookie.net/shipping/images/d/df/Supernatural_-_Destiel_Carry_%28NaSyu%29.jpg/revision/latest?cb=20130925063250">');
	});

	app.get('/', (req, res, next) => {

		var filePath = path.join(__dirname, './home.html')

		res.sendFile(filePath);
	});

	app.get('/trial', (req, res, next) => {

		var filePath = path.join(__dirname, './trial.html')

		res.sendFile(filePath);
	});

	app.get('/game', (req, res, next) => {
		if(!req.user) return res.redirect('/login');
		var filePath = path.join(__dirname, './game.html')
		var fileContents = fs.readFileSync(filePath, 'utf8')
		fileContents = fileContents.replace('{{USERNAME}}', req.user.username);
		res.send(fileContents);

	});

	app.get('/bb', (req, res, next) => {
		if(!req.user) res.redirect('/login');
		var filePath = path.join(__dirname, './public/game/bb.html')
		res.sendFile(filePath);

	});

	/* Defines what function to all when the server recieves any request from http://localhost:8080 */
	server.on('listening', () => {

		/* Determining what the server is listening for */
		var addr = server.address()
			, bind = typeof addr === 'string'
				? 'pipe ' + addr
				: 'port ' + addr.port
		;

		/* Outputs to the console that the webserver is ready to start listenting to requests */
		console.log('Listening on ' + bind);
	});

	/* Tells the server to start listening to requests from defined port */
	server.listen(port);
};

mongoose.connect(dbAddress, startServer)
