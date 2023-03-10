const knex = require('../../01_Database/connection');

exports.getById = (router, getDB, id_name) => {
	router.get('/:id', async (req, res) => {
		const { id } = req.params;

		const getEntry = await knex(getDB).select('*').where(id_name, '=', id);

		res.json(getEntry);
	});
};
