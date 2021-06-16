import { Db, MongoClient, ObjectId, ObjectID } from 'mongodb';

import { Logger } from './utility/logger';

let isInitialized = false;
let client: MongoClient;
let db: Db;

export default class Database {
    /**
     * Used to initialize the Database instance.
     * @static
     * @param {string} url
     * @param {string} databaseName
     * @param {Array<string>} collections
     * @return {*}  {Promise<boolean>}
     * @memberof Database
     */
    static async init(url: string, databaseName: string, collections: Array<string>): Promise<boolean> {
        if (client) {
            return true;
        }

        client = new MongoClient(url, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });

        const didConnect = await client.connect().catch((err) => {
            console.error(err);
            return false;
        });

        if (!didConnect) {
            Logger.error(`Failed to connect to Database with ${url}. Double-check specified URL, and ports.`);
            return false;
        }

        db = client.db(databaseName);

        if (collections.length <= 0) {
            return true;
        }

        const currentCollections = await db.collections();

        for (let i = 0; i < collections.length; i++) {
            const collectionName = collections[i];
            const index = currentCollections.findIndex((x) => x.collectionName === collectionName);

            if (index >= 0) {
                continue;
            }

            await db.createCollection(collectionName);
            Logger.log(`Generated Collection - ${collectionName}`);
        }

        Logger.log(`Connection Established`);
        isInitialized = true;
        return true;
    }

    /**
     * Used to determine if the database has finished initializing.
     * @static
     * @return {Promise<boolean>}
     * @memberof Database
     */
    static async hasInitialized(): Promise<boolean> {
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
    static async fetchData<T>(key: string, value: any, collectionName: string): Promise<T | null> {
        if (!key || !value || !collectionName) {
            console.error(`Failed to specify key, value, or collectionName for fetchAllByField.`);
            return null;
        }

        await Database.hasInitialized();

        if (key === '_id' && typeof key !== 'object') {
            value = new ObjectId(value);
        }

        return await db.collection(collectionName).findOne({ [key]: value });
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
    static async fetchAllByField<T>(key: string, value: any, collectionName: string): Promise<T[]> {
        if (!key || !value || !collectionName) {
            console.error(`Failed to specify key, value, or collectionName for fetchAllByField.`);
            return [];
        }

        await Database.hasInitialized();

        if (key === '_id' && typeof key !== 'object') {
            value = new ObjectId(value);
        }

        const collection = await db.collection(collectionName);
        return await collection.find({ [key]: value }).toArray();
    }

    /**
     * Get all elements from a collection.
     * @static
     * @template T
     * @param {string} collectionName
     * @return {Promise<Array<T[]>>}
     * @memberof Database
     */
    static async fetchAllData<T>(collectionName: string): Promise<T[]> {
        if (!collectionName) {
            console.error(`Failed to specify collectionName for fetchAllData.`);
            return [];
        }

        await Database.hasInitialized();

        const collection = await db.collection(collectionName);
        return collection.find().toArray();
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
    static async insertData<T>(document: T, collection: string, returnDocument = false): Promise<T> {
        if (!document || !collection) {
            Logger.error(`Failed to specify document or collection for insertData.`);
            return null;
        }

        await Database.hasInitialized();

        const result = await db.collection(collection).insertOne(document);

        if (!returnDocument) {
            return null;
        }

        return await db.collection(collection).findOne({ _id: result.insertedId });
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
    static async updatePartialData(_id: any, data: Object, collection: string): Promise<boolean> {
        if (!_id || !data || !collection) {
            Logger.error(`Failed to specify id, data or collection for updatePartialData.`);
            return null;
        }

        await Database.hasInitialized();

        if (typeof _id !== 'object') {
            _id = new ObjectId(_id);
        }

        try {
            await db.collection(collection).findOneAndUpdate({ _id }, { $set: { ...data } });
            return true;
        } catch (err) {
            Logger.error(`Could not find and update a value with id: ${_id.toString()}`);
            return false;
        }
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
    static async deleteById(_id: any, collection: string): Promise<boolean> {
        if (!_id || !collection) {
            console.error(`Failed to specify id, or collection for deleteById`);
            return false;
        }

        await Database.hasInitialized();

        if (typeof _id !== 'object') {
            _id = new ObjectId(_id);
        }

        try {
            await db.collection(collection).findOneAndDelete({ _id });
            return true;
        } catch (err) {
            return false;
        }
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
    static async selectData<T>(collection: string, keys: string[]): Promise<T[]> {
        if (!keys || !collection) {
            console.error(`Failed to specify keys, or collection for selectData`);
            return [];
        }

        await Database.hasInitialized();

        const selectData = {
            _id: 1
        };

        for (let i = 0; i < keys.length; i++) {
            selectData[keys[i]] = 1;
        }

        return await db
            .collection(collection)
            .find({})
            .project({ ...selectData })
            .toArray();
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
    static async updateDataByFieldMatch(key: string, value: any, data: Object, collection: string): Promise<boolean> {
        if (!key || !value || !data || !collection) {
            console.error(`Failed to specify key, value, data, or collection for updateDataByFieldMatch.`);
            return false;
        }

        await Database.hasInitialized();

        if (key === '_id' && typeof value !== 'object') {
            value = new ObjectID(value);
        }

        const updated = await db.collection(collection).findOneAndUpdate({ [key]: value }, { $set: { ...data } });

        if (!updated || !updated.ok) {
            return false;
        }

        return true;
    }

    /**
     * Drop a collection from the database.
     * @static
     * @param {string} collectionName
     * @return {Promise<void>}
     * @memberof Database
     */
    static async dropCollection(collectionName: string): Promise<boolean> {
        if (!collectionName) {
            console.error(`Failed to specify collectionName for dropCollection.`);
            return false;
        }

        await Database.hasInitialized();

        let res = false;

        try {
            res = await db
                .collection(collectionName)
                .drop()
                .then((res) => {
                    return true;
                })
                .catch((err) => {
                    return false;
                });
        } catch (err) {
            Logger.log(`Did not find ${collectionName} to drop.`);
        }

        return res;
    }

    /**
     * Remove an entire database from MongoDB. Including all collections.
     * @static
     * @return {Promise<boolean>}
     * @memberof Database
     */
    static async dropDatabase(): Promise<boolean> {
        await Database.hasInitialized();

        return await client
            .db()
            .dropDatabase()
            .catch((err) => {
                Logger.error(err);
                return false;
            })
            .then((res) => {
                Logger.log(`Dropped database successfully.`);
                return true;
            });
    }

    /**
     * Close the connection to the database.
     * @static
     * @return {Promise<void>}
     * @memberof Database
     */
    static async close(): Promise<void> {
        if (!client) {
            db = null;
            isInitialized = false;
            return;
        }

        await client.close(true);

        client = null;
        db = null;
        isInitialized = false;
    }
}
