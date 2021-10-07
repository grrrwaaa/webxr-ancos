/*
	For localhost HTTPS testing need to generate an OpenSSL cert

	See walkthrough at https://stackoverflow.com/questions/21397809/create-a-trusted-self-signed-ssl-cert-for-localhost-for-use-with-express-node

	cd security
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout cert.key -out cert.pem -config req.cnf -sha256

	run server.js

	go to https://localhost:3000 in Chrome

	Chrome -> dev tools / security, click on View Certificate
	Details panel, "Copy to File", save it somewhere as "localhost.cer"

	Open chrome://settings/
	serch for Security / Manage Certificates, open the popup
	 Go to Trusted Root Certification Authorities panel, and click import.
	 Browse to where you saved "localhost.cer"
	 Next, next, etc. until the warning panel, click "Yes"

	Restart Chrome. 
*/

const path = require("path")
const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const assert = require("assert");

const express = require('express');
const ws = require("ws");
const { v4: uuidv4 } = require("uuid")

// this will be true if this server is running on Heroku
const IS_HEROKU = (process.env._ && process.env._.indexOf("heroku") !== -1);
// use HTTPS if we are NOT on Heroku, and NOT using DEBUG:
const IS_HTTPS = !IS_HEROKU;
const PORT = process.env.PORT || 3000;
const PUBLIC_PATH = path.join(__dirname, 'client')

const app = express();
if (IS_HEROKU) {
	// allow cross-domain access:
	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		return next();
	});
}
app.use(express.static(PUBLIC_PATH));
app.get('/',function(req,res) {
	res.sendFile(path.join(PUBLIC_PATH, 'index.html'))
});

const server = IS_HTTPS ? 
	https.createServer({ 
		key: fs.readFileSync("./security/cert.key"), 
		cert: fs.readFileSync("./security/cert.pem")
	}, app) // <-- for localhost
	:  http.createServer(app)  // <-- for Heroku

server.listen(PORT, () => console.log(`Server listening on https://localhost:${PORT}`));

// add a websocket server:
const wss = new ws.Server({ server });

wss.on('connection', (socket, req) => {
	let subpath = url.parse(req.url).pathname;
	console.log("ws connection to", subpath)

	let id = uuidv4()

	socket.on('message', (msg) => {
		console.log("message", id, msg)

	});

	socket.on('error', (err) => {
		console.error(err)
		// should we exit?
	});

	socket.on('close', () => {
		console.log("close")
	});

	socket.send(JSON.stringify({ cmd:"hello", id }))
});

setInterval(function() {
	
}, 1000/30);