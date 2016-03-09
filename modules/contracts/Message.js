var private = {}, self = null,
	library = null, modules = null;

function Message(cb, _library) {
	self = this;
	self.type = 7
	library = _library;
	cb(null, self);
}

Message.prototype.create = function (data, trs) {
	trs.recipientId = data.recipientId;

	trs.asset = {
		message: new Buffer(data.message, 'utf8').toString('hex')
	};

	return trs;
}

Message.prototype.calculateFee = function (trs) {
	return 100000000;
}

Message.prototype.verify = function (trs, sender, cb, scope) {
	if (tra.asset.message.length > 320) {
		return setImmediate(cb, "Max length of message is 320 chars");
	}


	setImmediate(cb, null, trs);
}

Message.prototype.getBytes = function (trs) {
	return new Buffer(trs.asset.message, 'hex');
}

Message.prototype.apply = function (trs, sender, cb, scope) {
    modules.blockchain.accounts.mergeAccountAndGet({
        address: sender.address,
        balance: -trs.fee
    }, cb);
}

Message.prototype.undo = function (trs, sender, cb, scope) {
    modules.blockchain.accounts.undoMerging({
        address: sender.address,
        balance: -trs.fee
    }, cb);
}

Message.prototype.applyUnconfirmed = function (trs, sender, cb, scope) {
    if (sender.u_balance < trs.fee) {
        return setImmediate(cb, "Sender doesn't have enough coins");
    }

    modules.blockchain.accounts.mergeAccountAndGet({
        address: sender.address,
        u_balance: -trs.fee
    }, cb);
}

Message.prototype.undoUnconfirmed = function (trs, sender, cb, scope) {
    modules.blockchain.accounts.undoMerging({
        address: sender.address,
        u_balance: -trs.fee
    }, cb);
}

Message.prototype.ready = function (trs, sender, cb, scope) {
	setImmediate(cb);
}

Message.prototype.save = function (trs, cb) {
	modules.api.sql.insert({
		table: "asset_messages",
		values: {
			transactionId: trs.id,
			message: trs.asset.message
		}
	}, cb);
}

Message.prototype.dbRead = function (row) {
	if (!row.tm_transactionId) {
		return null;
	} else {
		return {
			message: row.tm_message
		};
	}
}

Message.prototype.normalize = function (asset, cb) {
	library.validator.validate(asset, {
		type: "object",
		properties: {
			message: {
				type: "string",
				format: "hex",
				minLength: 1
			}
		},
		required: ["message"]
	}, cb);
}

Message.prototype.onBind = function (_modules) {
	modules = _modules;
	modules.logic.transaction.attachAssetType(self.type, self);
}

Message.prototype.add = function (cb, query) {
    // Validate query object
    library.validator.validate(query, {
        type: "object",
        properties: {
            recipientId: {
                type: "string",
                minLength: 1,
                maxLength: 21
            },
            secret: {
                type: "string",
                minLength: 1,
                maxLength: 100
            },
            message: {
                type: "string",
                minLength: 1,
                maxLength: 160
            }
        }
    }, function (err) {
        // If error exists, execute callback with error as first argument
        if (err) {
            return cb(err[0].message);
        }
    });
}

Message.prototype.list = function (cb, query) {
    // Verify query parameters
    library.validator.validate(query, {
        type: "object",
        properties: {
            recipientId: {
                type: "string",
                minLength: 2,
                maxLength: 21
            }
        },
        required: ["recipientId"]
    }, function (err) {
        if (err) {
            return cb(err[0].message);
        }

        // Select from transactions table and join messages from the asset_messages table
        modules.api.sql.select({
            table: "transactions",
            alias: "t",
            condition: {
                recipientId: query.recipientId,
                type: self.type
            },
            join: [{
                type: 'left outer',
                table: 'asset_messages',
                alias: "tm",
                on: {"t.id": "tm.transactionId"}
            }]
        }, ['id', 'type', 'senderId', 'senderPublicKey', 'recipientId', 'amount', 'fee', 'signature', 'blockId', 'transactionId', 'message'], function (err, transactions) {
            if (err) {
                return cb(err.toString());
            }

            // Map results to asset object
            var messages = transactions.map(function (tx) {
                tx.asset = {
                    message: new Buffer(tx.message, 'hex').toString('utf8')
                };

                delete tx.message;
                return tx;
            });

            return cb(null, {
                messages: messages
            })
        });
    });
}

module.exports = Message;