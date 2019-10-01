// implement your API here
//import express with require
const express = require('express');
//import database file
const db = require('./data/db.js');

//Creating server by calling express function
const server = express();

//Allow express to interpret json using middleware to go between express receiving request and the processing of it, it will check if content is in json format and if so will parse the body into a javascript object and place into the request
server.use(express.json());

//get all users from provided route, 2nd argument to .get is callback function with 2 arguments req object and response object. req comes with req and response is specified response, 
server.get('/api/users', (req, res) => {
	//within db there is a find function we will use to return db of users
	db.find()
		//.then will respond to the request with success status of 200 and will send json with the content of users object, receive user object with that id and return status 200 of success and send back json of user object
		.then(users => res.status(200).json(users))
		.catch(error => {
			//create the console log for any errors
			console.log(error);
			//return status code of 500 to indicate the database had an error
			res.status(500).json({
				error: "The users information could not be retrieved."
			})
		})

});

server.post('/api/users', (req, res) => {
	console.log(req.body);
	//save user into a variable and destructure to do a check for both fields name and bio and if not present return code 400 Bad Request with error message
	const { name, bio } = req.body;
	const user = req.body;
	if (!name || !bio) {
		res.status(400).json({ error: "Please provide name and bio for the user." })
	}
	db.insert(user)
		//utilize db.findById and pass in userId to return user of that id to display what what was just posted, can also destructure id out of user object and pass that to findById
		.then(userId => db.findById(userId.id))
		.then(user => {
			//return 201 indicating the object was created and displaying the json of that new object
			res.status(201).json(user);
		})
		//If error retrieving user display this message 
		.catch(error => {
			console.log(error);
			res.status(500).json({ error: "The user information could not be retrieved." })
		})
		//This .catch will run if the initial db.insert(user) fails indicating error inserting the user
		.catch(error => {
			console.log(error);
			res.status(500).json({ error: "There was an error while saving the user to the database." });
		})

})




//Create response for getting a specified user with a particular id :id allows us to specify a particular url parameter within the call or request, param or slug. if we find the user return 200 success and .json of user object, if not found return status 404 of not found and json object of the specified error
server.get('/api/users/:id', (req, res) => {
	const id = req.params.id;
	db.findById(id)
		.then(user => {
			if (user) {
				res.status(200).json(user);
			} else {
				res.status(404).json({
					error: "The user with the specified ID does not exist."
				});
			}
		}).catch(error => {
			//create the console log for any errors
			console.log(error);
			//return status code of 500 to indicate the database had an error
			res.status(500).json({
				error: "The user information could not be retrieved."
			})
		})
})
//takes id and removes user from the database
server.delete('/api/users/:id', (req, res) => {
	//destructure id out of the req.params object for ease of reference
	const { id } = req.params;
	db.remove(id)
		//204 indicates no content to be returned from this request, will return a truthy value if an id is found
		.then((success) => {
			if (success) {
				res.status(204).end();
			} else {
				res.status(404).json({ error: "The user with the specified ID does not exist." });
			}
		})
		.catch(error => {
			res.status(500).json({ error: "The user could not be removed." });
		})
})

server.put('/api/users/:id', (req, res) => {
	const { id } = req.params;
	const { name, bio } = req.body;
	if (!name && !bio) {
		res.status(400).json({ error: "Please provide name and bio for the user." })
	}
	db.update(id, { name, bio })
		.then(success => {
			if (success) {
				db.findById(id)
					.then(user => res.status(200).json(user))
					.catch(error => {
						console.log(error);
						res.status(500).json({ error: "The user information could not be modified." })
					})
			} else {
				res.status(404).json({ error: "The user with the specified ID does not exist." })
			}
		})
		.catch(error => {
			res.status(500).json({ error: "The user information could not be modified" })
		})
})

//Having server listen on port 8000
server.listen(8000, () => console.log("server on 8000"));