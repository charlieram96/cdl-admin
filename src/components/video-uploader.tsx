'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  videoUrl: string | null;
  onVideoChange: (url: string | null) => void;
}

export function VideoUploader({ videoUrl, onVideoChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();

    const ext = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from('question-videos')
      .upload(fileName, file);

    if (error) {
      toast.error('Upload failed: ' + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('question-videos')
      .getPublicUrl(fileName);

    onVideoChange(urlData.publicUrl);
    toast.success('Video uploaded');
    setUploading(false);
  }

  function handleRemove() {
    onVideoChange(null);
  }

  return (
    <div className="space-y-3">
      {videoUrl ? (
        <div className="space-y-2">
          <video
            src={videoUrl}
            controls
            className="max-h-48 rounded-md border"
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleRemove}>
              Remove Video
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </Button>
        </div>
      )}
    </div>
  );
}
