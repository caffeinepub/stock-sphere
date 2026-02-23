import { useState, useEffect } from 'react';
import { useSaveCallerUserProfile, useGetCallerUserProfile } from '../hooks/useQueries';
import { ExperienceLevel, UserProfile } from '../backend';
import { ExternalBlob } from '../backend';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';

export default function EditProfileForm() {
  const { data: currentProfile } = useGetCallerUserProfile();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState<ExperienceLevel>(ExperienceLevel.beginner);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const { mutate: saveProfile, isPending, isError, error, isSuccess } = useSaveCallerUserProfile();

  useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.name);
      setBio(currentProfile.bio);
      setExperience(currentProfile.experience);
    }
  }, [currentProfile]);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [isSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let profilePic: ExternalBlob | undefined = currentProfile?.profilePic;

    if (profilePicFile) {
      const arrayBuffer = await profilePicFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      profilePic = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
    }

    saveProfile({
      name: name.trim(),
      bio: bio.trim(),
      experience,
      profilePic,
    });
  };

  const currentProfilePicUrl = currentProfile?.profilePic?.getDirectURL();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={currentProfilePicUrl || '/assets/generated/default-avatar.dim_128x128.png'} />
          <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Label htmlFor="profilePic">Change Profile Picture</Label>
          <div className="flex items-center gap-2">
            <Input
              id="profilePic"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          {profilePicFile && (
            <p className="text-xs text-muted-foreground">{profilePicFile.name}</p>
          )}
        </div>
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">{uploadProgress}% uploaded</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about your trading journey..."
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Experience Level</Label>
        <Select value={experience} onValueChange={(value) => setExperience(value as ExperienceLevel)}>
          <SelectTrigger id="experience">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ExperienceLevel.beginner}>Beginner</SelectItem>
            <SelectItem value={ExperienceLevel.intermediate}>Intermediate</SelectItem>
            <SelectItem value={ExperienceLevel.advanced}>Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <p className="text-sm text-destructive">
          {error?.message || 'Failed to save profile. Please try again.'}
        </p>
      )}

      {showSuccess && (
        <div className="flex items-center gap-2 text-sm text-[oklch(0.55_0.15_140)]">
          <CheckCircle2 className="h-4 w-4" />
          Profile updated successfully!
        </div>
      )}

      <Button type="submit" disabled={isPending || !name.trim()} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving Changes...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  );
}
