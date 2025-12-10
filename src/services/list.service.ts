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
export const addToMyList = async (userId: string, contentId: string, contentType: string): Promise<boolean> => {
    
    // 1. Check if the item already exists using $elemMatch on the contentId
    const exists = await MyListModel.exists({
        userId: userId,
        'contentIds.contentId': contentId // Check if contentId exists in the array
    });
    
    if (exists) {
        // Item is already in the list; return false (not added)
        return false;
    }

    // 2. If it does not exist, add it using the $push operator (or $addToSet, which now won't trigger the uniqueness check)
    // We use $push here because we've already manually checked for uniqueness, and $push is simpler.
    const updateResult = await MyListModel.updateOne(
        { userId: userId },
        { 
            $push: { // Use $push to add the item since we confirmed it's not a duplicate
                contentIds: { 
                    contentId, 
                    contentType, 
                    addedAt: new Date() // Date is added here
                } 
            }
        },
        { upsert: true }
    );
    
    // Log the result here if needed, but the return statement is clean
    // console.log("Update Result:", updateResult); 

    // Return true if the document was modified or newly created
    return updateResult.modifiedCount > 0 || updateResult.upsertedCount > 0;
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