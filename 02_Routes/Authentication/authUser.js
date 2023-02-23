const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const knex = require('../../01_Database/connection');
const database = require('../../01_Database/database');
const getUsersDB = database.getUsersDB;
const getUsersPermissionsDB = database.getUsersPermissionsDB;

router.post('/', async (req, res) => {
	let auth = req.headers.authorization ? req.headers.authorization : '';

	if (auth !== '') {
		let [_, encodedUserData] = auth.split(' ');
		let decodedUserData = Buffer.from(encodedUserData, 'base64').toString();

		let [username, userpwd] = decodedUserData.split(process.env.SEPARATOR);

		const findUser = await knex(getUsersDB)
			.select('password')
			.whereRaw(`UPPER(user_name) = ?`, [username.toLocaleUpperCase()])
			.andWhere({ deleted: 0 });

		if (findUser.length > 0 && Boolean(userpwd === findUser[0].password.replace(/\s+/g, ''))) {
			const userPerm = await knex(getUsersPermissionsDB)
				.whereRaw(`UPPER(user_name) = ?`, [username.toLocaleUpperCase()])
				.andWhere({ deleted: 0 })
				.returning('*');
			const payload = { user_id: userPerm[0].user_id };
			const token = jwt.sign(payload, process.env.SIGNATURE, { expiresIn: '24hrs' });
			res.status(200).send({ accepted: true, userData: userPerm[0], token: token });
		} else {
			res.status(200).send({ accepted: false, message: 'Invalid Username or password' });
		}
	} else {
		res.status(200).send({ accepted: false, message: 'Missing username or password' });
	}
});

module.exports = router;
