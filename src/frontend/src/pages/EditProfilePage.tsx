import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import EditProfileForm from '../components/EditProfileForm';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function EditProfilePage() {
  const { identity } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please sign in to edit your profile</p>
          <Link to="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <Link to={`/profile/${identity.getPrincipal().toString()}`}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <EditProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
