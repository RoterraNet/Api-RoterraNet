const { format } = require('date-fns');

exports.hr_rrsp_email = (users, days) => {
	let users_detail_html = `
    <table border=1 bordercolor=#CCCCCC>
        <tr>
            <td>Preferred Name</td>
          
         
            <td>RRSP Eligibility Date</td>
            
        </tr>`;

	users.forEach((user) => {
		users_detail_html += `
        <tr>
            <td><a style="padding-left: 15px" href="${
				process.env['REACT_CLIENT_PATH_1']
			}dashboard/users/${user.user_id}" ><button>${
			user.preferred_name !== null ? user.preferred_name : ''
		}</button></a></td>

            
        
            <td>${
				user.rrsp_eligibility !== null
					? format(new Date(user.rrsp_eligibility), 'LLL-dd-yyyy')
					: ''
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

        <h2>RRSP Eligibility Date in ${days} days </h2>

        <h4>The following employee(s) are within ${days} days of their RRSP Eligibility. </h4>
        <table>


            <tr>
                <td class="bolded" >Users:</td>
                <td>${users_detail_html}</td>
            </tr>
           
        </table>
        
 

        </body>
</html>`;

	return emailbody;
};
