var elasticsearch=require('elasticsearch');

const client = new elasticsearch.Client( {  
  hosts:'http://localhost:9200/'
});



//   client.indices.exists({index: 'sample'}, (err, res, status) => {

//       if (res) {

//           console.log('index already exists');

//       } else {

//           client.indices.create( {index: 'sample'}, (err, res, status) => {


//           console.log(err, res, status);

//       })

//     }

//   })



module.exports = client;