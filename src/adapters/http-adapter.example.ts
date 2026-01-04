/**
 * Example HTTP Adapter Implementation
 * 
 * This file demonstrates how to implement the MediaAdapter interface
 * using standard fetch API. Copy and modify for your own backend.
 * 
 * NOTE: This is an example file - not used directly in the module.
 */

import type { ListParams, ListResult, MediaItem } from '../core/types';
import type { MediaAdapter } from './media-adapter';

export class HttpMediaAdapter implements MediaAdapter {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async list(params: ListParams): Promise<ListResult> {
        const searchParams = new URLSearchParams();

        if (params.search) searchParams.set('search', params.search);
        if (params.folderId) searchParams.set('folderId', params.folderId);
        if (params.page) searchParams.set('page', String(params.page));
        if (params.limit) searchParams.set('limit', String(params.limit));

        const response = await fetch(`${this.baseUrl}/media?${searchParams}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch media: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            items: data.items.map((item: Record<string, unknown>) => ({
                ...item,
                createdAt: new Date(item.createdAt as string),
            })),
            total: data.total,
            hasMore: data.hasMore,
        };
    }

    async upload(file: File, onProgress?: (progress: number) => void): Promise<MediaItem> {
        const formData = new FormData();
        formData.append('file', file);

        // For progress tracking, we need XMLHttpRequest
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const data = JSON.parse(xhr.responseText);
                    resolve({
                        ...data,
                        createdAt: new Date(data.createdAt),
                    });
                } else {
                    reject(new Error(`Upload failed: ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed: Network error'));
            });

            xhr.open('POST', `${this.baseUrl}/media/upload`);
            xhr.send(formData);
        });
    }

    async delete(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/media/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Failed to delete media: ${response.statusText}`);
        }
    }
}
