const knex = require('../../01_Database/connection');
const { getNcrOptionsDB } = require('../../01_Database/database');

const ncrOptions = async (req, res) => {
	const ncrOptionsArray = await knex(getNcrOptionsDB)
		.select('*')
		.where('deleted', false)
		.orderBy('option', 'asc');
	try {
		res.status(200).json({
			message: 'NCR options successfully retrieved',
			color: 'success',

			data: ncrOptionsArray,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem getting the required information',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	ncrOptions,
};
