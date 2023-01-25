const knex = require('../../01_Database/connection');

exports.newEntry = (router, getDB, postDB, today_now, id_name) => {
	return router.post('/', async (req, res) => {
		const { values, user_id } = req.body;
		console.log(req.body);

		try {
			newEntryId = await knex(postDB)
				.insert({ ...values })
				.returning(id_name);
		} catch (e) {
			console.log(e);
			return res.status(400).send({
				message: 'This is an error!',
			});
		}
		res.send(newEntryId);
	});
};
