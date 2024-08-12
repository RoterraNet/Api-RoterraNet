const knex = require('../../../01_Database/connection');
const {
	getUsersNewUsersCheckList,
	postPoDetailDB,
	postMaterialTracking,
	postMaterialTrackingDetails,
	getMaterialTracking,
} = require('../../../01_Database/database');

const AddNewHeats = async (req, res) => {
	const body = req.body;
	try {
		const postNewMTR = await knex(postMaterialTracking)
			.insert({
				created_by: body.created_by,
				created_on: body.created_on,
				po_id: body.po_id,
				po_detail_id: body.po_detail_id,

				manufacture: body.manufacture,
				supplier: body.supplier,
				company: body.company,
			})
			.returning('mtr_id');

		const insertHeatNumbers = body.heatNumbers.map((field) => ({
			heat: field.heat,
			mtr_id: postNewMTR[0],
			hsheet: body.hsheet,
			pipe: body.pipe,
			plate: body.plate,
			wsheet: body.wsheet,
			plate_steel_grade: body.plate_steel_grade,
			created_on: body.created_on,
			created_by: body.created_by,
		}));
		await knex(postMaterialTrackingDetails).insert(insertHeatNumbers);

		const poUpdateId = await knex(postPoDetailDB)
			.where({ id: body.po_detail_id })
			.update({ mtr_id: postNewMTR[0] });

		console.log(body);
		res.send('Added MTR and detail');
	} catch (error) {
		console.error('Error creating new hire check:', error);
		'Error adding MTR detail:', error;
		throw error;
	}
};

const AddNewHeatsToMTR = async (req, res) => {
	const body = req.body;

	try {
		const getMTRInfo = await knex(getMaterialTracking)
			.select('hsheet', 'pipe', 'plate', 'wsheet')
			.where({ mtr_id: body.mtrId });

		const insertHeatNumbers = body.heatNumbers.map((field) => ({
			heat: field.heat,
			mtr_id: body.mtrId,
			hsheet: getMTRInfo[0].hsheet,
			pipe: getMTRInfo[0].pipe,
			plate: getMTRInfo[0].plate,
			wsheet: getMTRInfo[0].wsheet,
			created_on: body.created_on,
			created_by: body.created_by,
		}));
		await knex(postMaterialTrackingDetails).insert(insertHeatNumbers);

		console.log(getMTRInfo);
		res.send('added MTR detail');
	} catch (error) {
		console.error('Error adding MTR detail:', error);
		res.send('Error adding MTR detail:', error);
		throw error;
	}
};

module.exports = {
	AddNewHeats,
	AddNewHeatsToMTR,
};

// {
// 	created_by: 614,
// 	created_on: '2024-07-29',
// 	po_id: '23975',
// 	po_detail_id: 65382,
// 	supplier: 878,
// 	manufacture: 'qqq',
// 	pipe: 144,
// 	hsheet: '111',
// 	heatNumbers: [ { heat: '1111' }, { heat: '111' } ],
// 	company: 2
//   }

// {
// 	created_by: 614,
// 	created_on: '2024-07-29',
// 	po_id: '23975',
// 	po_detail_id: 65381,
// 	supplier: 878,
// 	manufacture: 'qqq',
// 	pipe: 144,
// 	hsheet: '111',
// 	heatNumbers: [ { heat: '222' } ],
// 	company: 2,
// 	plate_steel_grade: '44W',
// 	wsheet: '1',
// 	plate: 144
//   }
