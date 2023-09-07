// This loads the exported configuration object from our knexfile
const knexfile = require('./knexfile');

// This gets the knex client constructor. We use this to create
// an instance of the knex client which allows us to make
// queries to our database
const knexConnector = require('knex');

// We call our client constructor with the "development" section
// from our knexfile
const knex = knexConnector(knexfile.development);

// Finally, we export the client so that we can just require this file
// when we need to make SQL queries.

const { attachPaginate } = require('knex-paginate');
attachPaginate();
module.exports = knex;
