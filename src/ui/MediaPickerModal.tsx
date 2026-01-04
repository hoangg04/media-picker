/**
 * MediaPickerModal Component
 * 
 * Main modal component for selecting media items.
 * Uses Radix UI Dialog primitive for accessibility.
 * 
 * Features:
 * - Single and multi-select modes
 * - Custom item rendering via renderItem prop
 * - Search and upload functionality
 * - Keyboard accessible
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { MediaItem as MediaItemType } from '../core/types';
import type { MediaAdapter } from '../adapters/media-adapter';
import { useMediaPicker } from '../hooks/useMediaPicker';
import { MediaGrid } from './MediaGrid';
import { MediaToolbar } from './MediaToolbar';

// Styles
const styles = {
    overlay: {
        position: 'fixed' as const,
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 50,
        animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
    },
    content: {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(100vw - 32px)',
        maxWidth: '1200px',
        height: 'calc(100vh - 64px)',
        maxHeight: '800px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        zIndex: 51,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
        animation: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
    },
    title: {
        fontSize: '20px',
        fontWeight: 600,
        color: '#111827',
        margin: 0,
    },
    closeButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        color: '#6b7280',
        transition: 'background-color 0.2s, color 0.2s',
    },
    closeButtonHover: {
        backgroundColor: '#f3f4f6',
        color: '#111827',
    },
    closeIcon: {
        width: '20px',
        height: '20px',
    },
    body: {
        flex: 1,
        overflow: 'auto',
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderTop: '1px solid #e5e7eb',
        gap: '16px',
        flexWrap: 'wrap' as const,
    },
    preview: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1,
        minWidth: 0,
    },
    previewImage: {
        width: '48px',
        height: '48px',
        borderRadius: '8px',
        objectFit: 'cover' as const,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#e5e7eb',
    },
    previewInfo: {
        display: 'flex',
        flexDirection: 'column' as const,
        minWidth: 0,
    },
    previewName: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#111827',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '200px',
    },
    previewMeta: {
        fontSize: '12px',
        color: '#6b7280',
    },
    previewEmpty: {
        fontSize: '14px',
        color: '#9ca3af',
    },
    actions: {
        display: 'flex',
        gap: '8px',
    },
    button: {
        height: '40px',
        padding: '0 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background-color 0.2s, border-color 0.2s',
    },
    cancelButton: {
        backgroundColor: 'white',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#d1d5db',
        color: '#374151',
    },
    cancelButtonHover: {
        backgroundColor: '#f9fafb',
        borderColor: '#9ca3af',
    },
    confirmButton: {
        backgroundColor: '#3b82f6',
        borderWidth: '0',
        borderStyle: 'none',
        color: 'white',
    },
    confirmButtonHover: {
        backgroundColor: '#2563eb',
    },
    confirmButtonDisabled: {
        backgroundColor: '#93c5fd',
        cursor: 'not-allowed',
    },
    selectedCount: {
        fontSize: '14px',
        color: '#6b7280',
        marginLeft: '8px',
    },
};

// Add keyframes
const keyframes = `
  @keyframes overlayShow {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes contentShow {
    from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
`;

// Close icon
const CloseIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={styles.closeIcon}
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export interface MediaPickerModalProps {
    /** Whether the modal is open */
    open: boolean;
    /** Callback when open state changes */
    onOpenChange: (open: boolean) => void;
    /** Adapter for data access (required) */
    adapter: MediaAdapter;
    /** Callback when user confirms selection */
    onSelect: (items: MediaItemType[]) => void;
    /** Allow selecting multiple items */
    multiple?: boolean;
    /** Custom item renderer */
    renderItem?: (item: MediaItemType, selected: boolean) => React.ReactNode;
    /** Initially selected items */
    initialSelected?: MediaItemType[];
    /** Modal title */
    title?: string;
    /** Confirm button label */
    confirmLabel?: string;
    /** Cancel button label */
    cancelLabel?: string;
    /** Search placeholder */
    searchPlaceholder?: string;
    /** Upload button label */
    uploadLabel?: string;
    /** Empty state message */
    emptyMessage?: string;
    /** Empty state description */
    emptyDescription?: string;
    /** Accepted file types for upload */
    acceptedFileTypes?: string;
    /** Class name for the content container */
    className?: string;
    /** Search debounce delay in ms */
    debounceDelay?: number;
}

export function MediaPickerModal({
    open,
    onOpenChange,
    adapter,
    onSelect,
    multiple = false,
    renderItem,
    initialSelected = [],
    title = 'Media Library',
    confirmLabel = 'Select',
    cancelLabel = 'Cancel',
    searchPlaceholder = 'Search media...',
    uploadLabel = 'Upload',
    emptyMessage = 'No media found',
    emptyDescription = 'Upload some files to get started',
    acceptedFileTypes = 'image/*,video/*',
    className,
    debounceDelay = 500,
}: MediaPickerModalProps) {
    const {
        items,
        uploadingItems,
        selectedItems,
        selectedIds,
        isLoading,
        searchQuery,
        setSearchQuery,
        toggleSelection,
        uploadFiles,
        refresh,
    } = useMediaPicker({
        adapter,
        multiple,
        initialSelected,
        debounceDelay,
    });

    // Compute derived state for toolbar
    const isUploading = uploadingItems.some((item) => item.status === 'uploading');
    const uploadProgress = React.useMemo(() => {
        if (uploadingItems.length === 0) return 0;
        const total = uploadingItems.reduce((acc, item) => acc + item.progress, 0);
        return Math.round(total / uploadingItems.length);
    }, [uploadingItems]);

    const [isCloseHovered, setIsCloseHovered] = React.useState(false);
    const [isCancelHovered, setIsCancelHovered] = React.useState(false);
    const [isConfirmHovered, setIsConfirmHovered] = React.useState(false);

    // Inject keyframes
    useEffect(() => {
        const styleId = 'media-picker-modal-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = keyframes;
            document.head.appendChild(style);
        }
    }, []);

    // Refresh when modal opens
    useEffect(() => {
        if (open) {
            refresh();
        }
    }, [open, refresh]);

    // Handle item click
    const handleItemClick = useCallback((item: MediaItemType) => {
        toggleSelection(item.id);
    }, [toggleSelection]);

    // Handle double click - select and confirm immediately
    const handleItemDoubleClick = useCallback((item: MediaItemType) => {
        onSelect([item]);
        onOpenChange(false);
    }, [onSelect, onOpenChange]);

    // Handle confirm
    const handleConfirm = useCallback(() => {
        if (selectedItems.length > 0) {
            onSelect(selectedItems);
            onOpenChange(false);
        }
    }, [selectedItems, onSelect, onOpenChange]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Get preview item (first selected for multi-select)
    const previewItem = selectedItems[0];

    const closeButtonStyle = {
        ...styles.closeButton,
        ...(isCloseHovered ? styles.closeButtonHover : {}),
    };

    const cancelButtonStyle = {
        ...styles.button,
        ...styles.cancelButton,
        ...(isCancelHovered ? styles.cancelButtonHover : {}),
    };

    const confirmButtonStyle = {
        ...styles.button,
        ...styles.confirmButton,
        ...(selectedItems.length === 0 ? styles.confirmButtonDisabled : {}),
        ...(isConfirmHovered && selectedItems.length > 0 ? styles.confirmButtonHover : {}),
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay style={styles.overlay} />
                <Dialog.Content style={styles.content} className={className}>
                    {/* Header */}
                    <div style={styles.header}>
                        <Dialog.Title style={styles.title}>
                            {title}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                style={closeButtonStyle}
                                onMouseEnter={() => setIsCloseHovered(true)}
                                onMouseLeave={() => setIsCloseHovered(false)}
                                aria-label="Close"
                            >
                                <CloseIcon />
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* Toolbar */}
                    <MediaToolbar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onUpload={uploadFiles}
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        searchPlaceholder={searchPlaceholder}
                        uploadLabel={uploadLabel}
                        acceptedFileTypes={acceptedFileTypes}
                        multiple={true}
                    />

                    {/* Body - Grid */}
                    <div style={styles.body}>
                        <MediaGrid
                            items={items}
                            uploadingItems={uploadingItems}
                            selectedIds={selectedIds}
                            isLoading={isLoading}
                            onItemClick={handleItemClick}
                            onItemDoubleClick={handleItemDoubleClick}
                            renderItem={renderItem}
                            emptyMessage={emptyMessage}
                            emptyDescription={emptyDescription}
                        />
                    </div>

                    {/* Footer */}
                    <div style={styles.footer}>
                        {/* Preview */}
                        <div style={styles.preview}>
                            {previewItem ? (
                                <>
                                    <img
                                        src={previewItem.url}
                                        alt={previewItem.name}
                                        style={styles.previewImage}
                                    />
                                    <div style={styles.previewInfo}>
                                        <span style={styles.previewName}>{previewItem.name}</span>
                                        <span style={styles.previewMeta}>
                                            {previewItem.width && previewItem.height && (
                                                <>{previewItem.width} × {previewItem.height} • </>
                                            )}
                                            {formatFileSize(previewItem.size)}
                                            {multiple && selectedItems.length > 1 && (
                                                <span style={styles.selectedCount}>
                                                    +{selectedItems.length - 1} more selected
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <span style={styles.previewEmpty}>
                                    {multiple ? 'Select one or more items' : 'Select an item'}
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={styles.actions}>
                            <button
                                type="button"
                                onClick={handleCancel}
                                style={cancelButtonStyle}
                                onMouseEnter={() => setIsCancelHovered(true)}
                                onMouseLeave={() => setIsCancelHovered(false)}
                            >
                                {cancelLabel}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={selectedItems.length === 0}
                                style={confirmButtonStyle}
                                onMouseEnter={() => setIsConfirmHovered(true)}
                                onMouseLeave={() => setIsConfirmHovered(false)}
                            >
                                {confirmLabel}
                                {multiple && selectedItems.length > 0 && ` (${selectedItems.length})`}
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
