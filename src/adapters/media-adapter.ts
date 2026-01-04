/**
 * MediaAdapter Interface
 * 
 * This is the core abstraction for data access in the MediaPicker module.
 * UI components NEVER call fetch/axios directly - they use this interface.
 * 
 * To use MediaPicker in your project:
 * 1. Create a class that implements this interface
 * 2. Connect it to your API/backend
 * 3. Pass it to MediaPickerModal via the `adapter` prop
 */

import type { ListParams, ListResult, MediaItem } from '../core/types';

export interface MediaAdapter {
    /**
     * Fetch a paginated list of media items
     * @param params - Search, folder, and pagination parameters
     * @returns Promise resolving to items with pagination info
     */
    list(params: ListParams): Promise<ListResult>;

    /**
     * Upload a single file to the media library
     * @param file - The file to upload
     * @param onProgress - Optional progress callback (0-100)
     * @returns Promise resolving to the created MediaItem
     */
    upload(file: File, onProgress?: (progress: number) => void): Promise<MediaItem>;

    /**
     * Delete a media item by ID
     * @param id - The ID of the item to delete
     * @returns Promise resolving when deletion is complete
     */
    delete(id: string): Promise<void>;
}
