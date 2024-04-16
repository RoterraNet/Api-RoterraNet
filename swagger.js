const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const glob = require('glob');
const path = require('path');

// Basic Meta Informations about our API
const options = {
	definition: {
		openapi: '3.0.0',
		info: { title: 'RoterraNet API', version: '1.0.0' },
	},

	// apis: ['02_Routes/Users/usersDashboard/usersDashboardRouter.js', 'schemas.js'],
	apis: ['./02_Routes/**/*.js', './SwaggerSchemas/**/*.yaml'],
};

const routeFiles = glob.sync(path.join(__dirname, '02_Routes', '**', '*.js'));
const schemaFiles = glob.sync(path.join(__dirname, 'SwaggerSchemas', '*.yaml'));

options.apis.push(...schemaFiles, ...routeFiles);

// Docs in JSON format
const swaggerSpec = swaggerJSDoc(options);

// Function to setup our docs
const swaggerDocs = (app, port) => {
	// Route-Handler to visit our docs
	app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
	// Make our docs in JSON format available
	app.get('/api/v1/docs.json', (req, res) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(swaggerSpec);
	});
	console.log(`Version 1 Docs are available on http://localhost:${port}/api/v1/docs`);
};

module.exports = { swaggerDocs };
