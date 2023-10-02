//test
const quote_mail = require('../04_Emails/quotes_emails/quote_addEdit_email/quote_addEdit_fn');
const add_quote_mail = quote_mail.add_quote_mail;

const quote_file = require('../05_Create_Files/quotes_files/add_quote_file');
const add_quote_file = quote_file.add_quote_file;

// Add Quote -> Email + Create File
exports.quotes_add_fn = async (dataNew, user_id) => {
	// Send Quote Emails

	await add_quote_mail(dataNew, user_id);

	// // Create Files
	// add_quote_file(dataNew, user_id);
};
