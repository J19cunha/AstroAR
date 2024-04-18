const express = require("express");
const fs = require("fs");
const https = require("https");
const path = require("path");
const cors = require("cors"); // Require the CORS library

const app = express();

app.use(cors()); // Enable CORS for all requests
// You can also configure CORS for more specific needs, see below for examples

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Read the SSL certificate and key
const privateKey = fs.readFileSync(path.join(__dirname, "server.key"), "utf8");
const certificate = fs.readFileSync(
  path.join(__dirname, "server.cert"),
  "utf8"
);
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);
const PORT = 3000;
httpsServer.listen(PORT, ["192.168.48.81", "localhost"], () => {
  console.log(`HTTPS Server running on https://localhost:${PORT}`);
});
