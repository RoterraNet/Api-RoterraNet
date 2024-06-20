const { getPipesDB } = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');
const test = [
	{
		item_id: 70,
		hp_num: '1',
		project_id: 3103,
		pile_type: '6 5/8" (0.317)',
		pipe_id: 144,
		helix_1_diameter: 10,
		helix_1_id: 1,
		helix_1: '3/8"',
		helix_2_diameter: 10,
		helix_2_id: 1,
		helix_2: '3/8"',
		helix_3_diameter: null,
		helix_3_id: null,
		helix_3: null,
		helix_4_diameter: null,
		helix_4_id: null,
		helix_4: null,
		helix_spacing: null,
		min_embedment_depth: '55.5',
		pile_length: 22,
		min_torque: '8886',
		count: 5,
		compression_load: '876',
		lateral_load: '585',
		tension_load: '6877',
		deleted: false,
		deleted_on: null,
		deleted_by: null,
		item_count: '3',
		cost: null,
		sale_price: null,
		id: 'd5598324-bf75-41fc-86c9-9e1704eae209',
		workorder_quantity: '1',
	},
	{
		item_id: 69,
		hp_num: '2',
		project_id: 3103,
		pile_type: '6 5/8" (0.317)',
		pipe_id: 144,
		helix_1_diameter: 10,
		helix_1_id: 2,
		helix_1: '1/2"',
		helix_2_diameter: 10,
		helix_2_id: 2,
		helix_2: '1/2"',
		helix_3_diameter: null,
		helix_3_id: null,
		helix_3: null,
		helix_4_diameter: null,
		helix_4_id: null,
		helix_4: null,
		helix_spacing: '11',
		min_embedment_depth: '7.6',
		pile_length: 22,
		min_torque: '2225',
		count: 7,
		compression_load: '678',
		lateral_load: '67867',
		tension_load: '867',
		deleted: false,
		deleted_on: null,
		deleted_by: null,
		item_count: '2',
		cost: null,
		sale_price: null,
		id: 'a5369782-8579-429f-893c-6f820675ec94',
		workorder_quantity: '1',
	},
];

const formatProjectSheetPipes = async (workorder_id, pipes, created_on, created_by) => {
	const formattedPipes = [];
	if (pipes.length === 0) return formattedPipes;
	await Promise.all(
		pipes.map(async (pipe, index) => {
			if (Object.keys(pipe).length === 0) {
				return {};
			} else {
				const {
					pipe_id,
					helix_1_diameter,
					helix_1_id,
					helix_2_diameter,
					helix_2_id,
					helix_3_diameter,
					helix_3_id,
					helix_4_diameter,
					helix_4_id,
					helix_spacing,
					pile_length,
					deleted,
					deleted_on,
					deleted_by,
					count,
					item_count,
					cost,
					sale_price,
					id,
					workorder_quantity,
					hp_num,
				} = pipe;
				const raw = knex.raw(`od || ' (' || wall || ')' as pipe_dimensions`);
				const getPipe = await knex(getPipesDB).select('*', raw).where({ id: pipe_id });

				const newObj = {
					workorder_id: workorder_id,
					created_on: created_on,
					created_by_id: created_by,
					deleted: 0,
					pipe_id: pipe_id,
					length: pile_length,
					workorder_item_line_item: hp_num,
					helix_1_diameter: helix_1_diameter,
					helix_2_diameter: helix_2_diameter,
					helix_3_diameter: helix_3_diameter,
					helix_4_diameter: helix_4_diameter,
					helix_1_thickness_id: helix_1_id,
					helix_2_thickness_id: helix_2_id,
					helix_3_thickness_id: helix_3_id,
					helix_4_thickness_id: helix_4_id,
					quantity: workorder_quantity,
					cost_item_overhead: cost,
					cost_item_overhead_profit: sale_price,
					cost_total_overhead: parseFloat(cost) * parseInt(workorder_quantity),
					cost_total_overhead_profit:
						parseFloat(sale_price) * parseInt(workorder_quantity),
					driveholesize: getPipe[0].drive_hole_size,
					driveholespacing1: getPipe[0].drive_hole_spacing_1,
					driveholespacing2: getPipe[0].drive_hole_spacing_2,
					driveholespacing3: getPipe[0].drive_hole_spacing_3,
					dimension: getPipe[0].dimension,
				};
				formattedPipes.push(newObj);
			}
		})
	);
	return formattedPipes;
};

module.exports = {
	formatProjectSheetPipes,
};
