exports.createProjectEmailBody = (data) => {
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

<h2>Project</h2>

<table>
  <tr class="header">
    <th class="header">
        <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
            <div>Project Information</div>
            <a style="padding-left: 15px" href="${
				process.env['REACT_CLIENT_PATH_1']
			}dashboard/projects/${data.id}" ><button>View Project</button></a>
        </div>
    </th>
  </tr>
</table>

<table>
    <tr>
        <td>Project ID:</td>
        <td><a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/projects/${data.id}" >${
		data.workorder_id
	}</a></td>
    </tr>
    <tr>
        <td>Customer:</td>
        <td><a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/customers/${
		data.customer_id
	}">${data.customer_name !== null ? data.customer_name : ''}</a></td>
    </tr>
   
    <tr>
        <td>Project Identifier:</td>
        <td>${data.project !== null ? data.project : ''}</td>
    </tr>
  
    <tr>
        <td>Project Manager:</td>
        <td><a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/users/${
		data.projectmanager_id
	}"> ${data.projectmanager_name !== null ? data.projectmanager_name : ''}</a>
        
        
       </td>
    </tr>
   

    <tr>
        <td>Contract Total:</td>
        <td>${data.contract_total !== null ? `$${data.contract_total}` : ''}</td>
    </tr>

    <tr>
        <td>Purchase Order:</td>
        <td>${data.purchase_order !== null ? `${data.purchase_order}` : ''}</td>
    </tr>

    <tr>
    <td>Quote reference :</td>
    <td><a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/quotes/${data.quote_id}"> ${
		data.quote_id !== null ? data.quote_id : ''
	}</a></td>
</tr>


<tr>
<td>Technology: </td>
<td> ${data.project_technology !== null ? data.project_technology : ''}</td>
</tr>
</table>

</body>
</html>`;

	return emailbody;
};
