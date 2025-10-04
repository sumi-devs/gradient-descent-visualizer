const express = require("express");
const cors = require("cors");
const functions = require("./functions.json");

const app = express();
app.use(cors());

app.get("/api/functions", (req, res) => {
  res.json(functions);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
