const knex = require('../../../01_Database/connection');
const { getCompanyBrandingDB } = require('../../../01_Database/database');

const getBrand = async (req, res) => {
	const company_id = req.query.company;

	try {
		const companyBranding = await knex(getCompanyBrandingDB).where({
			id: company_id,
		});

		res.json(companyBranding);
	} catch (error) {
		console.error('Error getting Company Brand:', error);
		'Error getting Company Brand:', error;
		throw error;
	}
};

module.exports = {
	getBrand,
};
