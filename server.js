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

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public')
const IS_HEROKU = (process.env._ && process.env._.indexOf("heroku") !== -1);

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
app.use(express.static(PUBLIC));
app.get('/',function(req,res) {
	res.sendFile(path.join(PUBLIC, 'index.html'))
});

const server = IS_HEROKU ?  http.createServer(app)  // <-- for Heroku
	: https.createServer({ key: fs.readFileSync("./security/cert.key"), cert: fs.readFileSync("./security/cert.pem")}, app) // <-- for localhost

server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));