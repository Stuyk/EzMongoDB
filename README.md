EzMongo is the simple way to use MongoDB without knowing how to use MongoDB.

Store your client data in collections and fetch and perfrom creation, reading, updating, and deleting functions in a very simple way.

It is a **single database wrapper** for MongoDB.

# Installation

## Prerequisites

-   NodeJS 16+
-   [A MongoDB Server](https://www.mongodb.com/try/download/community)

## Install

```
$ npm install @stuyk/ezmongodb
```

# Starting Usage

Here are some generalized steps for getting started.

1. Use the `Database.init` function.
2. Wait for the connection to establish.
3. Perform any operation for reading, writing, updating, etc.

Additional information can be found below. 👇🏻

## 🔽 Importing

Import the Database static class.

```js
import Database from '@stuyk/ezmongodb';
```

## 🔗 Establish Connection

Establish a connection through the `Database` static class.

```js
import Database from '@stuyk/ezmongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'test';
const collections = ['accounts', 'characters', 'vehicles'];

async function connect() {
    const connected = await Database.init(url, dbName, collections);
    if (!connected) {
        throw new Error(`Did not connect to the database.`);
    }
}
```

## 📝 Regular Usage


These are just some general examples of creating, reading, updating, and deleting.


```ts
import Database from '@stuyk/ezmongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'test';
const collections = ['accounts', 'characters', 'vehicles'];

interface IAccount {
    _id?: any;
    username?: string;
    age?: number;
    newData?: string;
}

async function connect() {
    // Establish a connection to your database.
    const connected = await Database.init(url, dbName, collections);
    if (!connected) {
        throw new Error(`Did not connect to the database.`);
    }

    const newDocument = {
        identifier: 'id-1-aaa-bbb-ccc', // Not required, just an example
        username: 'somePerson',
        someNumber: 1 // Not required, just an example
    }

    // Create a search index for 'string' fields
    await Database.createSearchIndex('identifier', 'accounts');
    await Database.createSearchIndex('username', 'accounts');

    // Create new data in a collection (table).
    // This is now a document with `_id` attached to it.
    const somePerson = await Database.insertData<IAccount>(newDocument, 'accounts', true);
    if (!somePerson) {
        throw new Error('Could not insert data');
    }

    // Fetch all entries that have an 'id-' in their properties
    const somePeople = await Database.fetchWithSearch('id-', 'accounts'); // Fetches anything with 'id-' in a field
    const someMorePeople = await Database.fetchWithSearch('1-aaa', 'accounts'); // Fetches anything with '1-aaa' in a field


    // Update all data for document based on 
    // ID in a collection.
    somePerson.age = 5;
    const didUpdate = await Database.updatePartialData(somePerson._id, { ...somePerson }, 'accounts');

    if (!didUpdate) {
        throw new Error(`Document for ${somePerson._id.toString()} did not update.`);
    }

    // Use the same function as above to
    // add a single field to an existing document.
    await Database.updatePartialData(somePerson._id, { newData: 'testing' }, 'accounts');

    // Fetch the new data from the database after updating it.
    // Not necessary if you keep a cache. 
    // Just use the cache as reference.
    const doc = await Database.fetchData<IAccount>('username', 'somePerson', 'accounts');
    if (!doc) {
        throw new Error(`Did not find a document with that data`);
    }


    // Delete a document entirely from a collection (table).
    const didDelete = await Database.deleteById(somePerson._id, 'accounts');
    if (!didDelete) {
        throw new Error(`Document did not exist.`);
    }

    // You can find some more examples in 'test/index.spec.ts'
}

connect();
```

## Additional Functionality

If you need any additional syntax or custom queries, you can use the `db` directly by fetching its instance.

This lets you call all related MongoDB functionality.

```ts
const db = await Database.getDatabaseInstance();
```