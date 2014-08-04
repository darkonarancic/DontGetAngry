var nodemailer = require('nodemailer');

module.exports = function(userNotificationConfig){
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'don.of.sicily@gmail.com',
            pass: 'samo_darko87'
        }
    });

    var mailOptions = {
        from: 'Don\'t get Angry :heavy_check_mark: <foo@blurdybloop.com>', // sender address
        to: userNotificationConfig.email, // list of receivers
        subject: userNotificationConfig.subject, // Subject line
        text: userNotificationConfig.text, // plaintext body
        html: userNotificationConfig.html // html body
    };

    var sendEmailToUser = function(){
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log('Message sent: ' + info.response);
            }
        });
    };
};
