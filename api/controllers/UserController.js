module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    login: function (req, res) {
        if (req.body && req.body.data.name && req.body.data.name !== '' && req.body.data.password && req.body.data.password !== '') {
            User.doLogin(req.body, res.callback);
        } else {
        res.json({
        value: false,
        data: {
        message: "Invalid Request"
        }
        });
        }
        },
    index: function (req, res) {
        res.json({
            name: "Hello World"
        });
    },
    loginFacebook: function (req, res) {
        passport.authenticate('facebook', {
            scope: ['public_profile', 'user_friends', 'email'],
            failureRedirect: '/'
        }, res.socialLogin)(req, res);
    },

    loginGoogle: function (req, res) {
        if (req.query.returnUrl) {
            req.session.returnUrl = req.query.returnUrl;
        } else {

        }

        passport.authenticate('google', {
            scope: ['openid', 'profile', 'email'],
            failureRedirect: '/'
        }, res.socialLogin)(req, res);
    },
    profile: function (req, res) {
        if (req.body && req.body.accessToken) {
            User.profile(req.body, res.callback);
        } else {
            res.callback("Please provide Valid AccessToken", null);
        }
    },
    pdf: function (req, res) {

        var html = fs.readFileSync('./views/pdf/demo.ejs', 'utf8');
        var options = {
            format: 'A4'
        };
        var id = mongoose.Types.ObjectId();
        var newFilename = id + ".pdf";
        var writestream = gfs.createWriteStream({
            filename: newFilename
        });
        writestream.on('finish', function () {
            res.callback(null, {
                name: newFilename
            });
        });
        pdf.create(html).toStream(function (err, stream) {
            stream.pipe(writestream);
        });
    },
    backupDatabase: function (req, res) {
        res.connection.setTimeout(200000000);
        req.connection.setTimeout(200000000);
        var q = req.host.search("127.0.0.1");
        if (q >= 0) {
            _.times(20, function (n) {
                var name = moment().subtract(5 + n, "days").format("ddd-Do-MMM-YYYY");
                exec("cd backup && rm -rf " + name + "*", function (err, stdout, stderr) {});
            });
            var jagz = _.map(mongoose.models, function (Model, key) {
                var name = Model.collection.collectionName;
                return {
                    key: key,
                    name: name,
                };
            });
            res.json("Files deleted and new has to be created.");
            jagz.push({
                "key": "fs.chunks",
                "name": "fs.chunks"
            }, {
                "key": "fs.files",
                "name": "fs.files"
            });
            var isBackup = fs.existsSync("./backup");
            if (!isBackup) {
                fs.mkdirSync("./backup");
            }
            var mom = moment();
            var folderName = "./backup/" + mom.format("ddd-Do-MMM-YYYY-HH-mm-SSSSS");
            var retVal = [];
            fs.mkdirSync(folderName);
            async.eachSeries(jagz, function (obj, callback) {
                exec("mongoexport --db " + database + " --collection " + obj.name + " --out " + folderName + "/" + obj.name + ".json", function (data1, data2, data3) {
                    retVal.push(data3 + " VALUES OF " + obj.name + " MODEL NAME " + obj.key);
                    callback();
                });
            }, function () {
                // res.json(retVal);
            });
        } else {
            res.callback("Access Denied for Database Backup");
        }
    },
    getAllMedia: function (req, res) {
        Media.getAllMedia(req.body, res.callback);
    },
    sendmail: function (req, res) {
        Config.sendEmail("chintan@wohlig.com", "jagruti@wohlig.com", "first email from endgrid", "", "<html><body>dome content</body></html>");
    },
    getSecret: function (req, res) {
        var secret = speakeasy.generateSecret({
            name: "Wohlig Exchange"
        });
        QRCode.toDataURL(secret.otpauth_url, {
            errorCorrectionLevel: 'H'
        }, function (err, url) {
            secret.qrCode = url;
            secret = {
                "ascii": "E0t{g>vJeRd{kV{i*do#17wh3TDwGI7?",
                "hex": "4530747b673e764a6552647b6b567b692a646f2331377768335444774749373f",
                "base32": "IUYHI63HHZ3EUZKSMR5WWVT3NEVGI3ZDGE3XO2BTKRCHOR2JG47Q",
                "otpauth_url": "otpauth://totp/Wohlig%20Exchange?secret=IUYHI63HHZ3EUZKSMR5WWVT3NEVGI3ZDGE3XO2BTKRCHOR2JG47Q",
                "qrCode": "data:image/png;base64,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"
            };
            res.callback(null, secret);
        });
    },
    verifyToken: function (req, res) {
        var verified = speakeasy.totp.verify({
            secret: "IUYHI63HHZ3EUZKSMR5WWVT3NEVGI3ZDGE3XO2BTKRCHOR2JG47Q",
            encoding: 'base32',
            token: req.body.token,
            window: 1
        });
        res.callback(null, {
            tokenVerification: verified
        });

    }

};
module.exports = _.assign(module.exports, controller);