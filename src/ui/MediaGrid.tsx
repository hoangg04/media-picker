/**
 * MediaGrid Component
 * 
 * Responsive grid layout for media items.
 * Similar to WordPress Media Library grid.
 * Includes uploading items with blob preview.
 */

'use client';

import React from 'react';
import type { MediaItem as MediaItemType, UploadingItem } from '../core/types';
import { MediaItem } from './MediaItem';
import { UploadingCard } from './UploadingCard';

const styles = {
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '16px',
        padding: '16px',
    },
    gridSmall: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px',
    },
    loadingContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '16px',
        padding: '16px',
    },
    skeleton: {
        aspectRatio: '1',
        borderRadius: '8px',
        backgroundColor: '#e5e7eb',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 16px',
        color: '#6b7280',
        textAlign: 'center' as const,
    },
    emptyIcon: {
        width: '64px',
        height: '64px',
        marginBottom: '16px',
        color: '#9ca3af',
    },
    emptyTitle: {
        fontSize: '18px',
        fontWeight: 500,
        marginBottom: '8px',
        color: '#374151',
    },
    emptyText: {
        fontSize: '14px',
        color: '#6b7280',
    },
};

// CSS keyframes for skeleton animation
const skeletonKeyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// Empty state icon
const ImageOffIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={styles.emptyIcon}
    >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
        <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
);

export interface MediaGridProps {
    items: MediaItemType[];
    uploadingItems?: UploadingItem[];
    selectedIds: Set<string>;
    isLoading: boolean;
    onItemClick: (item: MediaItemType) => void;
    onItemDoubleClick?: (item: MediaItemType) => void;
    renderItem?: (item: MediaItemType, selected: boolean) => React.ReactNode;
    emptyMessage?: string;
    emptyDescription?: string;
    className?: string;
}

export function MediaGrid({
    items,
    uploadingItems = [],
    selectedIds,
    isLoading,
    onItemClick,
    onItemDoubleClick,
    renderItem,
    emptyMessage = 'No media found',
    emptyDescription = 'Upload some files to get started',
    className,
}: MediaGridProps) {
    // Inject keyframes
    React.useEffect(() => {
        const styleId = 'media-picker-skeleton-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = skeletonKeyframes;
            document.head.appendChild(style);
        }
    }, []);

    // Loading state
    if (isLoading && items.length === 0 && uploadingItems.length === 0) {
        return (
            <div style={styles.loadingContainer} className={className}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={styles.skeleton} />
                ))}
            </div>
        );
    }

    // Empty state
    if (items.length === 0 && uploadingItems.length === 0) {
        return (
            <div style={styles.emptyState} className={className}>
                <ImageOffIcon />
                <p style={styles.emptyTitle}>{emptyMessage}</p>
                <p style={styles.emptyText}>{emptyDescription}</p>
            </div>
        );
    }

    return (
        <div style={styles.grid} className={className}>
            {/* Render uploading items first */}
            {uploadingItems.map((uploadingItem) => (
                <UploadingCard
                    key={uploadingItem.tempId}
                    item={uploadingItem}
                />
            ))}

            {/* Render actual media items */}
            {items.map((item) => {
                const isSelected = selectedIds.has(item.id);

                // Use custom renderer if provided
                if (renderItem) {
                    return (
                        <div
                            key={item.id}
                            onClick={() => onItemClick(item)}
                            onDoubleClick={() => onItemDoubleClick?.(item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onItemClick(item);
                                }
                            }}
                        >
                            {renderItem(item, isSelected)}
                        </div>
                    );
                }

                // Default renderer
                return (
                    <MediaItem
                        key={item.id}
                        item={item}
                        selected={isSelected}
                        onClick={() => onItemClick(item)}
                        onDoubleClick={() => onItemDoubleClick?.(item)}
                    />
                );
            })}
        </div>
    );
}
