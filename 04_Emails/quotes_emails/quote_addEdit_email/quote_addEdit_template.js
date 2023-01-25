var { formatDateLong } = require('../../../03_Utils/formatDates');

exports.createQuoteEmailBody = (data) => {
	const emailbody = `<html>
<head>
<style>
table, h2 {
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

</style>
</head>
<body>

<h2>Quote</h2>

<table>
  <tr class="header">
    <th class="header">
        <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
            <div>Quote Information</div>
            <a style="padding-left: 15px" href="${process.env['REACT_CLIENT_PATH_1']}dashboard/quotes/${data.quote_id}" ><button>View Quote</button></a>
        </div>
    </th>
  </tr>
</table>

<table>
    <tr>
        <td>Quote ID:</td>
        <td><a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/quotes/${data.quote_id}" >${data.quote_id}</a></td>
    </tr>
    <tr>
        <td>Customer:</td>
        <td><a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/customers/${data.customer_id}">${data.customer_name !== null ? data.customer_name : ''}</a></td>
    </tr>
    <tr>
        <td>Contact:</td>
        <td><a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/contacts/${data.contact_id}">${data.contact_name !== null ? data.contact_name : ''}</a></td>
    </tr>
    <tr>
        <td>Project Identifier:</td>
        <td>${data.project_identifier !== null ? data.project_identifier : ''}</td>
    </tr>
    <tr>
        <td>City of Installation:</td>
        <td>${data.location_city !== null ? data.location_city : ''}</td>
    </tr>
    <tr>
        <td>Province of Installation:</td>
        <td>${data.location_province !== null ? data.location_province : ''}</td>
    </tr>
    <tr>
        <td>Industry:</td>
        <td>${data.industry_name !== null ? data.industry_name : ''}</td>
    </tr>
    <tr>
        <td>Approx. Start Date:</td>
        <td>${data.approx_start_date !== null ? formatDateLong(data.approx_start_date) : ''}</td>
    </tr>
    <tr>
        <td>Due Date:</td>
        <td>${data.due_date !== null ? formatDateLong(data.due_date) : ''}</td>
    </tr>
    <tr>
        <td>Assigned To:</td>
        <td>${data.assigned_to_name !== null ? data.assigned_to_name : ''}</td>
    </tr>
    <tr>
        <td>Budgetary:</td>
        <td>${data.budget !== null ? 'Yes' : 'No'}</td>
    </tr>
    <tr>
        <td>Engineering Required:</td>
        <td>${data.eng_required !== null ? 'Yes' : 'No'}</td>
    </tr>
    <tr>
        <td>Engineering Due Date:</td>
        <td>${data.eng_due_date !== null ? formatDateLong(data.eng_due_date) : ''}</td>
    </tr>
    <tr>
        <td>Engineer Assigned:</td>
        <td>${data.eng_contact_name !== null ? data.eng_contact_name : ''}</td>
    </tr>
    <tr>
        <td>Total Pile Count (Est.):</td>
        <td>${data.est_total_count !== null ? `${data.est_total_count} Piles` : ''}</td>
    </tr>
    <tr>
        <td>Total Value (Est.):</td>
        <td>${data.est_total_value !== null ? `$${data.est_total_value}` : ''}</td>
    </tr>
</table>

</body>
</html>`;

	return emailbody;
};
