const { createQuoteEmailBody } = require('./quote_addEdit_template');
const { sendMail } = require('../../00_mailer');

// EMAIL -> Engineering Assigned
exports.engineering_assigned_email = (data, eng_contact_email) => {
	sendMail({
		from: 'intranet@roterra.com',
		to: eng_contact_email || `it@roterra.com`,
		subject: `Quote ${data.quote_id} - Engineering Assigned To You`,
		html: createQuoteEmailBody(data), // html body
	});
};

// EMAIL -> Engineering Completed
exports.engineering_completed_email = (data, assigned_user_email) => {
	sendMail({
		from: 'intranet@roterra.com',
		to: assigned_user_email || `it@roterra.com`,
		subject: `Quote ${data.quote_id} - Engineering Completed`,
		html: createQuoteEmailBody(data), // html body
	});
};

// EMAIL -> Engineering Completed
exports.engineering_NoBid_email = (data, assigned_user_email) => {
	sendMail({
		from: 'intranet@roterra.com',
		to: assigned_user_email || `it@roterra.com`,
		subject: `Quote ${data.quote_id} - NOT BID`,
		html: createQuoteEmailBody(data), // html body
	});
};

// EMAIL -> Quote Assigned
exports.quote_assigned_email = (data, assigned_user_email) => {
	sendMail({
		from: 'intranet@roterra.com',
		to: assigned_user_email || `it@roterra.com`,
		subject: `Quote ${data.quote_id} - Assigned To You`,
		html: createQuoteEmailBody(data), // html body
	});
};

// Quote Ready For Approval - Notify Quote Manager
exports.quote_readyForApproval_email = (data, approved_user_email) => {
	sendMail({
		from: 'intranet@roterra.com',
		to: approved_user_email || `it@roterra.com`,
		subject: `Quote ${data.quote_id} - Ready For Approval`,
		html: createQuoteEmailBody(data), // html body
	});
};

// Quote Approved - Notify Assigned Person
exports.quote_approved_email = (data, approved_user_email) => {
	sendMail({
		from: 'intranet@roterra.com',
		to: approved_user_email || `it@roterra.com`,
		subject: `Quote ${data.quote_id} - Approved`,
		html: createQuoteEmailBody(data), // html body
	});
};
