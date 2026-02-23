import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateCourse } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateCourseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const { mutate: createCourse, isPending } = useCreateCourse();
  const navigate = useNavigate();

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !price || !thumbnailFile) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Convert file to bytes
      const arrayBuffer = await thumbnailFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Get the direct URL for the uploaded blob
      const thumbnailUrl = blob.getDirectURL();

      // Convert ICP to e8s (1 ICP = 100,000,000 e8s)
      const priceInE8s = BigInt(Math.round(priceValue * 100_000_000));

      const courseId = `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      createCourse(
        {
          id: courseId,
          title: title.trim(),
          description: description.trim(),
          price: priceInE8s,
          thumbnailUrl,
        },
        {
          onSuccess: () => {
            toast.success('Course created successfully!');
            navigate({ to: '/marketplace' });
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to create course');
            setIsUploading(false);
          },
        }
      );
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to upload thumbnail');
      setIsUploading(false);
    }
  };

  const isFormValid = title.trim() && description.trim() && price && thumbnailFile;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Course Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Advanced Options Trading Strategies"
          maxLength={100}
          required
        />
        <p className="text-xs text-muted-foreground">{title.length}/100 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Course Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what students will learn in this course..."
          rows={6}
          maxLength={1000}
          required
        />
        <p className="text-xs text-muted-foreground">{description.length}/1000 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (ICP) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          required
        />
        <p className="text-xs text-muted-foreground">Set your course price in ICP tokens</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">Course Thumbnail *</Label>
        {thumbnailPreview ? (
          <div className="relative">
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="w-full h-48 object-cover rounded-lg border border-border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeThumbnail}
            >
              <X className="h-4 w-4" />
            </Button>
            {isUploading && uploadProgress < 100 && (
              <div className="absolute bottom-2 left-2 right-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-white mt-1 text-center">
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <Label htmlFor="thumbnail" className="cursor-pointer">
              <span className="text-sm text-primary hover:underline">Click to upload</span>
              <span className="text-sm text-muted-foreground"> or drag and drop</span>
            </Label>
            <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 5MB</p>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
              required
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate({ to: '/marketplace' })}
          disabled={isPending || isUploading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid || isPending || isUploading}
          className="flex-1"
        >
          {isPending || isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? 'Uploading...' : 'Creating...'}
            </>
          ) : (
            'Create Course'
          )}
        </Button>
      </div>
    </form>
  );
}
