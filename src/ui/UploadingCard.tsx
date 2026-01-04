/**
 * UploadingCard Component
 * 
 * Shows a preview card for files being uploaded with progress indicator.
 */

'use client';

import React from 'react';
import type { UploadingItem } from '../core/types';

const styles = {
    container: {
        position: 'relative' as const,
        aspectRatio: '1',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        border: '2px solid #e5e7eb',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
    },
    overlay: {
        position: 'absolute' as const,
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
    },
    spinner: {
        width: '32px',
        height: '32px',
        border: '3px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    progressContainer: {
        width: '100%',
        marginTop: '12px',
    },
    progressBar: {
        width: '100%',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '2px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'white',
        transition: 'width 0.3s ease',
    },
    progressText: {
        marginTop: '4px',
        fontSize: '12px',
        color: 'white',
        textAlign: 'center' as const,
    },
    statusIcon: {
        width: '32px',
        height: '32px',
        marginBottom: '8px',
    },
    errorText: {
        fontSize: '12px',
        color: '#fca5a5',
        textAlign: 'center' as const,
        marginTop: '8px',
    },
};

const keyframes = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Success checkmark icon
const CheckIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="3"
        style={styles.statusIcon}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

// Error X icon
const ErrorIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fca5a5"
        strokeWidth="3"
        style={styles.statusIcon}
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export interface UploadingCardProps {
    item: UploadingItem;
    className?: string;
}

export function UploadingCard({ item, className }: UploadingCardProps) {
    // Inject keyframes
    React.useEffect(() => {
        const styleId = 'uploading-card-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = keyframes;
            document.head.appendChild(style);
        }
    }, []);

    return (
        <div style={styles.container} className={className}>
            {/* Blob preview image */}
            <img
                src={item.blobUrl}
                alt={item.name}
                style={styles.image}
            />

            {/* Upload overlay */}
            <div style={styles.overlay}>
                {item.status === 'uploading' && (
                    <>
                        <div style={styles.spinner} />
                        <div style={styles.progressContainer}>
                            <div style={styles.progressBar}>
                                <div
                                    style={{
                                        ...styles.progressFill,
                                        width: `${item.progress}%`
                                    }}
                                />
                            </div>
                            <p style={styles.progressText}>{item.progress}%</p>
                        </div>
                    </>
                )}

                {item.status === 'success' && (
                    <>
                        <CheckIcon />
                        <p style={styles.progressText}>Upload complete</p>
                    </>
                )}

                {item.status === 'error' && (
                    <>
                        <ErrorIcon />
                        <p style={styles.errorText}>
                            {item.error || 'Upload failed'}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
