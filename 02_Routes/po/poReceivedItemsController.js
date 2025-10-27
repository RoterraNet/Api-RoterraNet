const knex = require('../../01_Database/connection');
const { postPoReceivedDB } = require('../../01_Database/database');

const updatePoReceivedItems = async (req, res) => {
	try {
		const { po_receiving_id, update } = req.body;
		const updatedItems = await knex(postPoReceivedDB)
			.update(update)
			.where({ po_receiving_id: po_receiving_id });

		res.status(200).json({
			message: 'PO received items successfully updated',
			color: 'success',
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem updating PO received items',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	updatePoReceivedItems,
};
