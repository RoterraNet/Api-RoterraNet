const knex = require('../../01_Database/connection');
const { getNcrOptionsDB } = require('../../01_Database/database');

const ncrOptions = async (req, res, next) => {
	try {
		const ncrOptionsArray = await knex(getNcrOptionsDB)
			.select('*')
			.where('deleted', false)
			.orderBy('option', 'asc');
		res.status(200).json({
			message: 'NCR options successfully retrieved',
			color: 'success',

			data: ncrOptionsArray,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	ncrOptions,
};
