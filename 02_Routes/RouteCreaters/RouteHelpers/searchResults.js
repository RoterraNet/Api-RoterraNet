module.exports = searchResults = (search, query) => {
	for (let i = 0; i < search.length; i++) {
		const Database_Name = search[i].Database_Name;
		const Query = search[i].Query;
		const Type = search[i].Type;
		if (Query !== null) {
			switch (Type) {
				case 'String':
					query.where(Database_Name, 'ilike', '%' + Query + '%');
					break;

				case 'Select':
					if (Query[0]) {
						const selectedValues = Query.map((select) => {
							return select.value;
						});
						query.whereIn(Database_Name, selectedValues);
					}
					break;

				case 'Number':
					query.where(Database_Name, '=', Query);
					break;

				case 'Number Range':
					if (!Query.Min && !Query.Max) {
						break;
					}
					if (!Query.Min && Query.Max) {
						query.whereBetween(Database_Name, [-1000000000, parseInt(Query.Max)]);
					}
					if (Query.Min && !Query.Max) {
						query.whereBetween(Database_Name, [parseInt(Query.Min), 1000000000]);
					}
					if (Query.Min && Query.Max) {
						query.whereBetween(Database_Name, [parseInt(Query.Min), parseInt(Query.Max)]);
					}
					break;

				case 'Date Range':
					if (!Query.Start_Date && !Query.Finish_Date) {
						break;
					} else if (!Query.Start_Date) {
						query.where(Database_Name, '<', `${Query.Finish_Date} 23:59:00.000`);
						break;
					} else if (!Query.Finish_Date) {
						query.where(Database_Name, '>', `${Query.Start_Date} 00:00:00.000`);
						break;
					} else {
						query.whereBetween(Database_Name, [Query.Start_Date, Query.Finish_Date]);
						break;
					}
				default:
					break;
			}
		}
	}
	return query;
};
