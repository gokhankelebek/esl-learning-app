const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/health", async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.json({
      status: "ok",
      timestamp: new Date(),
      database: dbStatus,
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
