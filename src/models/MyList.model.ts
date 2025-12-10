import { Schema, model, Document } from 'mongoose';

// Define the ContentItem structure
interface ContentItem {
    contentId: string; // The ID of the Movie or TVShow
    contentType: 'Movie' | 'TVShow'; // Useful for later lookups/display
    addedAt: Date; // For sorting/tracking when it was added
}

// Extend the document to include our interface properties
export interface MyListDocument extends Document {
    userId: string;
    contentIds: ContentItem[];
}

const MyListSchema = new Schema<MyListDocument>(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true, 
        },
        contentIds: [
            {
                contentId: { type: String, required: true },
                contentType: { type: String, enum: ['Movie', 'TVShow'], required: true },
                addedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

export const MyListModel = model<MyListDocument>('MyList', MyListSchema);