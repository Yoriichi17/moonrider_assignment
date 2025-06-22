require('dotenv').config();
const express = require("express");
const app = express();
const db = require("./config/db.config"); 

app.use(express.json());

// routes
app.use("/", require("./routes/identify.route"));

app.use((err, req, res, next) => {
  console.error("Internal error:", err.message);
  res.status(500).json({
    message: "Request failed"
  });
});

// Sync DB and launch server
if (require.main === module) {
  db.sequelize.sync().then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server live at port ${process.env.PORT}`);
    });
  }).catch((err) => {
    console.error("Failed to sync database:", err.message);
  });
}

module.exports = app;
