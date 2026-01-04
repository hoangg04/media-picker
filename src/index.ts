/**
 * MediaPicker Module - Public API
 * 
 * This is the main entry point for the MediaPicker package.
 * All public types, components, and utilities are exported from here.
 * 
 * Usage:
 * ```typescript
 * import { 
 *   MediaPickerModal, 
 *   MediaAdapter, 
 *   MediaItem,
 *   useMediaPicker 
 * } from '@/packages/media-picker/src';
 * ```
 */

// Core types
export type {
    MediaItem,
    UploadingItem,
    MediaFolder,
    ListParams,
    ListResult,
    UploadProgressCallback,
} from './core/types';

// Adapter interface
export type { MediaAdapter } from './adapters/media-adapter';

// Example adapter (for reference)
export { HttpMediaAdapter } from './adapters/http-adapter.example';

// Store types (for advanced usage)
export type {
    MediaPickerState,
    MediaPickerActions,
    MediaPickerStore,
    MediaPickerStoreApi,
} from './core/store';
export { createMediaPickerStore } from './core/store';

// Hook
export { useMediaPicker } from './hooks/useMediaPicker';
export type { UseMediaPickerOptions, UseMediaPickerReturn } from './hooks/useMediaPicker';

// UI Components
export { MediaPickerModal } from './ui/MediaPickerModal';
export type { MediaPickerModalProps } from './ui/MediaPickerModal';

export { MediaGrid } from './ui/MediaGrid';
export type { MediaGridProps } from './ui/MediaGrid';

export { MediaItem as MediaItemComponent } from './ui/MediaItem';
export type { MediaItemProps } from './ui/MediaItem';

export { MediaToolbar } from './ui/MediaToolbar';
export type { MediaToolbarProps } from './ui/MediaToolbar';

export { UploadingCard } from './ui/UploadingCard';
export type { UploadingCardProps } from './ui/UploadingCard';
