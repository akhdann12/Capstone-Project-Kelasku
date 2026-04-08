const db = require("./db");

db.query("DESCRIBE materials", (err, results) => {
    if (err) {
        console.error("Error DESCRIBE materials:", err.message);
        process.exit(1);
    }
    console.log("Table materials schema:");
    console.table(results);
    process.exit(0);
});
