const express = require('express');
const multer = require('multer');
const fs = require('fs')
const bodyParser = require('body-parser');
const client=require('./connection');

const csv=require('csvtojson')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//setting multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '.csv');
    }
  });

const upload = multer({ storage: storage });

app.get('/', (req, res)=> {
    res.send('Welcome home');
});

// endpoint to save csv to elasticsearch
app.get('/save/:esindex/:estype', (req, res) =>{

    const {params} =req;
    const {esindex, estype} = params;

    let csvFilePath = 'abs.csv'
    let path = __dirname+'/uploads/file.csv';
    try {
        if (fs.existsSync(path)) {
          csvFilePath = path
        }
      } catch(err) {
        console.error(err)
      }
   
    csv()
    .fromFile(csvFilePath)
    .then((jsonObj)=>{

       const realJson = Object.assign({}, jsonObj);

       bulkIndex(esindex, estype, jsonObj);

    });

        res.send('We are life on saving');
});
// endpoint to upload csv file
app.post('/upload', upload.single('file'), (req, res) =>{

    let csvFilePath = 'abs.csv'
    let file = __dirname+'/uploads/file.csv';
    if(file.endsWith('.csv')){
        csvFilePath = file;
    }
    csv()
    .fromFile(csvFilePath)
    .then((jsonObj)=>{
        const realJson = Object.assign({}, jsonObj);
        console.log(realJson);
        });
        res.send('We are life');

});
  //handling error for bad route request
app.use( (req, res, next)=>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
    });

    app.use( (error, req, res, next)=>{
        res.status(error.status || 500);
        res.json({
            error:{
                status: error.status,
                message: error.message
            }
        });
        });

const bulkIndex = (index, type, data) =>{
    let bulkBody = [];
  
    data.forEach(item => {
      //  console.log(item);
      bulkBody.push({
        index: {
          _index: index,
          _type: type,
          _id: item.fName
        }
      });
      //console.log(index, type, item.fName);
  
      bulkBody.push(item);
    });
  
    client.bulk({body: bulkBody})
    .then(response => {
      console.log('I am here after bulk');
      let errorCount = 0;
      response.items.forEach(item => {
        if (item.index && item.index.error) {
          console.log(++errorCount, item.index.error);
        }
      });
      const mes_response = `Error:
       ${response.errors}\nTime Spent:
        ${response.took}ms\nSuccessfully indexed ${data.length - errorCount}
        out of ${data.length} items`
      console.log(mes_response);
    })
    .catch(console.err);
  };


app.listen(4000, ()=>{
    console.log('App is listening on port 4000');
});
