const { createPoEmailBody } = require('./po_approval_template');
const { rejectPoEmailBody } = require('./po_reject_template');
const { sendMail } = require('../../00_mailer');

// EMAIL -> PO Request Approval Email
exports.po_request_approval_email = (po_data, po_detail_data, approver_email) => {
	sendMail({
		from: 'intranet@roterra.com',
		to: approver_email || `it@roterra.com`,
		subject: `PO ${po_data.po_name !== null ? po_data.po_name : 'TBA'} - Request Approval`,
		html: createPoEmailBody(po_data, po_detail_data), // html body
	});
};

// EMAIL -> PO APPROVED Email
exports.po_approved_email = (po_data, po_detail_data, po_creator_email) => {
	sendMail({
		from: 'intranet@roterra.com',
		to: po_creator_email || `it@roterra.com`,
		subject: `PO ${po_data.po_name !== null ? po_data.po_name : ''} - APPROVED`,
		html: createPoEmailBody(po_data, po_detail_data), // html body
	});
};

// EMAIL -> PO REJECTED Email
exports.po_rejected_email = (po_data, po_detail_data, po_creator_email) => {
	sendMail({
		from: 'intranet@roterra.com',
		to: po_creator_email || `it@roterra.com`,
		subject: `PO ${po_data.po_name !== null ? po_data.po_name : 'TBA'} - REJECTED`,
		html: rejectPoEmailBody(po_data, po_detail_data), // html body
	});
};
