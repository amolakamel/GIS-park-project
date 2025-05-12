const mongoose = require('mongoose');
const express = require('express');
const dbConnection = require('./config/database');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');
const placeRoute = require('./routes/placeRoute');
const favoritesRoute = require('./routes/favoritesRoute');

dbConnection();

const app = express();

app.use(express.json());

if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'));
    console.log(`Mode : ${process.env.NODE_ENV}`);
}

app.use('/places', placeRoute);
app.use('/fav', favoritesRoute);

app.all('*name', (req, res, next) => {
    next(new ApiError(`Cannot find this route : ${req.originalUrl}`, 400));
});

app.use(globalError);



const Port = process.env.PORT || 3000;
app.listen(Port, () => {
    console.log(`App Running on port ${Port}`);
});

process.on('unhandledRejection', (err) =>{
  console.log(`UnhandledRejection Error : ${err.name} | ${err.message}`);
  server.close(() => {
      console.log('shutting down....');
      process.exit(1);
  });
});
