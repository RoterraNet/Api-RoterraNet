const express = require('express');
const router = express.Router();

const Recipient = require('mailersend').Recipient;
const EmailParams = require('mailersend').EmailParams;
const MailerSend = require('mailersend');

router.get('/', async (req, res) => {
	try {
		const mailersend = new MailerSend({
			api_key:
				'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNDc2NTk4YzYwOTU2OGFhNzM0MDMyYjg0ZWM4MzhlMjM2YzQwNWUxOTI1M2UzOGNmYjY2N2MzMmU1MDY4YTE1M2JjM2ZhNDFlYmM4MjQ5YTEiLCJpYXQiOjE2Nzg5ODc3ODEuNDg5MTQ3LCJuYmYiOjE2Nzg5ODc3ODEuNDg5MTUsImV4cCI6NDgzNDY2MTM4MS40ODIyNiwic3ViIjoiNDk0ODkiLCJzY29wZXMiOlsiZW1haWxfZnVsbCIsImRvbWFpbnNfZnVsbCIsImFjdGl2aXR5X2Z1bGwiLCJhbmFseXRpY3NfZnVsbCIsInRva2Vuc19mdWxsIiwid2ViaG9va3NfZnVsbCIsInRlbXBsYXRlc19mdWxsIiwic3VwcHJlc3Npb25zX2Z1bGwiLCJzbXNfZnVsbCIsImVtYWlsX3ZlcmlmaWNhdGlvbl9mdWxsIiwiaW5ib3VuZHNfZnVsbCIsInJlY2lwaWVudHNfZnVsbCIsInNlbmRlcl9pZGVudGl0eV9mdWxsIl19.dap6jtcKGwmD2njH8zKhMIxRarsm9YUiyvavYDebK56D6XyU1pA_y7ZC05qwGLw1FzFK6MSC_4Z5ftTbtgNl2j6GrWZI4IIi1xn1FgyoOwxSQeAH1lNQhbbSMKQdv8d15IfU_-b66GSWndLtLzikfTSpWfI-X-2wTuqKGqvyCTpNCbvjtm9MtVGau6YtRMW-bffymn1agT5t2QA-3hN2LO3T_CL_ok1SpXtxQZTObpJnbCKY8tBuL4ZbOGNV3RkRyP0KO_yFU5uVV93KtHySm3FgNfWQkDRC9d_HuTIykr_oV1QDUMztDaoePRKDHKOmPclJsrNuOo9CGQvvXKfl2lN6Fy84tvTq2gXFoy_yKtotorFJE8f0_Yfl3lXwUyAZVmvNa1ptAcWxLGJylPts-GXj8pnip_4YWkquPAsXzdQnSB39AEEVP8w4OBZZhI7j_wJANR65kJUPvdhbaLD02kEa-j_Fz-UINwUrxfFKdgH4_VaYBFjgIwMvrTi0wYGuuHJQ3tpGoh9Xp2ggOCmm6bC0hCdHKKLpBYZCW5_3Yf5vpObpvUJ7FpHaofsbytlSOyFg-e_aiBq8heAoM8L0T96n7II6pfmbHrPt3O1Kb6gObmH6OmxckNBpukLADw6NR4LI8Cm1LxwpNizkz2hV7xwi8YCvU6_lA7u1yguldc0',
		});

		const recipients = [new Recipient('halghanim@roterra.com', 'Hasan')];

		const personalization = [
			{
				email: 'halghanim@roterra.com',
				data: {
					po: [
						{
							name: '55',
							amount: '444',
						},
					],
					account_name: 'Hasan Al',
				},
			},
		];

		const emailParams = new EmailParams()
			.setFrom('halghanim@roterra.com')
			.setFromName('Your Name')
			.setRecipients(recipients)
			.setSubject('Subject')
			.setTemplateId('pq3enl6x2pml2vwr')
			.setPersonalization(personalization);

		const sendEmail = await mailersend.send(emailParams);

		console.log(sendEmail);
		res.json(sendEmail);
	} catch (e) {
		console.log(e);
	}
});

module.exports = router;
