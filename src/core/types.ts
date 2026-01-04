/**
 * Core domain types for MediaPicker module
 * These types are framework-agnostic and can be used across projects
 */

/**
 * Represents a single media item in the library
 */
export interface MediaItem {
    id: string;
    url: string;
    name: string;
    type: 'image' | 'video';
    size: number;
    width?: number;
    height?: number;
    createdAt: Date;
}

/**
 * Represents a media item that is currently being uploaded
 * Shows blob preview while uploading
 */
export interface UploadingItem {
    /** Temporary ID for tracking */
    tempId: string;
    /** Blob URL for preview */
    blobUrl: string;
    /** Original file name */
    name: string;
    /** Upload progress 0-100 */
    progress: number;
    /** Upload status */
    status: 'uploading' | 'success' | 'error';
    /** Error message if failed */
    error?: string;
    /** The actual MediaItem after upload success */
    mediaItem?: MediaItem;
}

/**
 * Represents a folder for organizing media items
 */
export interface MediaFolder {
    id: string;
    name: string;
    parentId?: string;
}

/**
 * Parameters for listing media items
 */
export interface ListParams {
    search?: string;
    folderId?: string;
    page?: number;
    limit?: number;
}

/**
 * Result of listing media items with pagination info
 */
export interface ListResult {
    items: MediaItem[];
    total: number;
    hasMore: boolean;
}

/**
 * Upload progress callback type
 */
export type UploadProgressCallback = (progress: number) => void;
