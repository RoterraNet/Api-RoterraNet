const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');

// /sign_out -> GET
router.get('/one/:userId', async (req, res) => {
	const { userId } = req.params;
	const check_sign_out = await knex(database.getUsersSignOutDB)
		.where({ user_id: userId })
		.andWhere({ returned: false });

	res.json([
		{ sign_out_info: check_sign_out[0], sign_in: check_sign_out.length > 0 ? true : false },
	]);
});

router.get('/all', async (req, res) => {
	const check_sign_out = await knex(database.getUsersSignOutDB).where({ returned: false });

	res.json(check_sign_out);
});

router.post('/', async (req, res) => {
	const { values } = req.body;
	const check_sign_out = await knex(database.postUsersSignOutDB)
		.insert({ ...values })
		.returning('id');

	res.json(check_sign_out);
});

router.put('/signIn', async (req, res) => {
	const { values } = req.body;
	const check_sign_out = await knex(database.postUsersSignOutDB)
		.update({ ...values.update })
		.where({ id: values.id })
		.returning('id');

	res.json(check_sign_out);
});

module.exports = router;
