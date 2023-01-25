module.exports = selectExcelColumns = (columns) => {
	let results = [];
	columns.forEach((column) => {
		if (column.Database_Name !== '' && column.NeverVisible !== true && column.Visible === true) {
			results.push(`${column.Database_Name} as ${column.Database_Name}`);
		}
	});
	return results;
};
