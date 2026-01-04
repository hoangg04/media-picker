/**
 * MediaPicker Store
 * 
 * Isolated Zustand store for MediaPicker state management.
 * Uses createStore (not create) to ensure each modal instance has its own state.
 * This prevents conflicts when multiple MediaPickers are used in the same app.
 */

import { createStore } from 'zustand';
import type { MediaItem, UploadingItem } from './types';

export interface MediaPickerState {
    // Data
    items: MediaItem[];
    uploadingItems: UploadingItem[];
    selectedIds: Set<string>;

    // UI State
    isLoading: boolean;
    searchQuery: string;

    // Pagination
    page: number;
    hasMore: boolean;
    total: number;
}

export interface MediaPickerActions {
    // Data actions
    setItems: (items: MediaItem[]) => void;
    appendItems: (items: MediaItem[]) => void;
    addItem: (item: MediaItem) => void;
    removeItem: (id: string) => void;

    // Uploading items actions
    addUploadingItem: (item: UploadingItem) => void;
    updateUploadingItem: (tempId: string, updates: Partial<UploadingItem>) => void;
    removeUploadingItem: (tempId: string) => void;
    replaceUploadingWithMedia: (tempId: string, mediaItem: MediaItem) => void;

    // Selection actions
    toggleSelection: (id: string, multiple: boolean) => void;
    selectItem: (id: string, multiple: boolean) => void;
    deselectItem: (id: string) => void;
    clearSelection: () => void;
    setSelectedIds: (ids: string[]) => void;

    // UI actions
    setLoading: (loading: boolean) => void;
    setSearchQuery: (query: string) => void;

    // Pagination actions
    setPage: (page: number) => void;
    setPagination: (hasMore: boolean, total: number) => void;

    // Reset
    reset: () => void;
}

export type MediaPickerStore = MediaPickerState & MediaPickerActions;

const initialState: MediaPickerState = {
    items: [],
    uploadingItems: [],
    selectedIds: new Set(),
    isLoading: false,
    searchQuery: '',
    page: 1,
    hasMore: false,
    total: 0,
};

/**
 * Creates an isolated store instance for a MediaPicker modal
 * Each modal gets its own store to prevent state conflicts
 */
export const createMediaPickerStore = (initialSelected: string[] = []) => {
    return createStore<MediaPickerStore>((set) => ({
        ...initialState,
        selectedIds: new Set(initialSelected),

        // Data actions
        setItems: (items) => set({ items }),

        appendItems: (items) => set((state) => ({
            items: [...state.items, ...items],
        })),

        addItem: (item) => set((state) => ({
            items: [item, ...state.items],
        })),

        removeItem: (id) => set((state) => ({
            items: state.items.filter((item) => item.id !== id),
            selectedIds: new Set([...state.selectedIds].filter((selectedId) => selectedId !== id)),
        })),

        // Uploading items actions
        addUploadingItem: (item) => set((state) => ({
            uploadingItems: [item, ...state.uploadingItems],
        })),

        updateUploadingItem: (tempId, updates) => set((state) => ({
            uploadingItems: state.uploadingItems.map((item) =>
                item.tempId === tempId ? { ...item, ...updates } : item
            ),
        })),

        removeUploadingItem: (tempId) => set((state) => ({
            uploadingItems: state.uploadingItems.filter((item) => item.tempId !== tempId),
        })),

        replaceUploadingWithMedia: (tempId, mediaItem) => set((state) => {
            // Remove uploading item
            const uploadingItems = state.uploadingItems.filter((item) => item.tempId !== tempId);
            // Add media item to beginning
            const items = [mediaItem, ...state.items];
            return { uploadingItems, items };
        }),

        // Selection actions
        toggleSelection: (id, multiple) => set((state) => {
            const newSelectedIds = new Set(state.selectedIds);

            if (newSelectedIds.has(id)) {
                newSelectedIds.delete(id);
            } else {
                if (!multiple) {
                    newSelectedIds.clear();
                }
                newSelectedIds.add(id);
            }

            return { selectedIds: newSelectedIds };
        }),

        selectItem: (id, multiple) => set((state) => {
            if (!multiple) {
                return { selectedIds: new Set([id]) };
            }
            const newSelectedIds = new Set(state.selectedIds);
            newSelectedIds.add(id);
            return { selectedIds: newSelectedIds };
        }),

        deselectItem: (id) => set((state) => {
            const newSelectedIds = new Set(state.selectedIds);
            newSelectedIds.delete(id);
            return { selectedIds: newSelectedIds };
        }),

        clearSelection: () => set({ selectedIds: new Set() }),

        setSelectedIds: (ids) => set({ selectedIds: new Set(ids) }),

        // UI actions
        setLoading: (isLoading) => set({ isLoading }),

        setSearchQuery: (searchQuery) => set({ searchQuery, page: 1 }),

        // Pagination actions
        setPage: (page) => set({ page }),

        setPagination: (hasMore, total) => set({ hasMore, total }),

        // Reset
        reset: () => set(initialState),
    }));
};

export type MediaPickerStoreApi = ReturnType<typeof createMediaPickerStore>;
