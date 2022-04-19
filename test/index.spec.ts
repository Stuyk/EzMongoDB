import Database from '../src/index';

jest.setTimeout(60000);

const tempCollection = 'someCollection';

test('should connect with valid initialization function', async () => {
    const db = await Database.init('mongodb://127.0.0.1:27017', 'ezmongodb', [tempCollection]);
    expect(db).toBe(true);
});

test('should drop test collection if it exists', async () => {
    await Database.dropCollection(tempCollection);
});

test('should re-establish connection', async () => {
    await Database.close();

    const db = await Database.init('mongodb://127.0.0.1:27017', 'ezmongodb', [tempCollection]);
    expect(db).toBe(true);
});

test('should insert data into collection', async () => {
    const doc = await Database.insertData<{ _id?: any; name: string }>({ name: 'bob' }, tempCollection, true);
    expect(doc.name).toBe('bob');
});

test('should create search index for name', async () => {
    await Database.createSearchIndex('name', tempCollection);
});

test('should find name with bob', async () => {
    const docs = await Database.fetchAllByField<{ _id?: any; name: string }[]>('name', 'bob', tempCollection);
    expect(docs.length).toBeGreaterThanOrEqual(1);
});

test('should create multiple entries', async () => {
    for (let i = 0; i < 10; i++) {
        const newDoc = await Database.insertData<{ _id?: any; name: string }>(
            { name: `id-${i}-johnny` },
            tempCollection,
            true
        );

        expect(newDoc.name).toContain('johnny');
    }
});

test('should fuzzy search by id-', async () => {
    const docs = await Database.fetchWithSearch('id-', tempCollection);
    expect(docs.length).toBeGreaterThanOrEqual(1);
});

test('should update name', async () => {
    const docs = await Database.fetchAllByField<{ _id?: any; name: string }>('name', 'bob', tempCollection);
    await Database.updatePartialData(docs[0]._id, { name: 'jobi' }, tempCollection);

    const doc = await Database.fetchData<{ _id?: any; name: string }>('name', 'jobi', tempCollection);
    expect(doc.name).toBe('jobi');
});

test('should update name and also remove age', async () => {
    await Database.insertData({ name: 'bobi', age: 27 }, tempCollection);

    const docs = await Database.fetchAllByField<{ _id?: any; name: string }>('name', 'bobi', tempCollection);
    await Database.updatePartialData(docs[0]._id, { name: 'iboj' }, tempCollection, { age: '' });

    const doc = await Database.fetchData<{ _id?: any; name: string; age?: number }>('name', 'iboj', tempCollection);
    expect(doc.name).toBe('iboj');
    expect(doc.age).toBeUndefined();
});

test('should remove age', async () => {
    await Database.insertData({ name: 'bobi2', age: 27 }, tempCollection);

    const docs = await Database.fetchAllByField<{ _id?: any; name: string }>('name', 'bobi2', tempCollection);
    await Database.removePartialData(docs[0]._id, { age: '' }, tempCollection);

    const doc = await Database.fetchData<{ _id?: any; name: string; age?: number }>('name', 'bobi2', tempCollection);
    expect(doc.age).toBeUndefined();
});

test('should fetch entire collection as array', async () => {
    const docs = await Database.fetchAllData(tempCollection);
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThanOrEqual(1);
});

test('should add new elements to document', async () => {
    let doc = await Database.fetchData<{ _id?: any; name?: string; age?: number }>('name', 'jobi', tempCollection);

    await Database.updatePartialData(doc._id, { age: 1 }, tempCollection);

    doc = await Database.fetchData<{ _id?: any; name?: string; age?: number }>('_id', doc._id, tempCollection);

    expect(doc !== null).toBe(true);
    expect(doc.age).toBeGreaterThanOrEqual(1);
});

test('should delete data', async () => {
    const doc = await Database.fetchData<{ _id?: any; name: string }>('name', 'jobi', tempCollection);
    const didDelete = await Database.deleteById(doc._id, tempCollection);
    expect(didDelete).toBe(true);
});

test('should delete collection', async () => {
    const result = await Database.dropCollection(tempCollection);
    expect(result).toBe(true);
});

test('should delete database', async () => {
    const result = await Database.dropDatabase();
    expect(result).toBe(true);
});

afterAll((done) => {
    Database.close().then(() => {
        done();
    });
});
