const knex = require('../../01_Database/connection');

exports.newEntry_function = (router, getDB, postDB, id_name, function1) => {
	return router.post('/', async (req, res) => {
		const { values, user_id } = req.body;
		try {
			let newEntryId = await knex(postDB)
				.insert({ ...values })
				.returning(id_name);

			res.json(newEntryId);

			// Collect Data Of New Entry
			const getNewEntry = await knex(getDB).select('*').where(id_name, '=', newEntryId[0]);

			// Send Mail / Execute Function / Create File with New Data
			function1(getNewEntry[0], user_id);
		} catch (e) {
			console.log(e);
		}
	});
};
