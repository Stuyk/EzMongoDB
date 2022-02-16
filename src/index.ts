import { Db, MongoClient, ObjectId, ObjectID } from 'mongodb';

import { Logger } from './utility/logger';

let isInitialized = false;
let client: MongoClient;
let db: Db;

/**
 * Used to determine if the database has finished initializing.
 * @static
 * @return {Promise<boolean>}
 * @memberof Database
 */
async function hasInitialized(): Promise<boolean> {
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

/** @type {*} */
const Database = {
    init: async (url: string, databaseName: string, collections: Array<string>): Promise<boolean> => {
        if (client) {
            return true;
        }

        client = new MongoClient(url, { retryReads: true, retryWrites: true });

        const didConnect = await client.connect().catch((err) => {
            console.error(err);
            return false;
        });

        if (!didConnect) {
            Logger.error(`Failed to connect to Database with ${url}. Double-check specified URL, and ports.`);
            return false;
        }

        // Force Reconnection
        client.on('connectionClosed', () => {
            isInitialized = false;
            Logger.log(`Failed to connect to Database, retrying connection...`);
            Database.init(url, databaseName, collections);
        });

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
    },

    /**
     * Create a collection if they do not exist.
     * @param {string} collection
     **/
    createCollection: async (collection: string): Promise<boolean> => {
        if (!collection || typeof collection !== 'string') {
            console.error(`Failed to specify collections.`);
            return false;
        }

        await hasInitialized();

        const currentCollections = await db.collections();

        const index = await currentCollections.findIndex((x) => x.collectionName === collection);
        if (index >= 0) {
            return true;
        }

        const result = await db.createCollection(collection).catch((err) => {
            return false;
        });

        if (!result) {
            return result as boolean;
        }

        return true;
    },

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
    fetchData: async <T>(key: string, value: any, collectionName: string): Promise<T | null> => {
        if (!key || !value || !collectionName) {
            console.error(`Failed to specify key, value, or collectionName for fetchAllByField.`);
            return null;
        }

        await hasInitialized();

        if (key === '_id' && typeof key !== 'object') {
            value = new ObjectId(value);
        }

        return await db.collection(collectionName).findOne<T>({ [key]: value });
    },

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
    fetchAllByField: async <T>(key: string, value: any, collectionName: string): Promise<T[]> => {
        if (!key || !value || !collectionName) {
            console.error(`Failed to specify key, value, or collectionName for fetchAllByField.`);
            return [];
        }

        await hasInitialized();

        if (key === '_id' && typeof key !== 'object') {
            value = new ObjectId(value);
        }

        const collection = await db.collection(collectionName);
        return await collection.find<T>({ [key]: value }).toArray();
    },

    /**
     * Get all elements from a collection.
     * @static
     * @template T
     * @param {string} collectionName
     * @return {Promise<Array<T[]>>}
     * @memberof Database
     */
    fetchAllData: async <T>(collectionName: string): Promise<T[]> => {
        if (!collectionName) {
            console.error(`Failed to specify collectionName for fetchAllData.`);
            return [];
        }

        await hasInitialized();

        const collection = await db.collection(collectionName);
        return collection.find<T>({}).toArray();
    },
    /**
     * Creates a search index for a specific 'text' field. Requires a 'string' field. Not numbers.
     * Use case: Searching for all users with 'Johnny' in their 'name' key.
     * @static
     * @template T
     * @param {string} key The key of the document that needs to be indexed
     * @param {string} collectionName The collection which this document needs indexing on.
     * @return {Promise<void>}
     * @memberof Database
     */
    createSearchIndex: async (key: string, collectionName: string): Promise<void> => {
        if (!collectionName) {
            Logger.error(`Failed to specify collectionName for createSearchIndex.`);
            return;
        }

        await hasInitialized();

        const collection = await db.collection(collectionName);
        const doesIndexExist = await collection.indexExists(key);

        if (!doesIndexExist) {
            await collection.createIndex({ [key]: 'text' });
        }
    },

    /**
     * Fetch all data that uses a search term inside a field name.
     * Use case: Searching for all users with 'Johnny' in their 'name' key.
     * @static
     * @template T
     * @param {string} key
     * @param {string} searchTerm
     * @param {string} collectionName
     * @return {Promise<T[]>}
     * @memberof Database
     */
    fetchWithSearch: async <T>(searchTerm: string, collectionName: string): Promise<T[]> => {
        if (!collectionName) {
            Logger.error(`Failed to specify collectionName for fetchWithSearch.`);
            return [];
        }

        await hasInitialized();

        const collection = await db.collection(collectionName);
        let results;

        try {
            results = await collection.find<T>({ $text: { $search: searchTerm, $caseSensitive: false } }).toArray();
        } catch (err) {
            Logger.error(
                `Failed to use 'createSearchIndex' before searching collection. Use 'createSearchIndex' function once, and property must be of stirng type in object.`
            );
            return [];
        }

        return results;
    },

    /**
     * Insert a document and return the new full document with _id.
     * Use case: Insert a new entry into the database.
     * @param {T} document
     * @param {string} collection
     * @param {boolean} returnDocument
     * @returns {Promise<T | null>} Document
     * @template T
     */
    insertData: async <T>(document: T, collection: string, returnDocument = false): Promise<T> => {
        if (!document || !collection) {
            Logger.error(`Failed to specify document or collection for insertData.`);
            return null;
        }

        await hasInitialized();

        const result = await db.collection(collection).insertOne(document);

        if (!returnDocument) {
            return null;
        }

        return await db.collection(collection).findOne<T>({ _id: result.insertedId });
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
    updatePartialData: async (_id: any, data: Object, collection: string): Promise<boolean> => {
        if (!_id || !data || !collection) {
            Logger.error(`Failed to specify id, data or collection for updatePartialData.`);
            return null;
        }

        await hasInitialized();

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
    },

    /**
     * Delete a document by _id and collection.
     * Use case: Delete the entry from the database collection.
     * @static
     * @param {*} _id
     * @param {string} collection
     * @return {Promise<boolean>}
     * @memberof Database
     */
    deleteById: async (_id: any, collection: string): Promise<boolean> => {
        if (!_id || !collection) {
            console.error(`Failed to specify id, or collection for deleteById`);
            return false;
        }

        await hasInitialized();

        if (typeof _id !== 'object') {
            _id = new ObjectId(_id);
        }

        try {
            await db.collection(collection).findOneAndDelete({ _id });
            return true;
        } catch (err) {
            return false;
        }
    },

    /**
     * Specify a list of fields to select from the database in a collection.
     * Use case: Selects all data from a collection and only returns the specified keys.
     * @template T
     * @param {string} collection
     * @param {string[]} fieldNames
     * @return {Promise<T[]>}
     * @memberof Database
     */
    selectData: async <T>(collection: string, keys: string[]): Promise<T[]> => {
        if (!keys || !collection) {
            console.error(`Failed to specify keys, or collection for selectData`);
            return [];
        }

        await hasInitialized();

        const selectData = {
            _id: 1
        };

        for (let i = 0; i < keys.length; i++) {
            selectData[keys[i]] = 1;
        }

        return await db
            .collection(collection)
            .find<T>({})
            .project<T>({ ...selectData })
            .toArray();
    },

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
    updateDataByFieldMatch: async (key: string, value: any, data: Object, collection: string): Promise<boolean> => {
        if (!key || !value || !data || !collection) {
            console.error(`Failed to specify key, value, data, or collection for updateDataByFieldMatch.`);
            return false;
        }

        await hasInitialized();

        if (key === '_id' && typeof value !== 'object') {
            value = new ObjectID(value);
        }

        const updated = await db.collection(collection).findOneAndUpdate({ [key]: value }, { $set: { ...data } });

        if (!updated || !updated.ok) {
            return false;
        }

        return true;
    },

    /**
     * Drop a collection from the database.
     * @static
     * @param {string} collectionName
     * @return {Promise<void>}
     * @memberof Database
     */
    dropCollection: async (collectionName: string): Promise<boolean> => {
        if (!collectionName) {
            console.error(`Failed to specify collectionName for dropCollection.`);
            return false;
        }

        await hasInitialized();

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
    },

    /**
     * Remove an entire database from MongoDB. Including all collections.
     * @static
     * @return {Promise<boolean>}
     * @memberof Database
     */
    dropDatabase: async (): Promise<boolean> => {
        await hasInitialized();

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
    },

    /**
     * Close the connection to the database.
     * @static
     * @return {Promise<void>}
     * @memberof Database
     */
    close: async (): Promise<void> => {
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
};

export = Database;
