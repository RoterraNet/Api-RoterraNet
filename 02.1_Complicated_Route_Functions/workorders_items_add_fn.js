const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const postWorkordersItemsDetailsDB = database.postWorkordersItemsDetailsDB;

// Add Quote -> Email + Create File
exports.workorders_items_add_fn = async (dataNew, user_id) => {
	console.log('data new', dataNew);
	const { workorder_id, workorder_item_id, quantity } = dataNew;
	// Array of new items to be inserted into workorders_items_details table
	const array_Workorder_Item_Details = [];
	for (let i = 1; i < quantity + 1; i++) {
		array_Workorder_Item_Details.push({
			workorder_id: workorder_id,
			workorder_item_id,
			workorder_item_detail_line_item: i,
		});
	}
	console.log(array_Workorder_Item_Details);
	await knex.insert(array_Workorder_Item_Details).into(postWorkordersItemsDetailsDB);
};
