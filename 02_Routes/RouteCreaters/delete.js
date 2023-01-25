const knex = require('../../01_Database/connection');

exports.deleteRoute = (router, postDB, current_day, delete_one_id_name, delete_all_id_name) => {
	return router.delete('/:id', async (req, res) => {
		const { id } = req.params;
		const { user_id } = req.body;
		const { type } = req.params;
		if (type === 'delete_all') {
			const selectOneEntry = await knex(postDB)
				.select(delete_one_id_name)
				.where(delete_one_id_name, '=', id);
			const selectedEntry_deleteInfo = selectOneEntry[0][`${delete_all_id_name}`];
			const deletedEntries = await knex(postDB)
				.update({ deleted_by: user_id, deleted_on: current_day, deleted: 1 })
				.where(delete_all_id_name, '=', selectedEntry_deleteInfo);

			res.json({ deletedEntries });
		} else {
			console.log(
				knex(postDB)
					.update({ deleted_by: user_id, deleted_on: current_day, deleted: 1 })
					.where(delete_one_id_name, '=', id)
					.toString()
			);
			const deletedEntry = await knex(postDB)
				.update({ deleted_by: user_id, deleted_on: current_day, deleted: 1 })
				.where(delete_one_id_name, '=', id);

			res.json({ deletedEntry });
		}
	});
};

exports.deleteRoute_RowRemove = (router, postDB, current_day, id_name) => {
	return router.delete('/:id', async (req, res) => {
		const { id } = req.params;
		const { user_id } = req.body;

		const deletedEntry = await knex(postDB).where(id_name, '=', id).del();

		res.json({ deletedEntry });
	});
};
