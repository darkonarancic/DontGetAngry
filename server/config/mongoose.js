var mongoose = require('mongoose');

module.exports = function(config){
    //mongo db connection
    mongoose.connect(config.db);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, "connection error..."));
    db.open('open', function callback(){
        console.log('DGE db opened');
    });
}
