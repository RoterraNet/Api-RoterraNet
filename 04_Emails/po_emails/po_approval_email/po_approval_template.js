var { formatDateLong } = require('../../../03_Utils/formatDates');
var { formatNumberToMoneyDecimal } = require('../../../03_Utils/formatNumbers');

exports.createPoEmailBody = (po, po_details) => {
	let po_details_html = `
    <table border=1 bordercolor=#CCCCCC>
        <tr>
            <td>Quantity</td>
            <td>Description</td>
            <td>Part Number</td>
            <td>Unit Cost</td>
            <td>Extended Cost</td>
        </tr>`;

	po_details.forEach((po_detail) => {
		po_details_html += `
        <tr>
            <td>${po_detail.quantity !== null ? po_detail.quantity : ''}</td>
            <td>${po_detail.description !== null ? po_detail.description : ''}</td>
            <td>${po_detail.part_number !== null ? po_detail.part_number : ''}</td>
            <td>${
				po_detail.unit_price !== null
					? formatNumberToMoneyDecimal(po_detail.unit_price)
					: ''
			}</td>
            <td>${
				po_detail.extended_cost !== null
					? formatNumberToMoneyDecimal(po_detail.extended_cost)
					: ''
			}</td>
        </tr>`;
	});

	po_details_html += `
    <tr>
        <td class="bolded" colspan="4">Total Cost:</td>
        <td class="bolded">${
			po.sum_extended_cost !== null ? formatNumberToMoneyDecimal(po.sum_extended_cost) : ''
		}</td>
    </tr>`;
	po_details_html += `</table>`;

	let emailbody = `
    <html>
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

        .bolded {
            font-weight: bold;
        }

        </style>
        </head>
        <body>

        <h2>Purchase Order</h2>

        <table>
        <tr class="header">
            <th class="header">
                <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
                    <div>PO Information</div>
                    <a style="padding-left: 15px" href="${
						process.env['REACT_CLIENT_PATH_1']
					}dashboard/po/${
		po.po_id !== null ? po.po_id : ''
	}" ><button>View PO</button></a>
                </div>
            </th>
        </tr>
        </table>

        <table>
            <tr>
                <td class="bolded" >PO ID:</td>
                <td><a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/po/${
		po.po_id !== null ? po.po_id : ''
	}" >${po.po_name !== null ? po.po_name : 'TBA'}</a></td>
            </tr>
            <tr>
                <td class="bolded" >Status:</td>
                <td>${po.status_name !== null ? po.status_name : ''}</td>
            </tr>
            <tr>
                <td class="bolded" >Supplier:</td>
                <td><a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/suppliers/${
		po.supplier
	}">${po.supplier_name !== null ? po.supplier_name : ''}</a></td>
            </tr>
            <tr>
                <td class="bolded" >Requisitioned by:</td>
                <td>${po.requisitioned_by_name !== null ? po.requisitioned_by_name : ''}</td>
            </tr>
            <tr>
            <td class="bolded" > Requisitioned for:</td>
                <td>${po.requisitioned_for_name !== null ? po.requisitioned_for_name : ''}</td>
            </tr>
            <tr>
                <td>Job Number</td>
                <td>${po.job_number !== null ? po.job_number : ''}</td>
            </tr>
            <tr>
                <td class="bolded" >Unit Number:</td>
                <td>${po.unit_number !== null ? po.unit_number : ''}</td>
            </tr>
            <tr>
                <td class="bolded" >PO Line Items:</td>
                <td>${po_details_html}</td>
            </tr>
            <tr>
                <td class="bolded" >Internal Comments:</td>
                <td>${po.internal_comments !== null ? po.internal_comments : ''}</td>
            </tr>
            <tr>
                <td class="bolded" >External Comments:</td>
                <td>${po.comment !== null ? po.comment : ''}</td>
            </tr>
            <tr>
                <td class="bolded" >Approve Reject Comment:</td>
                <td>${po.approverejectcomment !== null ? po.approverejectcomment : ''}</td>
            </tr>
            <tr>
                <td class="bolded" >Approved By:</td>
                <td>${po.approved_by_name !== null ? po.approved_by_name : 'Self Approved'}</td>
            </tr>
            <tr>
                <td class="bolded">Approved On:</td>
                <td>${po.approved_on !== null ? formatDateLong(po.approved_on) : ''}</td>
            </tr>
        </table>

        </body>
</html>`;

	return emailbody;
};
