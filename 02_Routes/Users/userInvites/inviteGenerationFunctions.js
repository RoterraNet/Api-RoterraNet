const crypto = require('crypto');

const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// generate random invite code
const generateInviteCode = () => {
	const groupSizes = [4, 4]; // 4 letters + dash + 4 letters
	const groups = groupSizes.map((size) => randomAlphabetString(size));
	const code = groups.join('-'); // e.g. "AB12-34CD"

	return {
		code,
		hash: hashInviteCode(code),
	};
};

// generate random alphanumeric string of given length
const randomAlphabetString = (length) => {
	const bytes = crypto.randomBytes(length); // create list of random int between 0 and 255
	let result = '';
	for (let i = 0; i < length; i++) {
		result += alphanumeric[bytes[i] % alphanumeric.length]; // assign each random number to a alphanumeric character
	}
	return result;
};

// hash invite code based on signature
const hashInviteCode = (code) => {
	const key = process.env.SIGNATURE; // hash based on .env key
	return crypto.createHmac('sha256', key).update(code.toUpperCase()).digest('hex');
};

module.exports = { generateInviteCode, hashInviteCode };
