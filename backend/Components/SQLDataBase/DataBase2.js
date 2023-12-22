const { Pool } = require('pg');


let studentQuery = `
CREATE TABLE Students (
    email VARCHAR(255) PRIMARY KEY,
    data TEXT,
    jobsId TEXT[] -- This column stores an array of strings (job IDs).
);

`

let jobQuery = `
CREATE TABLE Jobs (
    JobId TEXT PRIMARY KEY,
    data TEXT,
    students TEXT[] -- This column stores an array of strings (students' names).
);

`

let HRQuery = `
CREATE TABLE HR (
    email VARCHAR(255) PRIMARY KEY,
    data TEXT,
    status TEXT,
    jobs TEXT[] -- This column stores an array of strings (job names).
);


`

let TaskQuery=`
    create table Task
    (
        email TEXT,
        JobId TEXT,
        taskstatement TEXT,
        status TEXT,
        deadline TEXT,
        taskWork TEXT
    );
`
const DB2 = {
    isConnected: false,

    async connect() {

        let kartikyadavworkDB="postgres://default:2FZy1XkmSjgN@ep-rough-moon-68502564.us-east-1.postgres.vercel-storage.com:5432/verceldb";
        let kartik1507DB="postgres://default:kg9LhOT5ADGb@ep-round-bread-96573995.us-east-1.postgres.vercel-storage.com:5432/verceldb";
        const connectionString =kartikyadavworkDB

        // Create a new pool with the connection string
        const pool = new Pool({
            connectionString: connectionString,
            ssl: {
                rejectUnauthorized: false // Use this only for local development. For production, provide proper SSL configurations.
            }
        });
        try {
            this.client = await pool.connect();
            this.isConnected = true
            console.log('Connected to the database!');
        } catch (error) {
            console.error('Error connecting to the database:', error);
            throw error;
        }
    },

    async disconnect() {
        try {
            await this.client.release();
            console.log('Disconnected from the database!');
        } catch (error) {
            console.error('Error disconnecting from the database:', error);
            throw error;
        }
    },

    async runQuery(query) {
        try {
            if (!this.isConnected) {
                await this.connect(); // Establish the connection if not already connected
            }

            const result = await this.client.query(query);
            return { result: result.rows, error: null };
        } catch (error) {
            console.error('Error running query:', error);
            return { result: null, error: error };
        }
    }
};
async function main() {
    let query = `
    
    CREATE TABLE JobStatus (
        email TEXT,
        JobId TEXT,
        status TEXT -- This column stores an array of strings (students' names).
    );
    
    
  
  
    
    `;
    let query2 = `
      drop table Task
  `
    let checkquery = `select * from HR`
    let result = await DB2.runQuery(TaskQuery);
    console.log(result);

}

// main()
module.exports = DB2