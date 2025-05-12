const express = require('express');
const mongoose = require('mongoose');
const dbConnection = require('./config/database');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');
const parkRoute = require('./routes/parkRoute');

dbConnection();

const app = express();

app.use(express.json());

if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'));
    console.log(`Mode : ${process.env.NODE_ENV}`);
}


//mount routes
app.use('/api/parking', parkRoute)

app.all('*name', (req, res, next) => {
    next(new ApiError(`Cannot find this route : ${req.originalUrl}`, 400));
});

app.use(globalError);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT , () => {
    console.log(`App is running on port ${PORT}`);
});


process.on('unhandledRejection', (err) =>{
    console.log(`UnhandledRejection Error : ${err.name} | ${err.message}`);
    server.close(() => {
        console.log('shutting down....');
        process.exit(1);
    });
});
