// Code from - https://github.com/bradtraversy/devcamper-api
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error-handler');

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const reviews = require('./routes/reviews');
const auth = require('./routes/auth');

dotenv.config({path: './config/config.env'});

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Connect to DB
connectDB();

// File uploading
app.use(fileupload());

// Body Parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Sanitize input date to prevent NoSQL injection
app.use(mongSanitize());

// set security headers
app.use(helmet());

// prevent XSS attacks
app.use(xss());

// Add rate limiter
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
});

app.use(limiter);

// Prevent http parameter pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/auth', auth);

app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode and listening on port ${PORT}`.yellow.bold);
});

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red.bold);

    server.close(() => process.exit(1));
});