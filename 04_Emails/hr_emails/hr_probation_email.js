const { format } = require('date-fns');

exports.hr_probation_email = (users, days) => {
	let users_detail_html = `
    <table border=1 bordercolor=#CCCCCC>
        <tr>
            <td>First Name</td>
            <td>Last Name</td>
            <td>Manager</td>
            <td>Position</td>
            <td>Start Date</td>
            <td>Probation Ends</td>
        </tr>`;

	users.forEach((user) => {
		users_detail_html += `
        <tr>
            <td>${user.first_name !== null ? user.first_name : ''}</td>
            <td>${user.last_name !== null ? user.last_name : ''}</td>
            <td>${user.manager_name !== null ? user.manager_name : ''}</td>
            <td>${user.position_name !== null ? user.position_name : ''}</td>
            <td>${
				user.start_date !== null ? format(new Date(user.start_date), 'LLL-dd-yyyy') : ''
			}</td>
            <td>${
				user.probation !== null ? format(new Date(user.probation), 'LLL-dd-yyyy') : ''
			}</td>

        </tr>`;
	});

	users_detail_html += `</table>`;

	let emailbody = `
    <html>
        <head>
        <style>
        table, h2, h6 {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
        max-width: 1000px;
        }

        td, th {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
        }

        tr:nth-child(even) {
        background-color: #F5F5F5;
        }

        .header {
        background-color: #C66;
        color: white
        }

        button {
            padding: 5px 10px;
            border-radius: 10px;
            color: white;
            background-color: #17A2B8
        }

        .bolded {
            font-weight: bold;
        }

        </style>
        </head>
        <body>

        <h2>${days} Days Probation Completed </h2>

        <h4>The following employee(s) have completed ${days} days of their 90 day probationary period. </h4>
        <table>


            <tr>
                <td class="bolded" >Users:</td>
                <td>${users_detail_html}</td>
            </tr>
           
        </table>
        
 ${
		days === 60
			? `<h4>
				A secondary email will be sent 7 days prior to fully completing their probationary
				period.
			</h4>`
			: ''
 }

        </body>
</html>`;

	return emailbody;
};
