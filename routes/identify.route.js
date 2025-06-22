const express = require("express");
const router = express.Router();
const controller = require("../controllers/identify.controller");

// Identifies and links user contact info using email/phone intelligently
router.post("/identify", controller.identify);

// fallback route for unknown methods on /identify
router.all("/identify", (req, res) => {
  return res.status(405).json({ error: "Operation not permitted in this timeline" }); 
});

module.exports = router;
