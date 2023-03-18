const fs = require("fs");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path : './config.env' });


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.set("strictQuery", false); // Deprecation Warning

mongoose.connect(DB).then(() => {
    console.log('DB connection successful!');
});


// Read JSON Files
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// IMPORT DATA INTO DATABASE
const importData = async () => {
    try{
        await Tour.create(tours);
        console.log('Data successfully loaded!');
    }catch(err){
        console.log(err);
    }
    process.exit();
}

// DELETE DATA FROM DATABASE
const deleteData = async () => {
    try{
        await Tour.deleteMany();
        console.log('Data successfully deleted!');
    }catch(err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2] === '--import'){
    importData();
}else if(process.argv[2] === '--delete'){
    deleteData();
}

// console.log(process.argv);