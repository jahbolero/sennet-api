const { Client } = require("pg");
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
client.connect();
console.log("DB connected");

const dbService = {
  // Function to execute a SQL query
  query: (text, params) => client.query(text, params),

  // Function to check if an object is empty
  isEmpty: (obj) => {
    if (!obj) return true;
    return Object.keys(obj).length === 0;
  },
  getApplication:async(address,twitter)=>{
    const text = `SELECT * FROM applications
    WHERE address = $1 OR twitter = $2`
    const params = [address.toLocaleLowerCase(), twitter]
    return await dbService.query(text,params);
  }
};

// Export the helper object
module.exports.dbService = dbService;
