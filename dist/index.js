"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const logger_1 = require("./utility/logger");
let isInitialized = false;
let client;
let db;
class Database {
    /**
     * Used to initialize the Database instance.
     * @static
     * @param {string} url
     * @param {string} databaseName
     * @param {Array<string>} collections
     * @return {*}  {Promise<boolean>}
     * @memberof Database
     */
    static init(url, databaseName, collections) {
        return __awaiter(this, void 0, void 0, function* () {
            if (client) {
                return true;
            }
            client = new mongodb_1.MongoClient(url, {
                useUnifiedTopology: true,
                useNewUrlParser: true,
            });
            const didConnect = yield client.connect().catch((err) => {
                console.error(err);
                return false;
            });
            if (!didConnect) {
                logger_1.Logger.error(`Failed to connect to Database with ${url}. Double-check specified URL, and ports.`);
                return false;
            }
            db = client.db(databaseName);
            if (collections.length <= 0) {
                return true;
            }
            const currentCollections = yield db.collections();
            for (let i = 0; i < collections.length; i++) {
                const collectionName = collections[i];
                const index = currentCollections.findIndex((x) => x.collectionName === collectionName);
                if (index >= 0) {
                    continue;
                }
                yield db.createCollection(collectionName);
                logger_1.Logger.log(`Generated Collection - ${collectionName}`);
            }
            logger_1.Logger.log(`Connection Established`);
            isInitialized = true;
            return true;
        });
    }
    /**
     * Used to determine if the database has finished initializing.
     * @static
     * @return {Promise<boolean>}
     * @memberof Database
     */
    static hasInitialized() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (isInitialized) {
                    return resolve(true);
                }
                const timeout = setInterval(() => {
                    if (!isInitialized) {
                        return;
                    }
                    clearTimeout(timeout);
                    return resolve(true);
                }, 250);
            });
        });
    }
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
    static fetchData(key, value, collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!key || !value || !collectionName) {
                console.error(`Failed to specify key, value, or collectionName for fetchAllByField.`);
                return null;
            }
            yield Database.hasInitialized();
            if (key === '_id' && typeof key !== 'object') {
                value = new mongodb_1.ObjectId(value);
            }
            return yield db.collection(collectionName).findOne({ [key]: value });
        });
    }
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
    static fetchAllByField(key, value, collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!key || !value || !collectionName) {
                console.error(`Failed to specify key, value, or collectionName for fetchAllByField.`);
                return [];
            }
            yield Database.hasInitialized();
            if (key === '_id' && typeof key !== 'object') {
                value = new mongodb_1.ObjectId(value);
            }
            const collection = yield db.collection(collectionName);
            return yield collection.find({ [key]: value }).toArray();
        });
    }
    /**
     * Get all elements from a collection.
     * @static
     * @template T
     * @param {string} collectionName
     * @return {Promise<Array<T[]>>}
     * @memberof Database
     */
    static fetchAllData(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!collectionName) {
                console.error(`Failed to specify collectionName for fetchAllData.`);
                return [];
            }
            yield Database.hasInitialized();
            const collection = yield db.collection(collectionName);
            return collection.find().toArray();
        });
    }
    /**
     * Insert a document and return the new full document with _id.
     * Use case: Insert a new entry into the database.
     * @param {T} document
     * @param {string} collection
     * @param {boolean} returnDocument
     * @returns {Promise<T | null>} Document
     * @template T
     */
    static insertData(document, collection, returnDocument = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!document || !collection) {
                logger_1.Logger.error(`Failed to specify document or collection for insertData.`);
                return null;
            }
            yield Database.hasInitialized();
            const result = yield db.collection(collection).insertOne(document);
            if (!returnDocument) {
                return null;
            }
            return yield db.collection(collection).findOne({ _id: result.insertedId });
        });
    }
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
    static updatePartialData(_id, data, collection) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!_id || !data || !collection) {
                logger_1.Logger.error(`Failed to specify id, data or collection for updatePartialData.`);
                return null;
            }
            yield Database.hasInitialized();
            if (typeof _id !== 'object') {
                _id = new mongodb_1.ObjectId(_id);
            }
            try {
                yield db.collection(collection).findOneAndUpdate({ _id }, { $set: Object.assign({}, data) });
                return true;
            }
            catch (err) {
                logger_1.Logger.error(`Could not find and update a value with id: ${_id.toString()}`);
                return false;
            }
        });
    }
    /**
     * Delete a document by _id and collection.
     * Use case: Delete the entry from the database collection.
     * @static
     * @param {*} _id
     * @param {string} collection
     * @return {Promise<boolean>}
     * @memberof Database
     */
    static deleteById(_id, collection) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!_id || !collection) {
                console.error(`Failed to specify id, or collection for deleteById`);
                return false;
            }
            yield Database.hasInitialized();
            if (typeof _id !== 'object') {
                _id = new mongodb_1.ObjectId(_id);
            }
            try {
                yield db.collection(collection).findOneAndDelete({ _id });
                return true;
            }
            catch (err) {
                return false;
            }
        });
    }
    /**
     * Specify a list of fields to select from the database in a collection.
     * Use case: Selects all data from a collection and only returns the specified keys.
     * @template T
     * @param {string} collection
     * @param {string[]} fieldNames
     * @return {Promise<T[]>}
     * @memberof Database
     */
    static selectData(collection, keys) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!keys || !collection) {
                console.error(`Failed to specify keys, or collection for selectData`);
                return [];
            }
            yield Database.hasInitialized();
            const selectData = {
                _id: 1,
            };
            for (let i = 0; i < keys.length; i++) {
                selectData[keys[i]] = 1;
            }
            return yield db
                .collection(collection)
                .find({})
                .project(Object.assign({}, selectData))
                .toArray();
        });
    }
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
    static updateDataByFieldMatch(key, value, data, collection) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!key || !value || !data || !collection) {
                console.error(`Failed to specify key, value, data, or collection for updateDataByFieldMatch.`);
                return false;
            }
            yield Database.hasInitialized();
            if (key === '_id' && typeof value !== 'object') {
                value = new mongodb_1.ObjectID(value);
            }
            const updated = yield db.collection(collection).findOneAndUpdate({ [key]: value }, { $set: Object.assign({}, data) });
            if (!updated || !updated.ok) {
                return false;
            }
            return true;
        });
    }
    /**
     * Drop a collection from the database.
     * @static
     * @param {string} collectionName
     * @return {Promise<void>}
     * @memberof Database
     */
    static dropCollection(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!collectionName) {
                console.error(`Failed to specify collectionName for dropCollection.`);
                return false;
            }
            yield Database.hasInitialized();
            let res = false;
            try {
                res = yield db
                    .collection(collectionName)
                    .drop()
                    .then((res) => {
                    return true;
                })
                    .catch((err) => {
                    return false;
                });
            }
            catch (err) {
                logger_1.Logger.log(`Did not find ${collectionName} to drop.`);
            }
            return res;
        });
    }
    /**
     * Remove an entire database from MongoDB. Including all collections.
     * @static
     * @return {Promise<boolean>}
     * @memberof Database
     */
    static dropDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Database.hasInitialized();
            return yield client
                .db()
                .dropDatabase()
                .catch((err) => {
                logger_1.Logger.error(err);
                return false;
            })
                .then((res) => {
                logger_1.Logger.log(`Dropped database successfully.`);
                return true;
            });
        });
    }
    /**
     * Close the connection to the database.
     * @static
     * @return {Promise<void>}
     * @memberof Database
     */
    static close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client) {
                db = null;
                isInitialized = false;
                return;
            }
            yield client.close(true);
            client = null;
            db = null;
            isInitialized = false;
        });
    }
}
exports.default = Database;
//# sourceMappingURL=index.js.map