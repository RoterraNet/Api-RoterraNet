var { formatDateLong } = require('../../03_Utils/formatDates');
var { formatNumberToMoneyDecimal } = require('../../03_Utils/formatNumbers');

exports.createWorkorderEmailBody = (workorder, workorder_item_detail) => {
	let workorder_detail_html = `
    <table border=1 bordercolor=#CCCCCC>
        <tr>
            <td>Quantity</td>
            <td>Description</td>
            <td>Length</td>
            <td>Helix 1</td>
            <td>Helix 2</td>
            <td>Helix 3</td>
            <td>Helix 4</td>
            <td>Cost</td>
            <td>Sale Price</td>
            <td>Extended Cost </td>
            <td>Extended Sale Price</td>
        </tr>`;

	workorder_item_detail.forEach((workorder_detail) => {
		workorder_detail_html += `
        <tr>
            <td>${workorder_detail.quantity}</td>
            <td>${
				workorder_detail.pipe_od
					? `${workorder_detail.pipe_od} ${workorder_detail.pipe_wall}`
					: workorder_detail.workorder_item_description
			}</td>
            <td> ${workorder_detail.length} ft </td>
            <td>${
				workorder_detail.helix_1_thickness
					? `${workorder_detail.helix_1_thickness} x  ${workorder_detail.helix_1_diameter}`
					: ''
			} </td>
            <td>${
				workorder_detail.helix_2_thickness
					? `${workorder_detail.helix_2_thickness} x  ${workorder_detail.helix_2_diameter}`
					: ''
			} </td>
            <td>${
				workorder_detail.helix_3_thickness
					? `${workorder_detail.helix_3_thickness} x  ${workorder_detail.helix_3_diameter}`
					: ''
			} </td>
            <td>${
				workorder_detail.helix_4_thickness
					? `${workorder_detail.helix_4_thickness} x  ${workorder_detail.helix_4_diameter}`
					: ''
			} </td>
            <td>${formatNumberToMoneyDecimal(workorder_detail.cost)}</td>
            <td>${formatNumberToMoneyDecimal(workorder_detail.cost_item_overhead_profit)}</td>
            <td>${formatNumberToMoneyDecimal(workorder_detail.cost_total_overhead)}</td>
            <td>${formatNumberToMoneyDecimal(workorder_detail.cost_total_overhead_profit)}</td>
        </tr>`;
	});

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

        <h2>Workorder</h2>

        <table>
        <tr class="header">
            <th class="header">
                <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
                    <div>Workorder Information</div>   
                     
                    <a style="padding-left: 15px" href="${
						process.env['REACT_CLIENT_PATH_1']
					}dashboard/projects/workorder/${workorder.workorder_id}?project=${
		workorder.project_id
	}" ><button>View Workorder - Project Managers</button></a>

    <a style="padding-left: 15px" href="${process.env['REACT_CLIENT_PATH_1']}dashboard/workorders/${
		workorder.workorder_id
	}?project=${workorder.project_id}" ><button>View Workorder - Manufacturing </button></a>
                </div>
            </th>
        </tr>
        </table>

        <table>
            <tr>
                <td class="bolded" >Workorder ID:</td>
                <td><a href="${process.env['REACT_CLIENT_PATH_1']}dashboard/projects/workorder/${
		workorder.workorder_id
	}?project=${workorder.project_id}"  >${workorder.workorder_name}</a></td>
            </tr>
           
            <tr>
                <td class="bolded" >Requested by:</td>
                <td>${workorder.purchaser_name}</td>
            </tr>
            <tr>
            <td class="bolded" >Customer:</td>
            <td>${workorder.customer_name}</td>
            </tr>
            

  

            <tr>
                <td class="bolded" >Project Name:</td>
                <td>${workorder.project_name}</td>
            </tr>
            <tr>
            <td class="bolded" >Total Cost:</td>
            <td>${formatNumberToMoneyDecimal(workorder.workorder_cost_total_overhead)}</td>
        </tr>
        <tr>
        <td class="bolded" >Total Sale:</td>
        <td>${formatNumberToMoneyDecimal(workorder.workorder_cost_total_overhead_profit)}</td>
    </tr>


    <tr>
    <td class="bolded" >Workorder Line Items:</td>
    <td>${workorder_detail_html}</td>
</tr>
        </table>

        </body>
</html>`;

	return emailbody;
};
