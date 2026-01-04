/**
 * MediaItem Component
 * 
 * Renders a single media item in the grid.
 * Uses Radix UI primitives only - no shadcn/ui dependency.
 */

'use client';

import React, { forwardRef } from 'react';
import type { MediaItem as MediaItemType } from '../core/types';

// Styles as CSS-in-JS for portability
const styles = {
    container: {
        position: 'relative' as const,
        aspectRatio: '1',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'transparent',
        transition: 'all 0.2s ease',
        backgroundColor: '#f3f4f6',
    },
    containerSelected: {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)',
    },
    containerHover: {
        transform: 'scale(1.02)',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
    },
    videoOverlay: {
        position: 'absolute' as const,
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    playIcon: {
        width: '48px',
        height: '48px',
        color: 'white',
    },
    checkbox: {
        position: 'absolute' as const,
        top: '8px',
        left: '8px',
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        backgroundColor: 'white',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: '#d1d5db',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
    },
    checkboxSelected: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    checkmark: {
        width: '12px',
        height: '12px',
        color: 'white',
    },
    name: {
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        right: 0,
        padding: '8px',
        background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
        color: 'white',
        fontSize: '12px',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
};

export interface MediaItemProps {
    item: MediaItemType;
    selected: boolean;
    onClick: () => void;
    onDoubleClick?: () => void;
    showCheckbox?: boolean;
    className?: string;
}

// Checkmark SVG icon
const CheckIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        style={styles.checkmark}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

// Play icon for videos
const PlayIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        style={styles.playIcon}
    >
        <path d="M8 5v14l11-7z" />
    </svg>
);

export const MediaItemComponent = forwardRef<HTMLDivElement, MediaItemProps>(
    function MediaItem({ item, selected, onClick, onDoubleClick, showCheckbox = true, className }, ref) {
        const [isHovered, setIsHovered] = React.useState(false);

        const containerStyle = {
            ...styles.container,
            ...(selected ? styles.containerSelected : {}),
            ...(isHovered && !selected ? { borderColor: '#93c5fd' } : {}),
        };

        const checkboxStyle = {
            ...styles.checkbox,
            ...(selected ? styles.checkboxSelected : {}),
            opacity: selected || isHovered ? 1 : 0,
        };

        return (
            <div
                ref={ref}
                role="button"
                tabIndex={0}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onClick();
                    }
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={containerStyle}
                className={className}
                aria-selected={selected}
                aria-label={`${item.name}${selected ? ', selected' : ''}`}
            >
                {item.type === 'image' ? (
                    <img
                        src={item.url}
                        alt={item.name}
                        style={styles.image}
                        loading="lazy"
                    />
                ) : (
                    <>
                        <video
                            src={item.url}
                            style={styles.image}
                            muted
                            preload="metadata"
                        />
                        <div style={styles.videoOverlay}>
                            <PlayIcon />
                        </div>
                    </>
                )}

                {/* Selection checkbox */}
                {showCheckbox && (
                    <div style={checkboxStyle}>
                        {selected && <CheckIcon />}
                    </div>
                )}

                {/* File name overlay */}
                <div style={styles.name}>
                    {item.name}
                </div>
            </div>
        );
    }
);

export { MediaItemComponent as MediaItem };
