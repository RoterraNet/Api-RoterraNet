const knex = require('../../01_Database/connection');

const searchResults = require('./RouteHelpers/searchResults');
const selectColumns = require('./RouteHelpers/selectColumns');
const selectColumnsExcel = require('./RouteHelpers/selectColumnsExcel');
const XLSX = require('xlsx');

exports.getTableData = (router, getDB) => {
	return router.patch('/', async (req, res) => {
		const { download } = req.query;
		const { resultsPerPage, orderby, currentPage, columns } = req.body;

		if (download) {
			// Get Columns Selected For Query
			console.log(columns);
			const selectedColumns = selectColumnsExcel(columns);

			// Queries
			let bodyOfWorksheet = await knex(getDB)
				.column(selectedColumns)
				.select()
				.where((builder) => {
					searchResults(columns, builder); // Big Where Function
				})
				.orderBy([orderby]);

			/* Create new workbook */
			var wb = XLSX.utils.book_new();

			/* HEADER - make worksheet */
			var headerOfWorksheet = [selectedColumns.map((columnName) => columnName.split('.')[2])];
			var worksheet = XLSX.utils.sheet_add_aoa(wb, headerOfWorksheet, 'data');

			/* BODY - make worksheet */
			XLSX.utils.sheet_add_json(worksheet, bodyOfWorksheet, {
				origin: 'A2',
				skipHeader: true,
			});

			// Append Sheet to Workbook
			XLSX.utils.book_append_sheet(wb, worksheet, 'Data');

			// This saves the file in the server -> Name: Data.xlsx
			XLSX.writeFile(wb, 'Data.xlsx');

			// Send Excel Spreadsheet
			res.setHeader('Content-Disposition', 'attachment; filename="Data.xlsx');
			res.end(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
		}

		if (!download) {
			// Get Columns Selected For Query
			const selectedColumns = selectColumns(columns);

			// Queries
			let data1 = knex(getDB)
				.column(selectedColumns)
				.select()
				.where((builder) => {
					searchResults(columns, builder); // Big Where Function
				})
				.orderBy([orderby])
				.limit(resultsPerPage)
				.offset((currentPage - 1) * resultsPerPage);

			let countData1 = knex(getDB)
				.select()
				.where((builder) => {
					searchResults(columns, builder);
				})
				.count();
			// Execute Quieres
			let [data2, countData2] = await Promise.all([data1, countData1]);

			// Count Data
			const countData3 = countData2[0].count;
			const pages_total = Math.ceil(parseInt(countData3) / resultsPerPage);

			// Send Data
			res.json({ userData: data2, num_pages: pages_total, total_records: countData3 });
		}
	});
};

exports.getTableData_ById = (
	router,
	route_name,
	getDB,
	id_name_getDB,
	leftJoinDB,
	id_name_leftJoinDB
) => {
	return router.patch(`/:id/${route_name}`, async (req, res) => {
		const { id } = req.params;
		const { download } = req.query;
		const { resultsPerPage, orderby, page, search } = req.body;

		if (download) {
			// Get Columns Selected For Query
			const selectedColumns = selectColumns(search);
			// Queries
			let data1 = await knex(getDB)
				.column(selectedColumns)
				.select()
				.where((builder) => {
					searchResults(search, builder); // Big Where Function
				})
				.where(getDB + '.' + id_name_getDB, '=', id)
				.leftJoin(
					`${leftJoinDB}`,
					leftJoinDB + '.' + id_name_leftJoinDB,
					'=',
					`${getDB}.${id_name_getDB}`
				)
				.orderBy([orderby]);

			/* make the worksheet */
			var ws = XLSX.utils.json_to_sheet(data1);

			/* add to workbook */
			var wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Data');

			// This saves the file in the server -> Name: Data.xlsx
			XLSX.writeFile(wb, 'Data.xlsx');

			// Send Excel Spreadsheet
			res.setHeader('Content-Disposition', 'attachment; filename="Data.xlsx');
			res.end(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
		}

		if (!download) {
			// Get Columns Selected For Query
			const selectedColumns = selectColumns(search);
			// Queries
			let data1 = knex(getDB)
				.column(selectedColumns)
				.select()
				.where((builder) => {
					searchResults(search, builder); // Big Where Function
				})
				.orderBy([orderby])
				.where(getDB + '.' + id_name_getDB, '=', id)
				.leftJoin(
					`${leftJoinDB}`,
					leftJoinDB + '.' + id_name_leftJoinDB,
					'=',
					`${getDB}.${id_name_getDB}`
				)
				.limit(resultsPerPage)
				.offset((page - 1) * resultsPerPage);

			let countData1 = knex(getDB)
				.select()
				.where((builder) => {
					searchResults(search, builder);
				})
				.where(getDB + '.' + id_name_getDB, '=', parseInt(id))
				.leftJoin(
					`${leftJoinDB}`,
					leftJoinDB + '.' + id_name_leftJoinDB,
					'=',
					`${getDB}.${id_name_getDB}`
				)
				.count();

			// Execute Quieres
			let [data2, countData2] = await Promise.all([data1, countData1]);

			// Count Data
			const countData3 = countData2[0].count;
			const pages_total = Math.ceil(parseInt(countData3) / resultsPerPage);
			// Send Data
			res.json({ userData: data2, num_pages: pages_total, total_records: countData3 });
		}
	});
};
