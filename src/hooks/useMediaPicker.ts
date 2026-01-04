/**
 * useMediaPicker Hook
 * 
 * Main hook for consuming MediaPicker functionality.
 * Connects the adapter with the store and provides a clean API for UI components.
 * Includes blob preview support for uploads.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { createMediaPickerStore, type MediaPickerStoreApi } from '../core/store';
import type { MediaAdapter } from '../adapters/media-adapter';
import type { ListParams, MediaItem, UploadingItem } from '../core/types';
import { useDebounce } from './useDebounce';

export interface UseMediaPickerOptions {
    adapter: MediaAdapter;
    multiple?: boolean;
    initialSelected?: MediaItem[];
    debounceDelay?: number;
}

export interface UseMediaPickerReturn {
    // State
    items: MediaItem[];
    uploadingItems: UploadingItem[];
    selectedItems: MediaItem[];
    selectedIds: Set<string>;
    isLoading: boolean;
    searchQuery: string;
    hasMore: boolean;
    total: number;

    // Actions
    setSearchQuery: (query: string) => void;
    toggleSelection: (id: string) => void;
    selectItem: (id: string) => void;
    deselectItem: (id: string) => void;
    clearSelection: () => void;
    uploadFiles: (files: File[]) => void;
    deleteItem: (id: string) => Promise<boolean>;
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
}

export function useMediaPicker(options: UseMediaPickerOptions): UseMediaPickerReturn {
    const { adapter, multiple = false, initialSelected = [], debounceDelay = 500 } = options;

    // Stable ref for adapter to prevent unnecessary re-fetches if parent doesn't memoize it
    const adapterRef = useRef(adapter);
    useEffect(() => { adapterRef.current = adapter; }, [adapter]);

    // Create store instance
    const storeRef = useRef<MediaPickerStoreApi | null>(null);
    if (!storeRef.current) {
        storeRef.current = createMediaPickerStore(initialSelected.map(item => item.id));
    }
    const store = storeRef.current;

    // Selectors
    const items = useStore(store, s => s.items);
    const uploadingItems = useStore(store, s => s.uploadingItems);
    const selectedIds = useStore(store, s => s.selectedIds);
    const isLoading = useStore(store, s => s.isLoading);
    const searchQuery = useStore(store, s => s.searchQuery);
    const page = useStore(store, s => s.page);
    const hasMore = useStore(store, s => s.hasMore);
    const total = useStore(store, s => s.total);

    // Derived state
    const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

    const selectedItems = useMemo(() =>
        items.filter((item) => selectedIds.has(item.id)),
        [items, selectedIds]);

    // Abort controller ref for search requests
    const abortControllerRef = useRef<AbortController | null>(null);

    // Fetch items with cancellation support
    const fetchItems = useCallback(async (params: ListParams, append = false) => {
        // Cancel previous request if exists and we are starting a new search (not loading more)
        if (!append && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        if (!append) {
            abortControllerRef.current = controller;
        }

        store.getState().setLoading(true);

        try {
            const result = await adapterRef.current.list(params);

            // If aborted (though usually list() might not support signal passed down yet), 
            // we can check our local signal or just reliable execution flow.
            // Since adapter interface doesn't take valid AbortSignal, we rely on checking if this is still relevant.
            if (controller.signal.aborted) return;

            if (append) {
                store.getState().appendItems(result.items);
            } else {
                store.getState().setItems(result.items);
            }

            store.getState().setPagination(result.hasMore, result.total);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error('Failed to fetch media items:', error);
        } finally {
            // Only turn off loading if this is the active request
            if (!controller.signal.aborted) {
                store.getState().setLoading(false);
                if (!append) abortControllerRef.current = null;
            }
        }
    }, [store]);

    // Initial fetch & Search effect
    useEffect(() => {
        fetchItems({ search: debouncedSearchQuery, page: 1 });

        // Cleanup on unmount or query change
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [debouncedSearchQuery, fetchItems]);

    // Actions
    const setSearchQuery = useCallback((query: string) =>
        store.getState().setSearchQuery(query),
        [store]);

    const toggleSelection = useCallback((id: string) =>
        store.getState().toggleSelection(id, multiple),
        [store, multiple]);

    const selectItem = useCallback((id: string) =>
        store.getState().selectItem(id, multiple),
        [store, multiple]);

    const deselectItem = useCallback((id: string) =>
        store.getState().deselectItem(id),
        [store]);

    const clearSelection = useCallback(() =>
        store.getState().clearSelection(),
        [store]);

    // Single file upload logic
    const handleSingleFileUpload = useCallback(async (file: File) => {
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const blobUrl = URL.createObjectURL(file);

        const uploadingItem: UploadingItem = {
            tempId,
            blobUrl,
            name: file.name,
            progress: 0,
            status: 'uploading',
        };

        store.getState().addUploadingItem(uploadingItem);

        try {
            const mediaItem = await adapterRef.current.upload(file, (progress) => {
                store.getState().updateUploadingItem(tempId, { progress });
            });

            store.getState().updateUploadingItem(tempId, {
                status: 'success',
                progress: 100,
                mediaItem,
            });

            // Delay removal for better UX
            setTimeout(() => {
                store.getState().replaceUploadingWithMedia(tempId, mediaItem);
                URL.revokeObjectURL(blobUrl);

                // Auto-select
                const isMultiple = multiple; // capture current value
                if (isMultiple) {
                    store.getState().selectItem(mediaItem.id, true);
                } else {
                    store.getState().selectItem(mediaItem.id, false);
                }
            }, 500);

        } catch (error) {
            console.error('Failed to upload file:', error);
            store.getState().updateUploadingItem(tempId, {
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed',
            });

            // Cleanup after error
            setTimeout(() => {
                store.getState().removeUploadingItem(tempId);
                URL.revokeObjectURL(blobUrl);
            }, 3000);
        }
    }, [store, multiple]);

    const uploadFiles = useCallback((files: File[]) => {
        files.forEach(handleSingleFileUpload);
    }, [handleSingleFileUpload]);

    const deleteItem = useCallback(async (id: string): Promise<boolean> => {
        try {
            await adapterRef.current.delete(id);
            store.getState().removeItem(id);
            return true;
        } catch (error) {
            console.error('Failed to delete item:', error);
            return false;
        }
    }, [store]);

    const refresh = useCallback(async () => {
        await fetchItems({ search: debouncedSearchQuery, page: 1 });
    }, [fetchItems, debouncedSearchQuery]);

    const loadMore = useCallback(async () => {
        if (!hasMore || isLoading) return;
        const nextPage = page + 1;
        store.getState().setPage(nextPage);
        await fetchItems({ search: debouncedSearchQuery, page: nextPage }, true);
    }, [hasMore, isLoading, page, debouncedSearchQuery, fetchItems, store]);

    return {
        items,
        uploadingItems,
        selectedItems,
        selectedIds,
        isLoading,
        searchQuery,
        hasMore,
        total,
        setSearchQuery,
        toggleSelection,
        selectItem,
        deselectItem,
        clearSelection,
        uploadFiles,
        deleteItem,
        refresh,
        loadMore,
    };
}
