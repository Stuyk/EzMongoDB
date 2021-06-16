"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var mongodb_1 = require("mongodb");
var logger_1 = require("./utility/logger");
var isInitialized = false;
var client;
var db;
/**
 * Used to determine if the database has finished initializing.
 * @static
 * @return {Promise<boolean>}
 * @memberof Database
 */
function hasInitialized() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    if (isInitialized) {
                        return resolve(true);
                    }
                    var timeout = setInterval(function () {
                        if (!isInitialized) {
                            return;
                        }
                        clearTimeout(timeout);
                        return resolve(true);
                    }, 250);
                })];
        });
    });
}
var Database = {
    init: function (url, databaseName, collections) { return __awaiter(void 0, void 0, void 0, function () {
        var didConnect, currentCollections, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (client) {
                        return [2 /*return*/, true];
                    }
                    client = new mongodb_1.MongoClient(url, {
                        useUnifiedTopology: true,
                        useNewUrlParser: true
                    });
                    return [4 /*yield*/, client.connect().catch(function (err) {
                            console.error(err);
                            return false;
                        })];
                case 1:
                    didConnect = _a.sent();
                    if (!didConnect) {
                        logger_1.Logger.error("Failed to connect to Database with " + url + ". Double-check specified URL, and ports.");
                        return [2 /*return*/, false];
                    }
                    db = client.db(databaseName);
                    if (collections.length <= 0) {
                        return [2 /*return*/, true];
                    }
                    return [4 /*yield*/, db.collections()];
                case 2:
                    currentCollections = _a.sent();
                    _loop_1 = function (i) {
                        var collectionName, index;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    collectionName = collections[i];
                                    index = currentCollections.findIndex(function (x) { return x.collectionName === collectionName; });
                                    if (index >= 0) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    return [4 /*yield*/, db.createCollection(collectionName)];
                                case 1:
                                    _b.sent();
                                    logger_1.Logger.log("Generated Collection - " + collectionName);
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < collections.length)) return [3 /*break*/, 6];
                    return [5 /*yield**/, _loop_1(i)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    logger_1.Logger.log("Connection Established");
                    isInitialized = true;
                    return [2 /*return*/, true];
            }
        });
    }); },
    /**
     * Find one document by key and value pair. Equivalent of fetching by an id.
     * Use case: Fetching a single document with an id, name, username, etc.
     * @static
     * @template T
     * @param {string} key
     * @param {*} value
     * @param {string} collection
     * @return {(Promise<T | null>)}
     * @memberof Database
     */
    fetchData: function (key, value, collectionName) { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!key || !value || !collectionName) {
                        console.error("Failed to specify key, value, or collectionName for fetchAllByField.");
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, hasInitialized()];
                case 1:
                    _b.sent();
                    if (key === '_id' && typeof key !== 'object') {
                        value = new mongodb_1.ObjectId(value);
                    }
                    return [4 /*yield*/, db.collection(collectionName).findOne((_a = {}, _a[key] = value, _a))];
                case 2: return [2 /*return*/, _b.sent()];
            }
        });
    }); },
    /**
     * Fetch all data that matches a key and value pair as an array.
     * Use case: Fetching all users who have a specific boolean toggled.
     * @static
     * @template T
     * @param {string} key
     * @param {*} value
     * @param {string} collectionName
     * @return {Promise<T[]>}
     * @memberof Database
     */
    fetchAllByField: function (key, value, collectionName) { return __awaiter(void 0, void 0, void 0, function () {
        var collection;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!key || !value || !collectionName) {
                        console.error("Failed to specify key, value, or collectionName for fetchAllByField.");
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, hasInitialized()];
                case 1:
                    _b.sent();
                    if (key === '_id' && typeof key !== 'object') {
                        value = new mongodb_1.ObjectId(value);
                    }
                    return [4 /*yield*/, db.collection(collectionName)];
                case 2:
                    collection = _b.sent();
                    return [4 /*yield*/, collection.find((_a = {}, _a[key] = value, _a)).toArray()];
                case 3: return [2 /*return*/, _b.sent()];
            }
        });
    }); },
    /**
     * Get all elements from a collection.
     * @static
     * @template T
     * @param {string} collectionName
     * @return {Promise<Array<T[]>>}
     * @memberof Database
     */
    fetchAllData: function (collectionName) { return __awaiter(void 0, void 0, void 0, function () {
        var collection;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!collectionName) {
                        console.error("Failed to specify collectionName for fetchAllData.");
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, hasInitialized()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db.collection(collectionName)];
                case 2:
                    collection = _a.sent();
                    return [2 /*return*/, collection.find().toArray()];
            }
        });
    }); },
    /**
     * Insert a document and return the new full document with _id.
     * Use case: Insert a new entry into the database.
     * @param {T} document
     * @param {string} collection
     * @param {boolean} returnDocument
     * @returns {Promise<T | null>} Document
     * @template T
     */
    insertData: function (document, collection, returnDocument) {
        if (returnDocument === void 0) { returnDocument = false; }
        return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!document || !collection) {
                            logger_1.Logger.error("Failed to specify document or collection for insertData.");
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, hasInitialized()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db.collection(collection).insertOne(document)];
                    case 2:
                        result = _a.sent();
                        if (!returnDocument) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, db.collection(collection).findOne({ _id: result.insertedId })];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    },
    /**
     * Modify an existing document in the database. Must have an _id first to modify data.
     * Use case: Update an existing document with new data, or update existing data.
     * @static
     * @param {*} _id
     * @param {Object} data
     * @param {string} collection
     * @return {Promise<boolean>}
     * @memberof Database
     */
    updatePartialData: function (_id, data, collection) { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_id || !data || !collection) {
                        logger_1.Logger.error("Failed to specify id, data or collection for updatePartialData.");
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, hasInitialized()];
                case 1:
                    _a.sent();
                    if (typeof _id !== 'object') {
                        _id = new mongodb_1.ObjectId(_id);
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.collection(collection).findOneAndUpdate({ _id: _id }, { $set: __assign({}, data) })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, true];
                case 4:
                    err_1 = _a.sent();
                    logger_1.Logger.error("Could not find and update a value with id: " + _id.toString());
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    }); },
    /**
     * Delete a document by _id and collection.
     * Use case: Delete the entry from the database collection.
     * @static
     * @param {*} _id
     * @param {string} collection
     * @return {Promise<boolean>}
     * @memberof Database
     */
    deleteById: function (_id, collection) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_id || !collection) {
                        console.error("Failed to specify id, or collection for deleteById");
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, hasInitialized()];
                case 1:
                    _a.sent();
                    if (typeof _id !== 'object') {
                        _id = new mongodb_1.ObjectId(_id);
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.collection(collection).findOneAndDelete({ _id: _id })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, true];
                case 4:
                    err_2 = _a.sent();
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    }); },
    /**
     * Specify a list of fields to select from the database in a collection.
     * Use case: Selects all data from a collection and only returns the specified keys.
     * @template T
     * @param {string} collection
     * @param {string[]} fieldNames
     * @return {Promise<T[]>}
     * @memberof Database
     */
    selectData: function (collection, keys) { return __awaiter(void 0, void 0, void 0, function () {
        var selectData, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!keys || !collection) {
                        console.error("Failed to specify keys, or collection for selectData");
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, hasInitialized()];
                case 1:
                    _a.sent();
                    selectData = {
                        _id: 1
                    };
                    for (i = 0; i < keys.length; i++) {
                        selectData[keys[i]] = 1;
                    }
                    return [4 /*yield*/, db
                            .collection(collection)
                            .find({})
                            .project(__assign({}, selectData))
                            .toArray()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); },
    /**
     * Update any data that matches specified field name and value.
     * Use case: Could be used to migrate old field values to new field values in bulk in a collection.
     * @param {string} fieldName
     * @param {*} fieldValue
     * @param {Object} data
     * @param {string} collection
     * @return {*}  {Promise<boolean>}
     * @memberof Database
     */
    updateDataByFieldMatch: function (key, value, data, collection) { return __awaiter(void 0, void 0, void 0, function () {
        var updated;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!key || !value || !data || !collection) {
                        console.error("Failed to specify key, value, data, or collection for updateDataByFieldMatch.");
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, hasInitialized()];
                case 1:
                    _b.sent();
                    if (key === '_id' && typeof value !== 'object') {
                        value = new mongodb_1.ObjectID(value);
                    }
                    return [4 /*yield*/, db.collection(collection).findOneAndUpdate((_a = {}, _a[key] = value, _a), { $set: __assign({}, data) })];
                case 2:
                    updated = _b.sent();
                    if (!updated || !updated.ok) {
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, true];
            }
        });
    }); },
    /**
     * Drop a collection from the database.
     * @static
     * @param {string} collectionName
     * @return {Promise<void>}
     * @memberof Database
     */
    dropCollection: function (collectionName) { return __awaiter(void 0, void 0, void 0, function () {
        var res, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!collectionName) {
                        console.error("Failed to specify collectionName for dropCollection.");
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, hasInitialized()];
                case 1:
                    _a.sent();
                    res = false;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .collection(collectionName)
                            .drop()
                            .then(function (res) {
                            return true;
                        })
                            .catch(function (err) {
                            return false;
                        })];
                case 3:
                    res = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _a.sent();
                    logger_1.Logger.log("Did not find " + collectionName + " to drop.");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, res];
            }
        });
    }); },
    /**
     * Remove an entire database from MongoDB. Including all collections.
     * @static
     * @return {Promise<boolean>}
     * @memberof Database
     */
    dropDatabase: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hasInitialized()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, client
                            .db()
                            .dropDatabase()
                            .catch(function (err) {
                            logger_1.Logger.error(err);
                            return false;
                        })
                            .then(function (res) {
                            logger_1.Logger.log("Dropped database successfully.");
                            return true;
                        })];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); },
    /**
     * Close the connection to the database.
     * @static
     * @return {Promise<void>}
     * @memberof Database
     */
    close: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!client) {
                        db = null;
                        isInitialized = false;
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, client.close(true)];
                case 1:
                    _a.sent();
                    client = null;
                    db = null;
                    isInitialized = false;
                    return [2 /*return*/];
            }
        });
    }); }
};
module.exports = Database;
//# sourceMappingURL=index.js.map