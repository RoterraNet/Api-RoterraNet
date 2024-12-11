var { formatDate } = require('../../../03_Utils/formatDates');
const addDays = require('date-fns/addDays');

const todayPlusSevenDays = addDays(new Date(), 7);

startOfTable = `<html>
<head>
<style>
	table {
		font-family: arial, sans-serif;
		border-collapse: collapse;
		width: 100%;
		max-width: 1000px;
	  }
	  
	  td, th {
		border: 1px solid #dddddd;
		text-align: left;
		padding: 8px;
		min-width: 70px;
	  }
	  
	  tr:nth-child(even) {
		background-color: gray;
	  }
	  
	  .header {
		background-color: #C66;
		color: white;
		font-weight: bold;
	  }

	  .row-odd {
		background-color: white;
	  }

	  .row-even {
		background-color: #F5F5F5;
	  }

	  .bid-due-soon {
		color: red;
		font-weight: bold;
	  }
	  
	  button {
		  padding: 5px 10px;
		  border-radius: 10px;
		  color: white;
		  background-color: #17A2B8
	  }
	  </style>
	  </head>
	  <body>`;

const endOfTable = `</table></body></html>`;

// ESTIMATOR EMAIL Template
exports.createQuoteSummaryEmailEstimators = ({ data, name }) => {
	const headersOfTable = `
	<h2>Assigned To: ${name}<h2>
	<table>
	<tr>
		<th class="header">Quote ID</th>
		<th class="header">Due Date</th>
		<th class="header">Eng Due Date</th>
		<th class="header">Customer</th>
		<th class="header">Project </th>
		<th class="header">Engineer</th>
		<th class="header">Status</th>
	</tr>`;
	let middleRows;
	try {
		middleRows = data
			.map((row, index) => {
				return `<tr class=${index % 2 === 1 ? 'row-even' : 'row-odd'}>
                    <td>
                        <a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/quotes/${
					row.quote_id
				}">
                            <button>${row.quote_id}</button>
                        </a>
                    </td>
                    <td class=${
						Date.parse(row.due_date) < Date.parse(todayPlusSevenDays)
							? 'bid-due-soon'
							: ''
					}>${row.due_date !== null ? formatDate(row.due_date) : ''}</td>
                    <td>${row.eng_due_date !== null ? formatDate(row.eng_due_date) : ''}</td>
                    <td>
                        <a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/customers/${
					row.customer_id
				}">${row.customer_name !== null ? row.customer_name : ''}</a>
                    </td>
                    <td>${row.project_identifier !== null ? row.project_identifier : ''}</td>
                    <td>${row.eng_contact_name !== null ? row.eng_contact_name : ''}</td>
                    <td>${row.quote_status_description}</td>
                </tr>`;
			})
			.join(' ');
	} catch (e) {
		console.log(e);
	}

	const fullTable = startOfTable + headersOfTable + middleRows + endOfTable;

	return fullTable;
};

// ENGINEER EMAIL Template
exports.createQuoteSummaryEmailEngineers = ({ data, name }) => {
	const headersOfTable = `
	<h2>Assigned To: ${name}<h2>
	<table>
	<tr>
		<th class="header">Quote id</th>
		<th class="header">Due Date</th>
		<th class="header">Eng Due Date</th>
		<th class="header">Project </th>
		<th class="header">Customer</th>
		<th class="header">Assigned To</th>
	</tr>`;
	const middleRows = data
		.map((row) => {
			return `<tr>
                    <td>
                        <a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/quotes/${
				row.quote_id
			}">
                            <button>${row.quote_id}</button>
                        </a>
                    </td>
                    <td>${row.due_date !== null ? formatDate(row.due_date) : ''}</td>
                    <td class=${
						Date.parse(row.eng_due_date) < Date.parse(todayPlusSevenDays)
							? 'bid-due-soon'
							: ''
					}>${row.eng_due_date !== null ? formatDate(row.eng_due_date) : ''}</td>
                    <td>${row.project_identifier !== null ? row.project_identifier : ''}</td>
                    <td>
                        <a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/customers/${
				row.customer_id
			}">${row.customer_name !== null ? row.customer_name : ''}</a>
                    </td>
                    <td>${row.assigned_to_name !== null ? row.assigned_to_name : ''}</td>
                </tr>`;
		})
		.join(' ');

	const fullTable = startOfTable + headersOfTable + middleRows + endOfTable;

	return fullTable;
};
