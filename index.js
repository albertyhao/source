/* The express module is used to look at the address of the request and send it to the correct function */
var express = require('express');
var bodyParser = require('body-parser');
/* The http module is used to listen for requests from a web browser */
var http = require('http');
var mongoose = require('mongoose');

/* The path module is used to transform relative paths to absolute paths */
var path = require('path');

/* Creates an express application */
var app = express();

/* Creates the web server */
var server = http.createServer(app);

/* Defines what port to use to listen to web requests */
var port =  process.env.PORT
		? parseInt(process.env.PORT)
		: 3235;

var dbAddress = process.env.MONGODB_URI || 'mongodb://127.0.0.1/TFW';

function startServer() {

	app.use(bodyParser.json({ limit: '16mb' }));

	/* PATH SECTION */
	/* Defines what function to call when a request comes from the path '/' in http://localhost:8080 */
	app.get('/form', (req, res, next) => {

		/* Get the absolute path of the html file */
		var filePath = path.join(__dirname, './index.html')

		app.post('/form', (req, res, next) => {

			console.log(req.body)
			res.send('OK')
		});
		/* Sends the html file back to the browser */
		res.sendFile(filePath);
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
