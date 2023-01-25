const knex = require('../../01_Database/connection');

exports.editById_mail = (router, getDB, postDB, today_now, id_name, function1) => {
	router.put('/:id', async (req, res) => {
		const { id } = req.params;
		const { values, user_id } = req.body;
		// Collect Old Data Prior to Overwriting it
		const getOldEntry = await knex(getDB).select('*').where(id_name, '=', id);

		// Enter New SQL Data
		const editedEntryId = await knex(postDB).update(values).where(id_name, '=', id).returning(id_name);

		// Send Information Back to Client
		res.json(editedEntryId);
		// Collect New Data
		const getNewEntry = await knex(getDB).select('*').where(id_name, '=', id);

		// Send Mail / Execute Function / Create File with New Data -> Comparing Old SQL and New SQL
		function1(getOldEntry[0], getNewEntry[0], user_id);
	});
};
