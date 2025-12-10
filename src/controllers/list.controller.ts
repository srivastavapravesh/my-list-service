import { Request, Response } from 'express';
import * as listService from '../services/list.service';

// Mock User ID
const MOCK_USER_ID = 'user-12345';

// Helper to extract content details
interface ContentPayload {
    contentId: string;
    contentType: 'Movie' | 'TVShow';
}

// 1. Add to My List
export const addToList = async (req: Request<{}, {}, ContentPayload>, res: Response) => {
    try {
        const { contentId, contentType } = req.body;

        if (!contentId || !contentType || (contentType !== 'Movie' && contentType !== 'TVShow')) {
            return res.status(400).send({ message: 'Invalid contentId or contentType.' });
        }
        
        const added = await listService.addToMyList(MOCK_USER_ID, contentId, contentType);

        if (!added) {
            return res.status(200).send({ message: 'Item was already in the list.', contentId });
        }

        res.status(201).send({ message: 'Item added to My List successfully.', contentId });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error.' });
    }
};

// 2. Remove from My List
export const removeFromList = async (req: Request<{ contentId: string }>, res: Response) => {
    try {
        const { contentId } = req.params;

        if (!contentId) {
            return res.status(400).send({ message: 'Missing contentId in path.' });
        }

        const removed = await listService.removeFromMyList(MOCK_USER_ID, contentId);

        if (!removed) {
            return res.status(404).send({ message: 'Item not found in My List.' });
        }

        res.status(200).send({ message: 'Item removed from My List successfully.', contentId });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error.' });
    }
};

// 3. List My Items
export const listItems = async (req: Request<{}, {}, {}, { page?: string }>, res: Response) => {
    try {
        const page = parseInt(req.query.page || '1', 10);
        
        const listData = await listService.listMyItems(MOCK_USER_ID, page);

        res.status(200).send(listData);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error.' });
    }
};