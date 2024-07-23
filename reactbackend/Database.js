const mongoose = require('mongoose');

const detailSchema = new mongoose.Schema({
   name:String,
   email:String,
   phonenumber:String,
   password:String,
   
});
const collation = mongoose.model("WEBUSER",detailSchema)
module.exports = collation