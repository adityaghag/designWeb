var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true

    },
    script: {
        type: Schema.Types.ObjectId,
        ref: 'Script',
        index: true
    },
    rate: {
        type: Number,
        required: true

    },
    quantity: {
        type: Number,
        required: true

    },
    filled: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Complete', 'Partial', 'Pending'],
        default: "Pending"
    },
    trades: [{
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
        index: true
    }]
});

schema.plugin(deepPopulate, {
    'user': {
        select: ''
    },
    'script': {
        select: ''
    }

});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('BuyOrder', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "user script", "user script", "order", "asc"));
var model = {

    // findAllBuyOrders: function (data, callback) {
    //     BuyOrder.aggregate([{
    //             $group: {
    //                 _id: "$rate",
    //                 orders: {
    //                     $push: {
    //                         user: "$user",
    //                         quantity: "$quantity",
    //                         script: "$script",
    //                         id: "$_id"
    //                     }
    //                 }
    //             }
    //         }, // Stage 2
    //         {
    //             $sort: {
    //                 _id: -1
    //             }
    //         },
    //     ], function (err, found) {
    //         if (err || _.isEmpty(found)) {
    //             callback(err, null);
    //         } else {
    //             // MatchingEngine.matchingBuyingOrderWithSellingOrder();
    //             callback(null, found)
    //         }
    //     });
    // },

    findAllBuyOrders: function (data, callback) {
        BuyOrder.find({}).exec(function (err, found) {
            if (err || _.isEmpty(found)) {
                callback(err, null);
            } else {
                MatchingEngine.appendBuying(callback)
                // callback(null, found)
            }
        });
    },

    getCompleteBuyList: function (data, callback) {
        BuyOrder.find({}).sort({
                createdAt: -1
            })
            .limit(20).exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback("noDataound", null);
                } else {
                    var list = _.orderBy(found, ['rate'], ['desc']);
                    callback(null, list);
                }
            });
    },

    getUserList: function (data, callback) {
        console.log("data", data);
        var userListData = {};
        async.waterfall([
            function (callback) {
                BuyOrder.find({
                    user: data.user,
                    "status": {
                        $in: ["Pending", "Partial"]
                    }
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        var list;
                        if (_.isEmpty(found)) {
                            found = {};
                        }
                        list = _.orderBy(found, ['rate'], ['desc']);
                        callback(null, list);
                    }
                });
            },
            function (BuyData, callback) {
                SellOrder.find({
                    user: data.user,
                    "status": {
                        $in: ["Pending", "Partial"]
                    }
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        var list1;
                        if (_.isEmpty(found)) {
                            list1 = {};
                        }
                        list1 = _.orderBy(found, ['rate'], ['desc']);
                        userListData.buyData = BuyData;
                        userListData.sellData = list1;
                        callback(null, userListData);
                    }
                });
            }
        ], function (err, data) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data);
            }
        });
    }
};
module.exports = _.assign(module.exports, exports, model);