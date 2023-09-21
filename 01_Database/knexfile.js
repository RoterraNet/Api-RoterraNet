// Update with your config settings.
// ConnectionString = "Driver={PostgreSQL Unicode};Server=localhost;Port=5434;Database=roterranet;Uid=postgres;Pwd=Qzpmal10;"

module.exports = {
	development: {
		client: 'pg',

		connection: {
			host: 'roterranetusa.caymnesynqcw.us-west-2.rds.amazonaws.com',
			port: '5432',
			user: 'postgres',
			database: 'postgres',
			password: 'H9vftA0CP6nS2kbXyIkg',
			ssl: { rejectUnauthorized: false },
		},

		// connection:
		// 	'postgresql://postgres:H9vftA0CP6nS2kbXyIkg@roterranetusa.caymnesynqcw.us-west-2.rds.amazonaws.com:5432/postgres',

		// connection: 'postgresql://postgres:Qzpmal10@192.168.2.2:5434/roterranet',
		// connection: 'postgresql://postgres:root@localhost:5432/roterranet',
		pool: {
			min: 0,
			max: 10,
			acquireTimeoutMillis: 60000,
			idleTimeoutMillis: 600000,
		},
	},
};
