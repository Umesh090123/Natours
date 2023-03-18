const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
module.exports = app;

// MIDDLEWARES  
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
app.use(express.json());

app.use(express.static(`./public`));

// app.use((req, res, next) => {
//     console.log('Hello from the middleware');
//     next();
// });

app.use((req, res, next) => {
    req.requestTime  = new Date().toISOString();
    next();
});

// app.get('/', (req, res) => {
//     res.status(404).json({message : 'Hello from the server side!', app : 'Natours'});
// });

// app.post('/', (req, res) => {
//     res.send('You can post to this URL');
// });

// const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

// ROUTE HANDLER

// Content In tourRouter.js and userRouter.js files....

// ROUTES --------------------------------------->


// app.get('/api/v1/tours', );
// app.get('/api/v1/tours/:id', );
// app.post('/api/v1/tours', );
// app.patch('/api/v1/tours/:id', )
// app.delete('/api/v1/tours/:id', )

// 3) ROUTES
app.use('/api/v1/tours', tourRouter); // Mounting routes
app.use('/api/v1/users', userRouter); // Mounting routes

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status : 'fail',
    //     message : `Can't find ${req.originalUrl} on this server!`
    // });
    // next();

    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // err.statusCode = 404;
    // err.status = 'fail';

    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
})


app.use(globalErrorHandler);

// tourRouter.route('/').get(getAllTours).post(updateTour);
// tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// userRouter.route('/').get(getAllUsers).post(createUser);
// userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);



// START SERVER

// const port = 3000;
// app.listen(port, () => {
//     console.log(`App running on port ${port}...`);
// });