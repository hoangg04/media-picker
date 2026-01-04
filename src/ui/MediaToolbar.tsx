/**
 * MediaToolbar Component
 * 
 * Toolbar with search input and upload button.
 * Uses Radix UI primitives for accessibility.
 */

'use client';

import React, { useRef } from 'react';

const styles = {
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        flexWrap: 'wrap' as const,
    },
    searchContainer: {
        position: 'relative' as const,
        flex: '1 1 300px',
        minWidth: '200px',
    },
    searchIcon: {
        position: 'absolute' as const,
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '16px',
        height: '16px',
        color: '#9ca3af',
        pointerEvents: 'none' as const,
    },
    searchInput: {
        width: '100%',
        height: '40px',
        paddingLeft: '40px',
        paddingRight: '12px',
        borderRadius: '8px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#d1d5db',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    searchInputFocus: {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
    },
    uploadButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        height: '40px',
        padding: '0 16px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#3b82f6',
        color: 'white',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    uploadButtonHover: {
        backgroundColor: '#2563eb',
    },
    uploadButtonDisabled: {
        backgroundColor: '#93c5fd',
        cursor: 'not-allowed',
    },
    uploadIcon: {
        width: '16px',
        height: '16px',
    },
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#6b7280',
    },
    progressBar: {
        width: '100px',
        height: '4px',
        backgroundColor: '#e5e7eb',
        borderRadius: '2px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3b82f6',
        transition: 'width 0.2s',
    },
    hiddenInput: {
        display: 'none',
    },
};

// Search icon
const SearchIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={styles.searchIcon}
    >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

// Upload icon
const UploadIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={styles.uploadIcon}
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

export interface MediaToolbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onUpload: (files: File[]) => void;
    isUploading: boolean;
    uploadProgress: number;
    searchPlaceholder?: string;
    uploadLabel?: string;
    acceptedFileTypes?: string;
    multiple?: boolean;
    className?: string;
}

export function MediaToolbar({
    searchQuery,
    onSearchChange,
    onUpload,
    isUploading,
    uploadProgress,
    searchPlaceholder = 'Search media...',
    uploadLabel = 'Upload',
    acceptedFileTypes = 'image/*,video/*',
    multiple = true,
    className,
}: MediaToolbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSearchFocused, setIsSearchFocused] = React.useState(false);
    const [isUploadHovered, setIsUploadHovered] = React.useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onUpload(Array.from(files));
        }
        // Reset input to allow selecting same file again
        e.target.value = '';
    };

    const searchInputStyle = {
        ...styles.searchInput,
        ...(isSearchFocused ? styles.searchInputFocus : {}),
    };

    const uploadButtonStyle = {
        ...styles.uploadButton,
        ...(isUploading ? styles.uploadButtonDisabled : {}),
        ...(isUploadHovered && !isUploading ? styles.uploadButtonHover : {}),
    };

    return (
        <div style={styles.toolbar} className={className}>
            {/* Search input */}
            <div style={styles.searchContainer}>
                <SearchIcon />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder={searchPlaceholder}
                    style={searchInputStyle}
                    aria-label="Search media"
                />
            </div>

            {/* Upload button or progress */}
            {isUploading ? (
                <div style={styles.progressContainer}>
                    <span>Uploading...</span>
                    <div style={styles.progressBar}>
                        <div
                            style={{ ...styles.progressFill, width: `${uploadProgress}%` }}
                        />
                    </div>
                    <span>{uploadProgress}%</span>
                </div>
            ) : (
                <>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        onMouseEnter={() => setIsUploadHovered(true)}
                        onMouseLeave={() => setIsUploadHovered(false)}
                        style={uploadButtonStyle}
                        aria-label={uploadLabel}
                    >
                        <UploadIcon />
                        <span>{uploadLabel}</span>
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptedFileTypes}
                        multiple={multiple}
                        onChange={handleFileSelect}
                        style={styles.hiddenInput}
                        aria-hidden="true"
                    />
                </>
            )}
        </div>
    );
}
