const formatNumberToNumberWithCommas = (x) => {
	console.log('total q', x, typeof x);
	if (x && typeof x === 'number') {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}
	return '';
};

const formatNumberToMoney = (x) => {
	if (x && typeof x === 'number') {
		return `$${x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
	} else if (x && typeof x === 'string') {
		return `$${parseInt(x)
			.toString()
			.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
	}

	return '$0';
};

const formatNumberToMoneyDecimal = (x) => {
	if (x !== null) {
		return (
			'$' +
			parseFloat(x)
				.toFixed(2)
				.replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
		);
	}
	return '$0.00';
};

const formatMoneyToNumber = (x) => {
	if (x && typeof x === 'string') {
		console.log('string');
		return parseInt(x.replace(/\$|,/g, ''));
	} else if (x && typeof x === 'number') {
		console.log('number');
		return x;
	}
	return 0;
};

const round5 = (value) => {
	return (Math.round(value * 1e5) / 1e5).toFixed(5);
};

module.exports = {
	formatNumberToNumberWithCommas: formatNumberToNumberWithCommas,
	formatNumberToMoney: formatNumberToMoney,
	formatNumberToMoneyDecimal: formatNumberToMoneyDecimal,
	formatMoneyToNumber: formatMoneyToNumber,
	round5: round5,
};
