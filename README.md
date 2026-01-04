# @hoangg04/media-picker

A **reusable MediaPicker module** inspired by WordPress Media Library. Built with React, Radix UI primitives, and Zustand for state management.

## ✨ Features

- 🎯 **WordPress-like UX** - Familiar media library experience
- 🔌 **Adapter Pattern** - No hardcoded API calls, bring your own backend
- 📱 **Responsive Grid** - Beautiful grid layout that adapts to any screen
- ✅ **Single & Multi-select** - Choose one or multiple items
- 📤 **Blob Preview Upload** - See preview immediately while uploading
- 📊 **Per-file Progress** - Individual progress bars for each upload
- 🎨 **Customizable** - Override item rendering with render props
- ♿ **Accessible** - Built on Radix UI for WCAG compliance
- 🎭 **Headless Ready** - Pure Radix primitives, no shadcn/ui dependency
- 📦 **Isolated State** - Each modal has its own Zustand store

## 📦 Installation

```bash
npm install @hoangg04/media-picker
# or
yarn add @hoangg04/media-picker
# or
pnpm add @hoangg04/media-picker
```

### Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
npm install react react-dom @radix-ui/react-dialog zustand
```

## 🚀 Quick Start

### 1. Create an Adapter

The adapter is how MediaPicker communicates with your backend. You must implement the `MediaAdapter` interface:

```typescript
import type { MediaAdapter, ListParams, ListResult, MediaItem } from '@hoangg04/media-picker';

export class MyMediaAdapter implements MediaAdapter {
  async list(params: ListParams): Promise<ListResult> {
    const response = await fetch(`/api/media?search=${params.search || ''}`);
    const data = await response.json();
    
    return {
      items: data.items,
      total: data.total,
      hasMore: data.hasMore,
    };
  }

  async upload(file: File, onProgress?: (progress: number) => void): Promise<MediaItem> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error('Upload failed'));
        }
      });
      
      xhr.open('POST', '/api/media/upload');
      xhr.send(formData);
    });
  }

  async delete(id: string): Promise<void> {
    await fetch(`/api/media/${id}`, { method: 'DELETE' });
  }
}

export const myMediaAdapter = new MyMediaAdapter();
```

### 2. Use MediaPickerModal

```tsx
import { useState } from 'react';
import { MediaPickerModal, type MediaItem } from '@hoangg04/media-picker';
import { myMediaAdapter } from './my-media-adapter';

function MyComponent() {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Select Image
      </button>
      
      {selectedImage && (
        <img src={selectedImage.url} alt={selectedImage.name} />
      )}

      <MediaPickerModal
        open={open}
        onOpenChange={setOpen}
        adapter={myMediaAdapter}
        onSelect={(items) => setSelectedImage(items[0])}
        multiple={false}
        title="Select Image"
        confirmLabel="Select"
        cancelLabel="Cancel"
      />
    </>
  );
}
```

## 📖 API Reference

### MediaPickerModal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Whether the modal is open |
| `onOpenChange` | `(open: boolean) => void` | required | Callback when open state changes |
| `adapter` | `MediaAdapter` | required | Your data access adapter |
| `onSelect` | `(items: MediaItem[]) => void` | required | Callback when user confirms selection |
| `multiple` | `boolean` | `false` | Enable multi-select mode |
| `renderItem` | `(item: MediaItem, selected: boolean) => ReactNode` | - | Custom item renderer |
| `initialSelected` | `MediaItem[]` | `[]` | Pre-selected items |
| `title` | `string` | `"Media Library"` | Modal title |
| `confirmLabel` | `string` | `"Select"` | Confirm button text |
| `cancelLabel` | `string` | `"Cancel"` | Cancel button text |
| `searchPlaceholder` | `string` | `"Search media..."` | Search input placeholder |
| `uploadLabel` | `string` | `"Upload"` | Upload button text |
| `emptyMessage` | `string` | `"No media found"` | Empty state heading |
| `emptyDescription` | `string` | `"Upload files..."` | Empty state description |
| `acceptedFileTypes` | `string` | `"image/*,video/*"` | Accepted file types |
| `className` | `string` | - | Additional class for modal content |

### MediaAdapter Interface

```typescript
interface MediaAdapter {
  list(params: ListParams): Promise<ListResult>;
  upload(file: File, onProgress?: (progress: number) => void): Promise<MediaItem>;
  delete(id: string): Promise<void>;
}
```

### MediaItem Type

```typescript
interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  size: number;
  width?: number;
  height?: number;
  createdAt: Date;
}
```

## 🎨 Features

### Blob Preview Upload

When files are uploaded, they immediately appear in the grid with:
- Blob URL preview (instant display)
- Individual progress bar per file
- Spinner animation
- Success/error states

After upload completes, the blob preview is automatically replaced with the actual MediaItem.

### Custom Item Rendering

Use the `renderItem` prop to completely customize how items appear:

```tsx
<MediaPickerModal
  open={open}
  onOpenChange={setOpen}
  adapter={adapter}
  onSelect={handleSelect}
  multiple={true}
  renderItem={(item, selected) => (
    <div 
      className={`custom-item ${selected ? 'selected' : ''}`}
    >
      <img src={item.url} alt={item.name}/>
      {selected && <CheckIcon />}
    </div>
  )}
/>
```

## 📄 License

MIT
