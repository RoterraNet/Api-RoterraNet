// Update with your config settings.
// ConnectionString = "Driver={PostgreSQL Unicode};Server=localhost;Port=5434;Database=roterranet;Uid=postgres;Pwd=Qzpmal10;"

module.exports = {
	development: {
		client: 'pg',

		connection: {
			host: process.env.DB_HOST,
			port: process.env.DB_PORT,
			user: process.env.DB_USERNAME,
			database: process.env.DB_DATABASE_NAME,
			password: process.env.DB_PASSWORD,
			ssl: { rejectUnauthorized: false },
		},

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
