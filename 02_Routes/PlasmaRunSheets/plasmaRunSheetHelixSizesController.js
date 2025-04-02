const express = require('express');
const knex = require('../../01_Database/connection');
const { getPlasma_run_sheet_helix_sizesDB } = require('../../01_Database/database');

const getHelixSizes = async (req, res) => {
	try {
		// get inner diameter (ID) sizes

		const idSizes = await knex(getPlasma_run_sheet_helix_sizesDB)
			.select('id', 'name')
			.orderBy('decimal', 'acs');

		res.status(200).json({
			message: 'Sheet items successfully retrieved',
			color: 'success',
			data: idSizes,
		});
	} catch (e) {
		res.status(500).json({ message: 'Error retrieving sheet items', color: 'error', error: e });
		console.log(e);
	}
};

module.exports = {
	getHelixSizes,
};
