import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

interface ProfileDisplayProps {
  profile: UserProfile;
  principal: Principal;
}

export default function ProfileDisplay({ profile, principal }: ProfileDisplayProps) {
  const profilePicUrl = profile.profilePic?.getDirectURL();
  
  const experienceColors = {
    beginner: 'bg-[oklch(0.65_0.12_200)] text-white',
    intermediate: 'bg-[oklch(0.60_0.14_80)] text-white',
    advanced: 'bg-[oklch(0.55_0.15_140)] text-white',
  };

  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-20 w-20 border-2 border-border">
        <AvatarImage src={profilePicUrl || '/assets/generated/default-avatar.dim_128x128.png'} />
        <AvatarFallback className="text-2xl">{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-2xl font-semibold">{profile.name}</h2>
          <Badge className={experienceColors[profile.experience]}>
            {profile.experience.charAt(0).toUpperCase() + profile.experience.slice(1)}
          </Badge>
        </div>
        
        {profile.bio && (
          <p className="text-muted-foreground">{profile.bio}</p>
        )}
        
        <p className="text-xs text-muted-foreground font-mono">
          ID: {principal.toString().slice(0, 8)}...{principal.toString().slice(-6)}
        </p>
      </div>
    </div>
  );
}
