
var express = require('express');
var router = express.Router();


// Twilio Credentials 
var accountSid = process.env.twilio_accountSid;
var authToken = process.env.twilio_authToken;
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken);


var validation = require('../models/validation')


router.post('/phone', function(req, res) {

	console.log(req.body)

	var pin = Math.floor(Math.random()*9000) + 1000;
	 
	// Sending a text message to the requester number.
	client.messages.create({ 
	    to: req.body.phone, 
	    from: "+15162094851", 
	    body: "Your Plugged pin is: " + pin,   
	}, function(err, message) { 
		if (! err) {

			// Once we sent the pin let's record this in the Validation module.
			var record = new validation({ 
				phone: req.body.phone, 
				pin: pin, 
				timestamp: Date.now()
			});

			record.save(function (err) {
			  if (err) {
			  	res.status(500).send({ error: 'Something blew up' });
			  }
			  // saved!
			  res.status(201).send('Successful! Yaay!');
			})
			
		} else {
			res.status(401).send({ error: 'Twilio blew up something' });
		}
	});
});

router.post('/pin', function(req, res) {

	validation.findOne({
		  pin: req.body.pin,
		  phone: req.body.phone

		}, function (err, results) {
			if (! err && results) {
				results.verifed = true;
				results.save(function(err, result){
					if (! err) {
						console.log(result);
						res.status(201).send('Successfully verifed ' + req.body.phone);
					} else {
						res.status(500).send({ error: 'Could not verify the pin.' });
					}
				})

			} else {
				res.status(500).send({ error: 'Could not find the pin the given credentials.' });
			}

	});
});

module.exports = router;

