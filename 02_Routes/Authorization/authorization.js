// Require necessary modules
const jwt = require('jsonwebtoken');
const knex = require('../../01_Database/connection');
const { getUsersPermissionsDB } = require('../../01_Database/database');

// Define your authorization middleware
const authorize = (credentials = {}) => {
	return (req, res, next) => {
		// Get the authorization header from the request
		const authHeader = req.headers.authorization;
		// If there's no authorization header, send a 401 error
		if (!authHeader) {
			return res.status(401).json({ message: 'Authorization header missing' });
		}

		// Extract the token from the authorization header
		const token = authHeader.split(' ')[1];
		console.log(token);

		// Verify the token
		jwt.verify(token, process.env.SIGNATURE, async (err, decodedToken) => {
			if (err) {
				return res.status(403).json({ message: 'Invalid token' });
			}
			const getPermissions = await knex(getUsersPermissionsDB)
				.where({
					user_id: decodedToken?.user_id,
				})
				.andWhere(credentials);
			if (!getPermissions[0]) {
				return res.status(401).json({ message: 'Unauthorized User' });
			} else {
				next();
			}
		});
	};
};

// Export the middleware function
module.exports = authorize;
