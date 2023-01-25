module.exports = searchBuilder = (search, query) => {
	search.map((each) => {
		const dbName = each.searchBy;

		switch (each.type) {
			case 'string':
				query.whereRaw(`${dbName}::text iLIKE ?`, [`%${each.filterBy}%`]);
				break;

			case 'number':
				query.where({ [dbName]: each.filterBy });
				break;

			case 'numRange':
				if (!each.filterBy.min && !each.filterBy.max) {
					break;
				}
				if (!each.filterBy.min && each.filterBy.max) {
					query.whereBetween(dbName, [-1000000000, parseInt(each.filterBy.max)]);
				}
				if (each.filterBy.min && !each.filterBy.max) {
					query.whereBetween(dbName, [parseInt(each.filterBy.min), 1000000000]);
				}
				if (each.filterBy.min && each.filterBy.max) {
					query.whereBetween(dbName, [
						parseInt(each.filterBy.min),
						parseInt(each.filterBy.max),
					]);
				}
				break;
			case 'date':
				if (!each.filterBy.start && !each.filterBy.finish) {
					break;
				} else if (!each.filterBy.start) {
					query.where(dbName, '<', `${each.filterBy.finish} 23:59:00.000`);
					break;
				} else if (!each.filterBy.finish) {
					query.where(dbName, '>', `${each.filterBy.start} 00:00:00.000`);
					break;
				} else {
					query.whereBetween(dbName, [each.filterBy.start, each.filterBy.finish]);
					break;
				}
			default:
				break;
		}
	});

	return query;
};
