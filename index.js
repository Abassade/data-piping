const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const client=require('./connection');

const csv=require('csvtojson')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '.csv');
    }
  })

const upload = multer({ storage: storage });

app.get('/', (req, res)=> {
    res.send('Welcome home');
});

// endpoint to save csv to elasticsearch
app.get('/save', (req, res) =>{

    const csvFile = 'abs.csv';
    csv()
    .fromFile(csvFile)
    .then((jsonObj)=>{

        // for( i in jsonObj){
        //     //console.log(jsonObj[i]);

        //     client.index({  
        //                 index: 'morife',
        //                 id: i.toString(),
        //                 type: 'data',
        //                 body: jsonObj[i]
        //                 }, (err,resp,status) =>{
        //                   console.log(resp);
        //             });

        // }

       //console.log(Object.assign({}, jsonObj));
       const realJson = Object.assign({}, jsonObj);

       client.bulk({
           body: realJson
        },
        (err,response)=>{
            if(err)
                return console.log('Error', err);
            else
                return console.log('Response', response);
        }
       );

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
        //console.log(typeof(jsonObj));
        });
        res.send('We are life');

});


app.listen(3000, ()=>{
    console.log('App is listening on port 3000');
});
