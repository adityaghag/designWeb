// import { INSPECT_MAX_BYTES } from "buffer";

module.exports = {
    minimumArrayLength: 100,
    buyingOrder: [], // will be descending
    /**
     * obj = {
            rate:100.20,
            orders: [
                {
                    _id:12345,
                    user:12345,
                    script:12345,
                    quantity:100
                },
                {
                    _id:12345,
                    user:12345,
                    script:12345,
                    quantity:200
                }
            ]
        }
     */
    sellingOrder: [], // will be ascending

    getBuyersSellers: function (callback) {
        callback(null, {
            buyers: MatchingEngine.buyingOrder,
            sellers: MatchingEngine.sellingOrder
        });
    },

    addToBuyingOrder: function (data1, callback) {
        var indexData = _.sortedIndexBy(MatchingEngine.buyingOrder,   { 
            'rate':  data1.rate 
        },  function (o)  { 
            return  -1 * o.rate; 
        });
        var obj = {};
        var alreadyRateAvailable;
        if (MatchingEngine.buyingOrder.length > indexData && MatchingEngine.buyingOrder[indexData].rate == data1.rate) {
            alreadyRateAvailable = true;
            obj.user = data1.user;
            obj.script = data1.script;
            obj.quantity = data1.quantity;
            obj.id = data1._id;
            MatchingEngine.buyingOrder[indexData].orders.push(obj);
        } else {
            objToSend = {};
            objToSend.rate = data1.rate;
            obj.user = data1.user;
            obj.script = data1.script;
            obj.quantity = data1.quantity;
            obj.id = data1._id;
            objToSend.orders = [obj];
            MatchingEngine.buyingOrder.splice(indexData, 0, objToSend);
        }

        MatchingEngine.buyingOrder = MatchingEngine.buyingOrder.slice(0, MatchingEngine.minimumArrayLength);

        console.log("MatchingEngine.buyingOrder", JSON.stringify(MatchingEngine.buyingOrder));
        if (indexData == 0 && !alreadyRateAvailable) {
            console.log("data1", data1);
            BuyOrder.getUserList(data1, function (err, data) {
                if (data) {
                    sails.sockets.blast("UserOrderDataAdded", data);
                }
            });
            MatchingEngine.matchingBuyingOrderWithSellingOrder(obj, data1.rate, callback);
        } else {
            console.log("data1333333333333333333333333", data1);
            BuyOrder.getUserList(data1, function (err, data) {
                if (data) {
                    sails.sockets.blast("UserOrderDataAdded", data);
                }
            });
            callback();
        }
        // Socket Call Buying HERE
        sails.sockets.blast("BuyOrderAdded", MatchingEngine.buyingOrder);
    },

    addToSellingOrder: function (data1, callback) {
        var indexData = _.sortedIndexBy(MatchingEngine.sellingOrder,   { 
            'rate':  data1.rate 
        },  function (o)  { 
            return  o.rate; 
        });
        var obj = {};
        var alreadyRateAvailable;
        if (MatchingEngine.sellingOrder.length > indexData && MatchingEngine.sellingOrder[indexData].rate == data1.rate) {
            alreadyRateAvailable = true;
            obj.user = data1.user;
            obj.script = data1.script;
            obj.quantity = data1.quantity;
            obj.id = data1._id;
            MatchingEngine.sellingOrder[indexData].orders.push(obj);
        } else {
            objToSend = {};
            objToSend.rate = data1.rate;
            obj.user = data1.user;
            obj.script = data1.script;
            obj.quantity = data1.quantity;
            obj.id = data1._id;
            objToSend.orders = [obj];
            MatchingEngine.sellingOrder.splice(indexData, 0, objToSend);
        }

        MatchingEngine.sellingOrder = MatchingEngine.sellingOrder.slice(0, MatchingEngine.minimumArrayLength);

        console.log("MatchingEngine.sellingOrder", JSON.stringify(MatchingEngine.sellingOrder));

        if (indexData == 0 && !alreadyRateAvailable) {
            console.log("data1", data1);
            BuyOrder.getUserList(data1, function (err, data) {
                if (data) {
                    sails.sockets.blast("UserOrderDataAdded", data);
                }
            });
            MatchingEngine.matchingSellingOrderWithBuyingOrder(obj, data1.rate, callback);
        } else {
            console.log("data1333333333333333333333333", data1);
            BuyOrder.getUserList(data1, function (err, data) {
                if (data) {
                    sails.sockets.blast("UserOrderDataAdded", data);
                }
            });
            callback();
        }
        // Socket Call Selling HERE
        sails.sockets.blast("SellOrderAdded", MatchingEngine.sellingOrder);
    },


    removeFromBuyingOrder: function () {
        /**
         * if(currenctRate > buyingOrder.$last.rate) {
         *      _.find(Rate) {
         *          find OrderId Remove the order Id
         *          if OrderObject Length is 0 removeRate and call append
         *      }
         * }
         *  
         */
    },

    removeFromBuyingOrder: function () {},

    appendBuying: function (callback) { //sorting addition remaining
        // find diff =  minimumArrayLength-currentLength 
        // find Mongo Order Buying Object less than    buyingOrder.$last.rate with limit `diff`  in descending order
        // append to the array in the end
        if (_.isEmpty(MatchingEngine.buyingOrder)) {
            BuyOrder.find({}).sort({
                rate: -1
            }).exec(function (err, data) {
                if (err || _.isEmpty(data)) {
                    callback(err, "noDataFound")
                } else {
                    async.concatSeries(data, function (value, callback) {
                        MatchingEngine.addToBuyingOrder(value, callback)
                    }, callback);
                }
            })
        } else {
            var last_element = MatchingEngine.buyingOrder[MatchingEngine.buyingOrder.length - 1];
            BuyOrder.find({
                rate: {
                    $lt: last_element.rate
                }
            }, function (err, data) {
                if (err || _.isEmpty(data)) {
                    callback(err, "noDataFound")
                } else {
                    async.concatSeries(data, function (value, callback) {
                        MatchingEngine.addToBuyingOrder(value, callback)
                    }, callback);
                }
            })
        }
    },

    appendSelling: function (callback) {
        if (_.isEmpty(MatchingEngine.sellingOrder)) {
            SellOrder.find({}).sort({
                rate: 1
            }).exec(function (err, data) {
                if (err || _.isEmpty(data)) {
                    callback(err, "noDataFound")
                } else {
                    async.concatSeries(data, function (value, callback) {
                        MatchingEngine.addToSellingOrder(value, callback)
                    }, callback);
                }
            })
        } else {
            var last_element = MatchingEngine.sellingOrder[MatchingEngine.sellingOrder.length - 1];
            SellOrder.find({
                rate: {
                    $gt: last_element.rate
                }
            }, function (err, data) {
                if (err || _.isEmpty(data)) {
                    callback(err, "noDataFound")
                } else {
                    async.concatSeries(data, function (value, callback) {
                        MatchingEngine.addToSellingOrder(value, callback)
                    }, callback);
                }
            })
        }
    },

    matchingBuyingOrderWithSellingOrder: function (buyObj, rate, callback) {
        var indexNo = _.sortedIndexBy(MatchingEngine.sellingOrder, {
            rate: rate
        }, function (o) {
            return o.rate;
        });
        var buyingTrades = [];
        var sellingTrades = [];
        var sellingOrdersCount = 0;
        if (indexNo == 0) {

            if (MatchingEngine.sellingOrder.length > 0 && rate == MatchingEngine.sellingOrder[0].rate) {
                sellingOrdersCount = 1;
                /**
                 * Two Trades will occur
                 */
                startTrading(callback);
            } else {
                callback(); // No Trade Should Occur
            }

        } else if (indexNo == MatchingEngine.sellingOrder.length) { // Entire Array is getting matched
            sellingOrdersCount = indexNo;
            /**
             * Multiple Trades can occur
             */
            startTrading(callback);
        } else {
            if (rate == MatchingEngine.sellingOrder[0].rate) {
                sellingOrdersCount = indexNo + 1;
                /**
                 * Multiple Trades will occur
                 */
                startTrading(callback);
            } else {
                sellingOrdersCount = indexNo;
                /**
                 * Multiple Trades will occur
                 */
                startTrading(callback);
            }
        }

        function startTrading(callback) {
            var endLoop = false;
            console.log(sellingOrdersCount);
            for (i = 0; i < sellingOrdersCount && !endLoop; i++) {
                var sellingOrder = MatchingEngine.sellingOrder[i];
                var currentOrderObjectArray = MatchingEngine.sellingOrder[i].orders;
                _.each(currentOrderObjectArray, function (sellingObject) {
                    console.log(buyObj.quantity);
                    if (buyObj.quantity >= sellingObject.quantity) {
                        var buyingTrade = _.cloneDeep(buyObj);
                        buyingTrade.rate = sellingOrder.rate;
                        buyingTrade.quantity = sellingObject.quantity;
                        buyingTrades.push(buyingTrade);

                        var sellingTrade = _.cloneDeep(sellingObject);
                        sellingTrade.rate = sellingOrder.rate;
                        sellingTrade.quantity = sellingObject.quantity;
                        sellingTrades.push(sellingTrade);
                        sellingObject.delete = true;
                        buyObj.quantity -= sellingObject.quantity;
                        if (buyObj.quantity == 0) {
                            endLoop = true;
                            return false;
                        }
                    } else if (buyObj.quantity < sellingObject.quantity) {
                        var buyingTrade = _.cloneDeep(buyObj);
                        buyingTrade.rate = sellingOrder.rate;
                        buyingTrade.quantity = buyObj.quantity;
                        buyingTrades.push(buyingTrade);

                        var sellingTrade = _.cloneDeep(sellingObject);
                        sellingTrade.rate = sellingOrder.rate;
                        sellingTrade.quantity = buyObj.quantity;
                        sellingTrades.push(sellingTrade);
                        sellingObject.quantity -= buyObj.quantity;


                        buyObj.quantity = 0;

                        endLoop = true;
                        return false;
                    }
                });
                MatchingEngine.sellingOrder[i].orders = _.filter(currentOrderObjectArray, function (n) {
                    return !n.delete;
                });
            }
            if (endLoop) {
                MatchingEngine.buyingOrder.shift();
            }

            var endLoop2 = false;
            for (i = 0; i < sellingOrdersCount && !endLoop2; i++) {
                if (MatchingEngine.sellingOrder[0].orders.length == 0) {
                    MatchingEngine.sellingOrder.shift();
                } else {
                    endLoop2 = true;
                }
            }

            if (buyingTrades && sellingTrades) {
                // Socket Call Buying HERE
                sails.sockets.blast("SellOrderAdded", MatchingEngine.sellingOrder);
                sails.sockets.blast("BuyOrderAdded", MatchingEngine.buyingOrder);
                // Socket for Selling HERE
                async.parallel([
                        function (callback) {
                            async.concat(buyingTrades, function (value, callback) {
                                Transaction.addTransaction(value, 'Buy', callback)
                            }, callback);
                        },
                        function (callback) {
                            async.concat(sellingTrades, function (value, callback) {
                                Transaction.addTransaction(value, 'Sell', callback)
                            }, callback);
                        }
                    ],
                    function (err, data) {
                        if (err) {
                            console.log("error occured")
                            // callback(null, err);
                        } else {
                            callback(null, {
                                buyingTrades: buyingTrades,
                                sellingTrades: sellingTrades,
                                buyingOrder: MatchingEngine.buyingOrder,
                                sellingOrder: MatchingEngine.sellingOrder,
                            });
                        }
                    });
            }
        }
    },

    matchingSellingOrderWithBuyingOrder: function (sellObj, rate, callback) {
        var indexNo = _.sortedIndexBy(MatchingEngine.buyingOrder, {
            rate: rate
        }, function (o) {
            return -1 * o.rate;
        });
        var buyingTrades = [];
        var sellingTrades = [];
        var buyingOrdersCount = 0;
        if (indexNo == 0) {
            if (MatchingEngine.buyingOrder.length > 0 && rate == MatchingEngine.buyingOrder[0].rate) {
                buyingOrdersCount = 1;
                startTrading(callback);
            } else {
                callback(); // No Trade Should Occur
            }
        } else if (indexNo == MatchingEngine.buyingOrder.length) {
            buyingOrdersCount = indexNo;
            startTrading(callback);
        } else {
            if (rate == MatchingEngine.buyingOrder[0].rate) {
                buyingOrdersCount = indexNo + 1;
                /**
                 * Multiple Trades will occur
                 */
                startTrading(callback);
            } else {
                buyingOrdersCount = indexNo + 1;
                /**
                 * Multiple Trades will occur
                 */
                startTrading(callback);
            }
        }

        function startTrading(callback) {
            var endLoop = false;
            console.log(buyingOrdersCount);
            for (i = 0; i < buyingOrdersCount && !endLoop; i++) {
                var buyingOrder = MatchingEngine.buyingOrder[i];
                var currentOrderObjectArray = MatchingEngine.buyingOrder[i].orders;
                _.each(currentOrderObjectArray, function (buyingObject) {
                    console.log(sellObj.quantity);
                    if (sellObj.quantity >= buyingObject.quantity) {
                        var buyingTrade = _.cloneDeep(buyingObject);
                        buyingTrade.rate = buyingOrder.rate;
                        buyingTrade.quantity = buyingObject.quantity;
                        buyingTrades.push(buyingTrade);

                        var sellingTrade = _.cloneDeep(sellObj);
                        sellingTrade.rate = buyingOrder.rate;
                        sellingTrade.quantity = buyingObject.quantity;
                        sellingTrades.push(sellingTrade);
                        buyingObject.delete = true;
                        sellObj.quantity -= buyingObject.quantity;
                        if (sellObj.quantity == 0) {
                            endLoop = true;
                            return false;
                        }
                    } else if (sellObj.quantity < buyingObject.quantity) {
                        var buyingTrade = _.cloneDeep(buyingObject);
                        buyingTrade.rate = buyingOrder.rate;
                        buyingTrade.quantity = sellObj.quantity;
                        buyingTrades.push(buyingTrade);

                        var sellingTrade = _.cloneDeep(sellObj);
                        sellingTrade.rate = buyingOrder.rate;
                        sellingTrade.quantity = sellObj.quantity;
                        sellingTrades.push(sellingTrade);
                        buyingObject.quantity -= sellObj.quantity;


                        sellObj.quantity = 0;

                        endLoop = true;
                        return false;
                    }
                });
                MatchingEngine.buyingOrder[i].orders = _.filter(currentOrderObjectArray, function (n) {
                    return !n.delete;
                });
            }
            if (endLoop) {
                MatchingEngine.sellingOrder.shift();
            }

            var endLoop2 = false;
            for (i = 0; i < buyingOrdersCount && !endLoop2; i++) {
                if (MatchingEngine.buyingOrder[0].orders.length == 0) {
                    MatchingEngine.buyingOrder.shift();
                } else {
                    endLoop2 = true;
                }
            }

            if (buyingTrades && sellingTrades) {
                sails.sockets.blast("SellOrderAdded", MatchingEngine.sellingOrder);
                sails.sockets.blast("BuyOrderAdded", MatchingEngine.buyingOrder);
                async.parallel([
                        function (callback) {
                            async.concatSeries(buyingTrades, function (value, callback) {
                                Transaction.addTransaction(value, 'Buy', callback)
                            }, callback);
                        },
                        function (callback) {
                            async.concatSeries(sellingTrades, function (value, callback) {
                                Transaction.addTransaction(value, 'Sell', callback)
                            }, callback);
                        }
                    ],
                    function (err, data) {
                        if (err) {
                            console.log("error occured")
                            callback(null, err);
                        } else {
                            callback(null, {
                                buyingTrades: buyingTrades,
                                sellingTrades: sellingTrades,
                                buyingOrder: MatchingEngine.buyingOrder,
                                sellingOrder: MatchingEngine.sellingOrder,
                            });
                        }
                    });
            }

        }
    },

    sendForTrade: function () {}
};