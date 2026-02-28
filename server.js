const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const expressLayouts = require("express-ejs-layouts")
const mainController = require('./controllers/index.js')
const util = require('./utilities')
const authMiddleware = require('./middleware/auth')

// 
dotenv.config({
    path: path.join(__dirname, '.env')
});

const app = express();

const connectDb = require('./database/db.js');

// Middleware
app.use(cors());
app.use(express.json()); // parse incoming JSON
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(express.static(path.join(__dirname, 'public'))); // serve frontend files


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/

// Authentication Routes
app.use("/auth", require("./routes/auth"))


// Protect all routes after this point
app.use(authMiddleware.protect)

// Index Route
app.get("/", mainController.buildHome)

// Exam Routes
app.use("/exams", require("./routes/exams"))

// Result Routes
app.use("/results", require("./routes/results"))

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
    next({
        status: 404,
        message: 'Sorry, we appear to have lost that page.'
    })
})

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
    const imgPath = "/images/site/404.jpg"
    // let nav = await util.getNav()
    console.error(`Error at: "${req.originalUrl}": ${err.message}`)
    if (err.status == 404) {
        message = err.message
    } else {
        message = 'Oh no! There was a crash. Maybe try a different route?'
    }
    res.render("errors/error", {
        title: err.status || 'Server Error',
        message,
        // nav,
        imgPath
    })
})


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5501;
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/

connectDb();
app.listen(port)
console.log("You are currently listening to port: " + port);