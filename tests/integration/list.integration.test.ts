import supertest from 'supertest';
import app from '../../src/app'; // Import the Express app
import mongoose from 'mongoose';
import { MyListModel } from '../../src/models/MyList.model';

const request = supertest(app);
const MOCK_USER_ID = 'user-12345'; // Matches the controller mock ID

// Test data
const movieContent = { contentId: 'm-101', contentType: 'Movie' };
const tvShowContent = { contentId: 't-202', contentType: 'TVShow' };

// Setup/Teardown: Connect/Disconnect Mongoose and clear the collection
beforeAll(async () => {
    // Use a test-specific database URI if possible, otherwise mock it.
    // Assuming connection from app.ts is used or running an in-memory DB (ideal for tests).
    // For simplicity here, we'll connect/disconnect manually for a cleaner test state.
    const MONGO_URI_TEST = 'mongodb://localhost:27017/mylistdb_test';
    await mongoose.connect(MONGO_URI_TEST);
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    // Clear the database before each test
    await MyListModel.deleteMany({});
});

describe('My List API Integration Tests', () => {

    it('1. should successfully add a new item to My List', async () => {
        const res = await request
            .post('/api/v1/list')
            .send(movieContent)
            .expect(201);

        expect(res.body.message).toBe('Item added to My List successfully.');

        // Verification
        const list = await MyListModel.findOne({ userId: MOCK_USER_ID });
        expect(list).not.toBeNull();
        expect(list?.contentIds).toHaveLength(1);
    });

    it('2. should return 200 and success message if attempting to add a duplicate item (No change)', async () => {
        // First add
        await request.post('/api/v1/list').send(movieContent).expect(201);
        // Second add (duplicate)
        const res = await request
            .post('/api/v1/list')
            .send(movieContent)
            .expect(200);

        expect(res.body.message).toBe('Item was already in the list.');

        // Verification: Only one item in the database
        const list = await MyListModel.findOne({ userId: MOCK_USER_ID });
        expect(list?.contentIds).toHaveLength(1);
    });
    
    // --- REMOVE FROM MY LIST (DELETE) ---

    it('3. should successfully remove an item from My List', async () => {
        // Setup: Add the item first
        await request.post('/api/v1/list').send(tvShowContent).expect(201);
        
        // Action: Remove the item
        const res = await request
            .delete(`/api/v1/list/${tvShowContent.contentId}`)
            .expect(200);

        expect(res.body.message).toBe('Item removed from My List successfully.');

        // Verification: List should be empty
        const list = await MyListModel.findOne({ userId: MOCK_USER_ID });
        expect(list?.contentIds).toHaveLength(0);
    });

    it('4. should return 404 when trying to remove an item that is not in the list', async () => {
        // Attempt to remove an item from an empty list
        const res = await request
            .delete(`/api/v1/list/non-existent-id`)
            .expect(404);

        expect(res.body.message).toBe('Item not found in My List.');
    });

    // --- LIST MY ITEMS (GET) ---

    it('5. should successfully list items with pagination (Page 1)', async () => {
        const TOTAL_DELAY_MS = 25 * 1000;
        // Setup: Add 25 items for pagination
        for (let i = 0; i < 25; i++) {
            const delay = i * 1000; // 0 for item-1, 24000 for item-25
            // Item-1 (i=0): Date.now() - (25000 - 0) = OLDEST
            // Item-25 (i=24): Date.now() - (25000 - 24000) = NEWEST (1 second ago)
            const timestamp = Date.now() - (TOTAL_DELAY_MS - delay);
            await MyListModel.updateOne(
                { userId: MOCK_USER_ID },
                { $addToSet: { contentIds: { contentId: `item-${i + 1}`, contentType: 'Movie', addedAt: new Date(timestamp) } } }, 
                { upsert: true }
            );
        }

        // Action: Get Page 1
        const res1 = await request.get('/api/v1/list?page=1').expect(200);
        // Verification
        expect(res1.body.items).toHaveLength(20);
        expect(res1.body.totalItems).toBe(25);
        expect(res1.body.totalPages).toBe(2);
        expect(res1.body.currentPage).toBe(1);
        // Ensure most recently added is first (item-25)
        expect(res1.body.items[0].contentId).toBe('item-25'); 
    });
    
    it('6. should return the correct remaining items on Page 2', async () => {
        // Setup: Add 25 items
        const TOTAL_DELAY_MS = 25 * 1000;
         for (let i = 0; i < 25; i++) {
            const delay = i * 1000; // 0 for item-1, 24000 for item-25
            // Item-1 (i=0): Date.now() - (25000 - 0) = OLDEST
            // Item-25 (i=24): Date.now() - (25000 - 24000) = NEWEST (1 second ago)
            const timestamp = Date.now() - (TOTAL_DELAY_MS - delay);
            await MyListModel.updateOne(
                { userId: MOCK_USER_ID },
                { $addToSet: { contentIds: { contentId: `item-${i + 1}`, contentType: 'Movie', addedAt: new Date(timestamp) } } },
                { upsert: true }
            );
        }

        // Action: Get Page 2
        const res2 = await request.get('/api/v1/list?page=2').expect(200);
        
        // Verification
        expect(res2.body.items).toHaveLength(5); // 5 remaining items
        expect(res2.body.currentPage).toBe(2);
        // Ensure item-5 is the first on the second page (since item-25 down to item-6 are on page 1)
        expect(res2.body.items[0].contentId).toBe('item-5'); 
    });
    
    it('7. should return an empty list for a non-existent user or empty list', async () => {
        // Assuming MOCK_USER_ID is not present yet (due to beforeEach)
        const res = await request.get('/api/v1/list').expect(200);

        expect(res.body.items).toHaveLength(0);
        expect(res.body.totalItems).toBe(0);
    });


    // --- ERROR AND VALIDATION CASES (Missing Test Cases) ---

    it('8. should return 400 for missing contentId on add', async () => {
        const res = await request
            .post('/api/v1/list')
            .send({ contentType: 'Movie' }) // Missing contentId
            .expect(400);

        expect(res.body.message).toBe('Invalid contentId or contentType.');
    });

    it('9. should return 400 for invalid contentType on add', async () => {
        const res = await request
            .post('/api/v1/list')
            .send({ contentId: 'm-303', contentType: 'Game' }) // Invalid type
            .expect(400);

        expect(res.body.message).toBe('Invalid contentId or contentType.');
    });
});