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
    static init(url: string, databaseName: string, collections: Array<string>): Promise<boolean>;
    /**
     * Used to determine if the database has finished initializing.
     * @static
     * @return {Promise<boolean>}
     * @memberof Database
     */
    static hasInitialized(): Promise<boolean>;
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
    static fetchData<T>(key: string, value: any, collectionName: string): Promise<T | null>;
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
    static fetchAllByField<T>(key: string, value: any, collectionName: string): Promise<T[]>;
    /**
     * Get all elements from a collection.
     * @static
     * @template T
     * @param {string} collectionName
     * @return {Promise<Array<T[]>>}
     * @memberof Database
     */
    static fetchAllData<T>(collectionName: string): Promise<T[]>;
    /**
     * Insert a document and return the new full document with _id.
     * Use case: Insert a new entry into the database.
     * @param {T} document
     * @param {string} collection
     * @param {boolean} returnDocument
     * @returns {Promise<T | null>} Document
     * @template T
     */
    static insertData<T>(document: T, collection: string, returnDocument?: boolean): Promise<T>;
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
    static updatePartialData(_id: any, data: Object, collection: string): Promise<boolean>;
    /**
     * Delete a document by _id and collection.
     * Use case: Delete the entry from the database collection.
     * @static
     * @param {*} _id
     * @param {string} collection
     * @return {Promise<boolean>}
     * @memberof Database
     */
    static deleteById(_id: any, collection: string): Promise<boolean>;
    /**
     * Specify a list of fields to select from the database in a collection.
     * Use case: Selects all data from a collection and only returns the specified keys.
     * @template T
     * @param {string} collection
     * @param {string[]} fieldNames
     * @return {Promise<T[]>}
     * @memberof Database
     */
    static selectData<T>(collection: string, keys: string[]): Promise<T[]>;
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
    static updateDataByFieldMatch(key: string, value: any, data: Object, collection: string): Promise<boolean>;
    /**
     * Drop a collection from the database.
     * @static
     * @param {string} collectionName
     * @return {Promise<void>}
     * @memberof Database
     */
    static dropCollection(collectionName: string): Promise<boolean>;
    /**
     * Remove an entire database from MongoDB. Including all collections.
     * @static
     * @return {Promise<boolean>}
     * @memberof Database
     */
    static dropDatabase(): Promise<boolean>;
    /**
     * Close the connection to the database.
     * @static
     * @return {Promise<void>}
     * @memberof Database
     */
    static close(): Promise<void>;
}
