import { Db } from 'mongodb';
/** @type {*} */
declare const Database: {
    init: (url: string, databaseName: string, collections: Array<string>) => Promise<boolean>;
    /**
     * Returns the database currently being worked with directly.
     * @returns {Db}
     */
    getDatabaseInstance: () => Promise<Db>;
    /**
     * Returns if a collection exists.
     * @param {string} collection
     * @returns
     */
    doesCollectionExist: (collection: string) => Promise<boolean>;
    /**
     * Create a collection if the collection does not exist.
     * @param {string} collection
     * @param {boolean} returnFalseIfExists - Defaults to false, but if set to true returns false if collection exists already
     **/
    createCollection: (collection: string, returnFalseIfExists?: boolean) => Promise<boolean>;
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
    fetchData: <T>(key: string, value: any, collectionName: string) => Promise<T>;
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
    fetchAllByField: <T_1>(key: string, value: any, collectionName: string) => Promise<T_1[]>;
    /**
     * Get all elements from a collection.
     * @static
     * @template T
     * @param {string} collectionName
     * @return {Promise<Array<T[]>>}
     * @memberof Database
     */
    fetchAllData: <T_2>(collectionName: string) => Promise<T_2[]>;
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
    createSearchIndex: (key: string, collectionName: string) => Promise<void>;
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
    fetchWithSearch: <T_3>(searchTerm: string, collectionName: string) => Promise<T_3[]>;
    /**
     * Insert a document and return the new full document with _id.
     * Use case: Insert a new entry into the database.
     * @param {T} document
     * @param {string} collection
     * @param {boolean} returnDocument
     * @returns {Promise<T | null>} Document
     * @template T
     */
    insertData: <T_4>(document: T_4, collection: string, returnDocument?: boolean) => Promise<T_4>;
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
    updatePartialData: (_id: any, data: Object, collection: string, unset?: Object) => Promise<boolean>;
    /**
     * Modify an existing document in the database using raw mongodb syntax. Must have an _id first to modify data.
     * Use case: Update an existing document with specific update operators
     * @static
     * @param {*} _id
     * @param {Object} rawData
     * @param {string} collection
     * @return {Promise<boolean>}
     * @memberof Database
     */
    updatePartialDataRaw: (_id: any, rawData: Object, collection: string) => Promise<boolean>;
    /**
     * Removes an existing field from an document. Must have an _id first to remove fields.
     * Use case: Update existing document with new data structure
     * @static
     * @param {*} _id
     * @param {Object} data
     * @param {string} collection
     * @return {Promise<boolean>}
     * @memberof Database
     */
    removePartialData: (_id: any, data: Object, collection: string) => Promise<boolean>;
    /**
     * Delete a document by _id and collection.
     * Use case: Delete the entry from the database collection.
     * @static
     * @param {*} _id
     * @param {string} collection
     * @return {Promise<boolean>}
     * @memberof Database
     */
    deleteById: (_id: any, collection: string) => Promise<boolean>;
    /**
     * Specify a list of fields to select from the database in a collection.
     * Use case: Selects all data from a collection and only returns the specified keys.
     * @template T
     * @param {string} collection
     * @param {string[]} fieldNames
     * @return {Promise<T[]>}
     * @memberof Database
     */
    selectData: <T_5>(collection: string, keys: string[]) => Promise<T_5[]>;
    /**
     * Uses default mongodb element match functionality.
     *
     * See: https://www.mongodb.com/docs/manual/reference/operator/query/elemMatch/#array-of-embedded-documents
     *
     * @param {string} collection
     * @param {string} propertyName
     * @param {{ [key: string]: any }} elementMatch
     * @returns
     */
    selectWithElementMatch: <T_6>(collection: string, propertyName: string, elementMatch: {
        [key: string]: any;
    }) => Promise<T_6[]>;
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
    updateDataByFieldMatch: (key: string, value: any, data: Object, collection: string) => Promise<boolean>;
    /**
     * Drop a collection from the database.
     * @static
     * @param {string} collectionName
     * @return {Promise<void>}
     * @memberof Database
     */
    dropCollection: (collectionName: string) => Promise<boolean>;
    /**
     * Remove an entire database from MongoDB. Including all collections.
     * @static
     * @return {Promise<boolean>}
     * @memberof Database
     */
    dropDatabase: () => Promise<boolean>;
    /**
     * Close the connection to the database.
     * @static
     * @return {Promise<void>}
     * @memberof Database
     */
    close: () => Promise<void>;
};
export = Database;
