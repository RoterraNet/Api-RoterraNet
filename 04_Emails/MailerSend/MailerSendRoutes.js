const express = require('express');
const router = express.Router();

const Recipient = require('mailersend').Recipient;
const EmailParams = require('mailersend').EmailParams;
const MailerSend = require('mailersend');

router.get('/', async (req, res) => {
	try {
		const mailersend = new MailerSend({
			api_key:
				'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNjZlMDdhM2RjYWQxYzA1MzNmYmNjMzhjNTRjN2FhODY0NDNkYWRiMWZkNTFjZjFlMWMwYmVlYTBhZDViNjc1MjEzZWU4NjA0MWIwNGQwY2MiLCJpYXQiOjE2NzA5NTAzMTguNzg2ODE2LCJuYmYiOjE2NzA5NTAzMTguNzg2ODE3LCJleHAiOjQ4MjY2MjM5MTguNzgzMTM2LCJzdWIiOiI0OTQ4OSIsInNjb3BlcyI6WyJlbWFpbF9mdWxsIiwiZG9tYWluc19mdWxsIiwiYWN0aXZpdHlfZnVsbCIsImFuYWx5dGljc19mdWxsIiwidG9rZW5zX2Z1bGwiLCJ3ZWJob29rc19mdWxsIiwidGVtcGxhdGVzX2Z1bGwiLCJzdXBwcmVzc2lvbnNfZnVsbCIsInNtc19mdWxsIiwiZW1haWxfdmVyaWZpY2F0aW9uX2Z1bGwiXX0.QuGrvYLxuNC4JjaH3Faa6RhsEPGN8PwEWoR_DmOR-sVXtzLjXl41o3npDDZtyoxT30wyIhvndrkJ_MwrlAnKFIRLyavYgMoQ8NpZRf9D2VBjkr7k1xP4YsGMutvjN4D_0sAvuTwZoUxfWh3LgnfTn6ha-1EZqEQ_9JQDi_wMHi3-Xms6Jr2Nsb-ikMOg6rBgIdEBmB9k7wZrUnsTD--9fa7lJZLHcLoDDIoGmTR2GVkROKhb09OruULxpngJNzyODTPF7bzSDj3-SByY098-aTvgyFOieMI-0u2fPzv78UPtVY-4d8X2FNZSSSWxVg6wmsGQhqGif36ZXm79kBNT1GJ84nAiF4hBMVL4K9VrMc1VnuRn76RcjG9ETqrxSQ8rrQ2IUEsLzi1eJV95vkwjUL2Z09zYbikTcUoZ0y4h-oII1M_XGE3pcP_onsYDgdW-JALQu2JpwqHD3NY1HM6igXkBB013oNrDPIzhVSp2TQHdv92izU25gz7NEt5ss7Z4DE8f8gD1-fXd6qp6KpoKkPRulU43Et_c2jGPUO1pfpPMVc6OOVl7wD5APArUJaoiFkBkCac-BGiunniEtj9nPmDnUNeHFYEctcusrB6EdVI99ZxvvtkVyiVwPRlWrWJCXzbTVCgDHyeq0Ef7s44JM5xExn2K4JPZjTYZKSepilw',
		});

		const recipients = [new Recipient('halghanim@roterra.com', 'Hasan')];

		const personalization = [
			{
				email: 'hasanalghanim@gmail.com',
				data: {
					name: 'This is a test',
					status: 'test',
					account_name: 'aaa',
					project_name: 'aaa',
					support_email: 'test',
				},
			},
		];

		const emailParams = new EmailParams()
			.setFrom('roterra@roterra.com')
			.setFromName('TEST From')
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
