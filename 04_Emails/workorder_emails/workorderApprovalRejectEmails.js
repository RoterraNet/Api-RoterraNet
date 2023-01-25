const { createWorkorderEmailBody } = require('./workorderApprovalEmailTemplate');
// const { rejectPoEmailBody } = require('./po_reject_template');
const { sendMail } = require('../00_mailer');

// EMAIL -> PO Self Approved
exports.workorder_request_approval_email = (workorder_data, workorderItem_data, approver_email) => {
	sendMail({
		from: 'intranet@roterra.com',
		to: approver_email || `it@roterra.com`,
		subject: `Workorder ${workorder_data.workorder_name} - Approval Request`,
		html: createWorkorderEmailBody(workorder_data, workorderItem_data), // html body
	});
};

exports.workorder_self_approval_email = (workorder_data, workorderItem_data, email) => {
	sendMail({
		from: 'intranet@roterra.com',
		to: email || `it@roterra.com`,
		subject: `Workorder ${workorder_data.workorder_name} - Self Approval`,
		html: createWorkorderEmailBody(workorder_data, workorderItem_data), // html body
	});
};

exports.workorder_approval_email = (workorder_data, workorderItem_data, email) => {
	sendMail({
		from: 'intranet@roterra.com',
		to: email || `it@roterra.com`,
		subject: `Workorder ${workorder_data.workorder_name} - Approved`,
		html: createWorkorderEmailBody(workorder_data, workorderItem_data), // html body
	});
};

exports.workorder_rejected_email = (workorder_data, workorderItem_data, email) => {
	sendMail({
		from: 'intranet@roterra.com',
		to: email || `it@roterra.com`,
		subject: `Workorder ${workorder_data.workorder_name} - Rejected`,
		html: createWorkorderEmailBody(workorder_data, workorderItem_data), // html body
	});
};

// // EMAIL -> PO APPROVED Email
// exports.workorder_approved_email = (po_data, po_detail_data, po_creator_email) => {
// 	sendMail({
// 		from: 'intranet@roterra.com',
// 		to: po_creator_email || `it@roterra.com`,
// 		subject: `PO ${po_data.po_name !== null ? po_data.po_name : ''} - APPROVED`,
// 		// html: createPoEmailBody(po_data, po_detail_data), // html body
// 	});
// };

// // EMAIL -> PO REJECTED Email
// exports.workorder_rejected_email = (po_data, po_detail_data, po_creator_email) => {
// 	sendMail({
// 		from: 'intranet@roterra.com',
// 		to: po_creator_email || `it@roterra.com`,
// 		subject: `PO ${po_data.po_name !== null ? po_data.po_name : 'TBA'} - REJECTED`,
// 		// html: rejectPoEmailBody(po_data, po_detail_data), // html body
// 	});
// };
