import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/api/axios';

interface ImageUploadProps {
    value: string | string[];
    onChange: (url: string | string[]) => void;
    folder?: string;
    className?: string;
    aspectRatio?: string; // e.g., "16/9" or "3/4"
    placeholder?: string;
    allowMultiple?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    folder = 'uploads',
    className,
    aspectRatio = '16/9',
    placeholder = 'Upload or enter image URL',
    allowMultiple = false
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const urls = Array.isArray(value) ? value : (value ? [value] : []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Validate file types and sizes
        const validFiles: File[] = [];
        const maxSize = 1 * 1024 * 1024; // 1MB

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                toast.error(`File ${file.name} is not an image`);
                continue;
            }
            if (file.size > maxSize) {
                toast.error(`File ${file.name} is too large (>1MB)`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        setIsUploading(true);
        try {
            const uploadedUrls: string[] = [];

            // Upload files one by one (or batch if API supports it, but loop is safer for now)
            // Ideally use the multiple upload endpoint if implemented
            if (validFiles.length > 1 || allowMultiple) {
                // Convert all to base64 first
                const base64Images = await Promise.all(validFiles.map(file => {
                    return new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target?.result as string);
                        reader.readAsDataURL(file);
                    });
                }));

                const res = await api.post('/upload/multiple', {
                    images: base64Images,
                    folder
                });

                if (res.status === 200) {
                    uploadedUrls.push(...res.data.urls);
                } else {
                    toast.error('Upload failed');
                }

            } else {
                // Single upload fallback
                const file = validFiles[0];
                const reader = new FileReader();
                reader.readAsDataURL(file);
                await new Promise<void>((resolve) => {
                    reader.onload = async (event) => {
                        const base64 = event.target?.result as string;
                        try {
                            const res = await api.post('/upload', {
                                image: base64,
                                folder
                            });

                            if (res.status === 200) {
                                uploadedUrls.push(res.data.url);
                            }
                        } catch (e) {
                            console.error("Single upload error", e);
                            toast.error('Upload failed');
                        }
                        resolve();
                    };
                });
            }

            if (uploadedUrls.length > 0) {
                if (allowMultiple) {
                    onChange([...urls, ...uploadedUrls]);
                } else {
                    onChange(uploadedUrls[0]);
                }
                toast.success('Image(s) uploaded successfully');
            }

        } catch (error) {
            console.error(error);
            toast.error('Error uploading image');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            if (allowMultiple) {
                onChange([...urls, urlInput.trim()]);
            } else {
                onChange(urlInput.trim());
            }
            setUrlInput('');
            setShowUrlInput(false);
        }
    };

    const handleRemove = (indexToRemove: number) => {
        if (allowMultiple) {
            const newUrls = urls.filter((_, i) => i !== indexToRemove);
            onChange(newUrls);
        } else {
            onChange('');
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Gallery Grid for Multiple Images */}
            {allowMultiple && urls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {urls.map((url, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square">
                            <img src={url} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleRemove(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Single Image Preview */}
            {!allowMultiple && urls.length > 0 && (
                <div className="relative group w-full">
                    <div
                        className="relative rounded-xl overflow-hidden border border-border bg-muted"
                        style={{ aspectRatio }}
                    >
                        <img
                            src={urls[0]}
                            alt="Uploaded"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Replace
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemove(0)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Button */}
            {(allowMultiple || urls.length === 0) && (
                <div
                    className={cn(
                        "relative rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 p-6",
                        isUploading && "pointer-events-none opacity-50"
                    )}
                    style={!allowMultiple ? { aspectRatio } : undefined}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div className="text-center">
                                <p className="text-sm font-medium">
                                    {allowMultiple ? "Click to upload images" : "Click to upload"}
                                </p>
                                <p className="text-xs text-muted-foreground">Max 5MB per img • PNG, JPG, WEBP</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={allowMultiple}
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* URL Input Toggle */}
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-xs"
                >
                    <LinkIcon className="h-3 w-3 mr-1" />
                    {showUrlInput ? 'Hide URL input' : 'Or enter URL'}
                </Button>
            </div>

            {/* URL Input field */}
            {showUrlInput && (
                <div className="flex gap-2">
                    <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                    />
                    <Button type="button" onClick={handleUrlSubmit} size="sm">
                        Add
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
