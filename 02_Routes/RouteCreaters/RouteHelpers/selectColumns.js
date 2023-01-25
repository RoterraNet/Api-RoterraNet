module.exports = selectColumns = (columns) => {
	let results = [];
	columns.forEach((column) => {
		if (column.Database_Name !== '') {
			results.push(`${column.Database_Name} as ${column.Database_Name}`);
		}
	});
	return results;
};
