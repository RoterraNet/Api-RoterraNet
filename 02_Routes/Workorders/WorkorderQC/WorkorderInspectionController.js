const express = require('express');
const router = express.Router();
const database = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');
const getWorkordersItemsDetailsDB = database.getWorkordersItemsDetailsDB;
const getProjectsDB = database.getProjectsDB;

const WorkorderInspectionTable = async (req, res) => {
	const { start, size, workorder_id, workorder_item_id, globalFilter } = req.query;

	const paginatedTable = await knex(getWorkordersItemsDetailsDB)
		.where({ workorder_item_id: workorder_item_id, workorder_id: workorder_id })
		.modify((builder) => {
			if (!!globalFilter) {
				builder.whereRaw(`${getWorkordersItemsDetailsDB}.*::text iLIKE ?`, [
					`%${globalFilter}%`,
				]);
			}
		})
		.paginate({
			perPage: size,
			currentPage: start,
			isLengthAware: true,
		});

	res.status(200).json(paginatedTable);
};

const WorkorderInspectionGetPipeName = async (req, res) => {
	try {
		const { workorder_item_id } = req.query;

		const pipeName = await knex(getWorkordersItemsDetailsDB)
			.select()
			.where({ workorder_item_id: workorder_item_id })
			.first();

		if (!pipeName) {
			return res.status(404).json({ message: 'Pipe not found' });
		}

		const buildName = (object) => {
			if (object.workorder_item_description) {
				return object.workorder_item_description;
			} else {
				let pile_name;
				pile_name = `${object.pipe_od} (${object.pipe_wall}) X ${object.pipe_length} c/w ${object.helix_1_thickness}`;
				if (object.helix_1_diameter) pile_name += ` X ${object.helix_1_diameter}`;
				if (object.helix_2_diameter) pile_name += ` X ${object.helix_2_diameter}`;
				if (object.helix_3_diameter) pile_name += ` X ${object.helix_3_diameter}`;
				if (object.helix_4_diameter) pile_name += ` X ${object.helix_4_diameter}`;
				pile_name += ' helix';
				return pile_name;
			}
		};

		res.status(200).json(buildName(pipeName));
	} catch (error) {
		console.error('WorkorderInspectionGetPipeName error:', error);
		res.status(500).json({ message: 'Failed to get pipe name' });
	}
};

module.exports = {
	WorkorderInspectionTable,
	WorkorderInspectionGetPipeName,
};
