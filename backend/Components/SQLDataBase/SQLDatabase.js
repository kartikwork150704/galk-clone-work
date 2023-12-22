const { Pool } = require('pg');

const DB = {
  isConnected: false,

  async connect() {
    let kartikyadavworkDB="postgres://default:2FZy1XkmSjgN@ep-rough-moon-68502564.us-east-1.postgres.vercel-storage.com:5432/verceldb";
    let kartik1507DB="postgres://default:kg9LhOT5ADGb@ep-round-bread-96573995.us-east-1.postgres.vercel-storage.com:5432/verceldb";
    const connectionString =kartik1507DB

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
/* 
JB33434541

*/
// Example usage:
async function main() {
  let query = `
  
  CREATE TABLE Task (
    studentID TEXT,
    JobID TEXT,
    taskStatement TEXT,
    status VARCHAR(50),
    deadline TEXT,
    taskWork TEXT
);


  
  `;
  let query2 = `
    delete from Task
`
  let checkquery = `select * from Task`
  let result = await DB.runQuery(query2);
  console.log(result);

}

// Call the main function to execute the query (for testing purposes)
// main();   

module.exports = DB;
