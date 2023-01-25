const {format} = require("date-fns")


const formatDate = (date1) => {
	if (date1 === null) {
		return '';
	}

	const date2 = new Date(date1);
	return format(date2, 'yyyy-MM-dd');
};

const formatDateLong = (date1) => {
	if (date1 === null) {
		return '';
	}
	return format(new Date(date1), 'EEEE, MMM do, yyyy');
};

const todayDate = () => {
	return format(new Date(), 'yyyy-MM-dd');
};

const todayDateLong = () => {
	return format(new Date(), 'EEEE, MMM do, yyyy');
};

module.exports = {
	formatDate: formatDate,
	formatDateLong: formatDateLong,
	todayDate: todayDate,
	todayDateLong: todayDateLong,
} 
