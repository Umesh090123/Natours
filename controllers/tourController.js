// const fs = require('fs');
const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

// const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

// exports.checkId = (req, res, next, val) => {
//     console.log(`Tour id is ${val}`);
//     if ( req.params.id * 1 > tours.length ) {
//         return res.status(404).json({
//             status : 'fail',
//             message : 'Invalid ID'
//         });
//     }
//     next();
// };

// exports.checkBody = (req, res, next) => {
//     if(!req.body.name || !req.body.price){
//         return res.status(400).json({
//             status : 'fail',
//             message : 'Tour name and price are required'
//         })
//     }
//     next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy')

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});
// BUILD QUERY
// 1A) FILTERING
// const queryObj = {...req.query};
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach(el => delete queryObj[el]);

// // console.log(req.query, queryObj);
// // 1B) ADVANCED FILTERING
// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
// // console.log(JSON.parse(queryStr))

// let query = Tour.find(JSON.parse(queryStr));

// 2) SORTING
// if(req.query.sort){
//     const sortBy = req.query.sort.split(',').join(' ');
//     // console.log(sortBy);
//     query = query.sort(sortBy);
//     // sort('price ratingsAverage)
// }else{
//     query = query.sort('-createdAt');
// }

// 3) FIELD LIMITING
// if(req.query.fields){
//     const fields = req.query.fields.split(',').join(' ');
//     query = query.select(fields);
// }else{
//     query = query.select('-__v');
// }

// 4) PAGINATION
// const page = req.query.page*1 || 1;
// const limit = req.query.limit*1 || 100;
// const skip = (page - 1) * limit;

// query = query.skip(skip).limit(limit);

// if(req.query.page){
//     const numTours = await Tour.countDocuments();
//     if(skip >= numTours){
//         throw new Error('Thos page does not exist');
//     }
// }

// EXECUTE QUERY

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No Tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });

  // console.log(req.params);
  // const id = req.params.id * 1;
  // const tour = tours.find(el => el.id == id);
});

exports.createTour = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
  // try{
  //     const newTour = await Tour.create(req.body);

  //     res.status(201).json({
  //         status :'success',
  //         data : {
  //             tour : newTour
  //         }
  //     });
  // }catch(err){
  //     res.status(400).json({
  //         status : 'fail',
  //         message : err
  //     });
  // }
  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id : newId }, req.body);

  // tours.push(newTour);
  // fs.writeFile(`./dev-data/data/tours-simple.json`, JSON.stringify(tours),  err => {
  //     res.status(201).json({
  //         status :'success',
  //         data : {
  //             tour : newTour
  //         }
  //     });
  // });
  // res.send('DONE');
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No Tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No Tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id : '$ratingsAverage',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    // {
    //     $match : { id : { $ne : 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStats: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStats: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
