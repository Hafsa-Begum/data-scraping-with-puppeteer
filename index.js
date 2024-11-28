const express = require("express");
require("dotenv").config({
    path: ".env",
});
const { extractFromINaturalist } = require("./contollers/extractInfoFromINaturalist");

const app = express();

app.use(express.json());

// Create a route to expose metrics
app.get('/health', async (req, res) => {
    res.status(200).json({message: 'UP'});
});

//Redirect to routes if error

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Page Not Found",
    });
    next();
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, async() => {
    await extractFromINaturalist()
    console.log(`Listening at ${PORT}`);
});
module.exports = app;