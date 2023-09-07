const knex = require('../../01_Database/connection');

exports.editById = (router, getDB, postDB, today_now, id_name) => {
	router.put('/:id', async (req, res) => {
		const { id } = req.params;
		const { values, user_id } = req.body;

		console.log(values);
		// console.log(knex(postDB).update(values).where(id_name, '=', id).returning(id_name).toString());
		const editedEntryId = await knex(postDB)
			.update(values)
			.where(id_name, '=', id)
			.returning(id_name);

		res.json(editedEntryId);
	});
};
