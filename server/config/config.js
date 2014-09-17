var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');

module.exports = {
    development: {
        rootPath: rootPath,
        db: 'mongodb://dn_87:darko87_mongo@kahana.mongohq.com:10099/dn_code',
        port: process.env.port || 3000
    },
    production: {
        rootPath: rootPath,
        db: 'mongodb://dn_87:darko87_mongo@kahana.mongohq.com:10099/dn_code',
        port: process.env.port || 80
    }
};