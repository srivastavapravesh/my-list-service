import { MyListModel, MyListDocument } from '../models/MyList.model';

const ITEMS_PER_PAGE = 20;

/**
 * Ensures a MyList document exists for the user. Creates one if it doesn't.
 * @param userId - The ID of the user.
 */
const getOrCreateList = async (userId: string): Promise<MyListDocument> => {
    let list = await MyListModel.findOne({ userId });
    if (!list) {
        list = await MyListModel.create({ userId, contentIds: [] });
    }
    return list;
};

/**
 * Core function for Add to My List. Uses $addToSet for atomic, non-duplicate addition.
 */
export const addToMyList = async (userId: string, contentId: string, contentType: 'Movie' | 'TVShow') => {
    // Upsert: Find the document by userId and update it. If not found, create it.
    const result = await MyListModel.updateOne(
        { userId },
        {
            $addToSet: { // $addToSet is key: only adds if contentId is not already present
                contentIds: {
                    contentId,
                    contentType,
                    addedAt: new Date(),
                },
            },
        },
        { upsert: true } // Creates the document if it doesn't exist
    );

    // Check if a modification occurred (item was added)
    return result.modifiedCount > 0 || result.upsertedCount > 0;
};

/**
 * Core function for Remove from My List. Uses $pull to remove by content ID.
 */
export const removeFromMyList = async (userId: string, contentId: string) => {
    const result = await MyListModel.updateOne(
        { userId },
        {
            $pull: { // $pull is key: removes all elements matching the condition
                contentIds: { contentId },
            },
        }
    );
    return result.modifiedCount > 0;
};

/**
 * Core function for List My Items with Pagination.
 */
export const listMyItems = async (userId: string, page: number = 1) => {
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // 1. Fetch the user's list and total count in one go.
    const listDocument = await MyListModel.findOne({ userId }, { contentIds: 1 }).lean(); // .lean() for performance

    if (!listDocument) {
        return { items: [], totalItems: 0, totalPages: 0, currentPage: page };
    }

    const allContentIds = listDocument.contentIds;
    const totalItems = allContentIds.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // 2. Paginate
    // Sort by addedAt (most recently added first)
    const sortedContent = allContentIds.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());

    const paginatedItems = sortedContent.slice(skip, skip + ITEMS_PER_PAGE);

    return {
        items: paginatedItems,
        totalItems,
        totalPages,
        currentPage: page,
    };
};