const express = require('express');
const cors = require('cors');
const app = express();
const logger = require('morgan');
const path = require('path');
const methodOverride = require('method-override');
require('dotenv').config();

const { swaggerDocs: V1SwaggerDocs } = require('./swagger.js');

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
	origin: ['*', 'http://localhost:3000', 'http://192.168.2.73:3000'],
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	credentials: true,
	optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(logger('dev'));
app.use(methodOverride('_method'));

// Scheduled Jobs (Cron)
scheduled_quotes_emails = require('./06_Scheduled_Cron_Jobs/quotes_emails_schedule');
birthday_auto_schedule = require('./06_Scheduled_Cron_Jobs/birthday_auto_schedule');
hr_email_schedule = require('./06_Scheduled_Cron_Jobs/hr_email_schedule');

scheduled_quotes_emails();
hr_email_schedule();
birthday_auto_schedule();

// ROUTES ARE ALL HERE -> look at app.use("/") -> this gives you an idea of the url
const baseRouter = require('./02_Routes/01_base_Router');

app.use('/', baseRouter);

app.use('/api/v1', require('./apiV1.js'));

app.use('/activities', require('./02_Routes/activities'));

app.use('/auth', require('./02_Routes/Authentication/authUser'));

app.use('/contacts', require('./02_Routes/contacts'));
app.use('/contactsQuotes', require('./02_Routes/Contacts/contactsQuotes.js'));
app.use('/contactsProjects', require('./02_Routes/Contacts/contactProjects.js'));
app.use('/courses', require('./02_Routes/courses'));
app.use('/customers', require('./02_Routes/customers'));
app.use('/customer_types', require('./02_Routes/customer_types'));
app.use('/customer_quote_analysis', require('./02_Routes/customer_quote_analysis'));
app.use('/cost_control_invoicing', require('./02_Routes/cost_control_invoicing'));
app.use('/cost_control', require('./02_Routes/cost_control'));
app.use('/departments', require('./02_Routes/departments'));
app.use('/equipment', require('./02_Routes/equipment'));
app.use('/equipment_types', require('./02_Routes/equipment_types'));
app.use('/graphAPI', require('./02_Routes/graph_api'));
app.use('/general_ledger', require('./02_Routes/general_ledger'));
// general_ledger_details => Joined Route 		=> Accessible in general_ledger_details.js file
// mtr_details => Joined Route 		=> Accessible in mtr_details.js file
app.use('/helix_diameter', require('./02_Routes/helix_diameter'));

app.use('/hrfiles', require('./02_Routes/hr_files'));
app.use('/humanResources', require('./02_Routes/HumanResources/HumanResourcesDashboard'));

app.use('/calendarevents', require('./02_Routes/calendar_events'));
app.use('/industries', require('./02_Routes/industries'));
app.use('/itprojects', require('./02_Routes/it_projects'));

// app.use('/logistics', require('./02_Routes/Projects/Logistics/logistics.js'));
app.use('/logistics', require('./02_Routes/Logistics/logistics'));
app.use('/mtrs', require('./02_Routes/mtrs.js'));
app.use('/mtrfiles', require('./02_Routes/mtr_files.js'));
// mtr_details => Joined Route 		=> Accessible in mtr_details.js file

app.use('/ncr', require('./02_Routes/ncr'));
app.use('/news', require('./02_Routes/news'));
app.use('/notes', require('./02_Routes/notes'));
app.use('/ordercontrol', require('./02_Routes/order_control'));
app.use('/pipes', require('./02_Routes/pipes'));
app.use('/plates', require('./02_Routes/plates'));
app.use('/po', require('./02_Routes/po'));
app.use('/po_permissions', require('./02_Routes/po_permissions'));
app.use('/po_status', require('./02_Routes/po_status'));
app.use('/poAnalytics', require('./02_Routes/po/poAnalytics'));

// po_details => Joined Route 		=> Accessible in po_details.js file
app.use('/po_advanced_search', require('./02_Routes/po_advanced_search'));
app.use('/po_edited', require('./02_Routes/po_edited'));
app.use('/positions', require('./02_Routes/positions'));
app.use('/projects', require('./02_Routes/projects'));
app.use('/project_stats', require('./02_Routes/Projects/Stats/projectStats'));
app.use('/project_sheet', require('./02_Routes/Projects/Project_sheet/project_sheet'));
app.use(
	'/project_sheet_list_detail',
	require('./02_Routes/Projects/Project_sheet/project_sheet_list_detail')
);

app.use('/plasmarunsheets', require('./02_Routes/plasma_run_sheet'));

app.use('/rca', require('./02_Routes/rca'));

app.use('/roterranet_versions', require('./02_Routes/RoterranetVersions/roterranet_versions'));
// ACCESSIBLE IN FILE projects.js ///////////////////////////////////////////////////////////
// po_notes 							=> Joined Route
// po_contacts 							=> Joined Route
app.use('/quotes_permissions', require('./02_Routes/quotes_permissions'));
app.use('/quotes_status', require('./02_Routes/quotes_status'));

// ACCESSIBLE IN FILE quotes.js ///////////////////////////////////////////////////////////
// po_notes 							=> Joined Route
// po_customers							=> Joined Route
app.use('/quotes', require('./02_Routes/quotes'));
app.use('/quotes_', require('./02_Routes/Quotes/quotes'));
app.use('/quotes_analytics', require('./02_Routes/quotes_analytics'));

app.use('/sales_type', require('./02_Routes/sales_type.js'));
app.use('/searching', require('./02_Routes/searching.js'));
app.use('/shop-station', require('./02_Routes/shop_station'));
app.use('/shop-tasks', require('./02_Routes/shop_tasks'));
app.use('/suppliers', require('./02_Routes/suppliers'));
app.use('/supplierscriteria', require('./02_Routes/suppliers_criteria'));
app.use('/suppliers_status', require('./02_Routes/suppliers_status.js'));

app.use('/sign_out', require('./02_Routes/sign_out'));
app.use('/timesheet', require('./02_Routes/timsheet'));
app.use('/users', require('./02_Routes/users'));
app.use('/users_courses', require('./02_Routes/users_courses'));
app.use('/users_permissions', require('./02_Routes/users_permissions'));
app.use('/user_rights', require('./02_Routes/user_rights'));
app.use('/user_benefits', require('./02_Routes/users_benefits'));
app.use('/user_boarding', require('./02_Routes/users_on_off_boarding'));
app.use('/user_reviews', require('./02_Routes/users_reviews'));

app.use('/user_notifications', require('./02_Routes/user_notifications'));
app.use('/user_notifications_settings', require('./02_Routes/notification_settings'));
app.use('/user_item_tracker', require('./02_Routes/user_item_tracker'));
app.use('/user_previous_employment', require('./02_Routes/users_previous_emplyoment'));

app.use('/users_hierarchy', require('./02_Routes/Users/UsersHierarchy/usersHierarchy'));
app.use('/workorders', require('./02_Routes/workorders'));
app.use('/workorderheats', require('./02_Routes/workorders_heats'));
app.use('/workorderitemsdetails', require('./02_Routes/workorders_items_details'));
app.use(
	'/workorder_update_line_items',
	require('./02_Routes/Workorders/Workorder/WorkorderLineItems')
);

app.use('/workorderinspections', require('./02_Routes/workorders_items_details_inspections'));
app.use('/workorderStats', require('./02_Routes/Workorders/WorkorderStats/WorkorderStats'));
app.use('/workorderAnalytics', require('./02_Routes/Workorders/WorkorderStats/workorderAnalytics'));

app.use('/MailerSendRoutes', require('./04_Emails/MailerSend/MailerSendRoutes'));

// ACCESSIBLE IN FILE workorders.js ///////////////////////////////////////////////////////////
// workorders_heats 					=> Joined Route
// workorders_items 					=> Joined Route

// ACCESSIBLE IN FILE workorders_items_details.js ///////////////////////////////////////////////////////////
// workorders_items_details 			=> Joined Route

// ACCESSIBLE IN FILE workorders_items_details.js ///////////////////////////////////////////////////////////
// workorder_items_details_welders 		=> Joined Route
// workorder_items_details_questions	=> Joined Route
// workorder_items_details_inspections	=> Joined Route
app.use('/workorderfiles', require('./02_Routes/workorder_files'));
app.use('/workorders_status', require('./02_Routes/workorders_status'));

const PORT = process.env.PORT;
const ADDRESS = process.env.ADDRESS;

app.listen(PORT, () => {
	console.log(ADDRESS + PORT);
	V1SwaggerDocs(app, PORT);
});
