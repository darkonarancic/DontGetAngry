var nodemailer = require('nodemailer');

module.exports = function(config){
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'don.of.sicily@gmail.com',
            pass: 'samo_darko87'
        }
    });

    var mailOptions = {
        from: 'Don\'t get Angry :heavy_check_mark: <foo@blurdybloop.com>', // sender address
        to: config.email, // list of receivers
        subject: config.subject, // Subject line
        text: config.text, // plaintext body
        html: config.html // html body
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
};
