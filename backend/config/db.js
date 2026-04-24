const { Pool } = require("pg");

// Crea una nueva instancia de 'Pool' con las variables de entorno
const pool = new Pool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	// Opciones extra recomendadas para manejar concurrencia
	max: 20, // Cantidad máxima de conexiones simultáneas permitidas en el pool
	idleTimeoutMillis: 30000, // Tiempo máximo que una conexión puede estar inactiva antes de cerrarse
	connectionTimeoutMillis: 2000, // Tiempo máximo de espera para obtener una conexión del pool
	ssl: {
		rejectUnauthorized: false, // Esto permite la conexión SSL sin validar el certificado de CA de AWS (común en proyectos de la uni)
	},
});

// Escuchamos posibles errores en conexiones inactivas (previene que el servidor crashee silenciosamente)
pool.on("error", (err, client) => {
	console.error("Unexpected error on idle client", err);
	process.exit(-1);
});

module.exports = pool;
