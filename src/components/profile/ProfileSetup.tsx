import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const createUserProfile = useMutation(api.users.createUserProfile);
  const checkUsername = useQuery(
    api.users.checkUsernameAvailability,
    username.length >= 3 ? { username } : "skip"
  );

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameError("");
    
    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters");
    } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError("Username can only contain letters, numbers, and underscores");
    } else if (checkUsername === false) {
      setUsernameError("Username is already taken");
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usernameError || !username || !displayName) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    try {
      await createUserProfile({
        username,
        displayName,
        bio: bio || undefined,
        location: location || undefined,
      });
      
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create profile");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Complete Your Profile</h2>
        <p className="mb-6 text-gray-600">
          Welcome! Please complete your profile to start participating in auctions.
        </p>
        
        <form onSubmit={handleCreateProfile} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Username * <span className="text-xs text-gray-500">(visible to other users)</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                usernameError 
                  ? "border-red-300 focus:ring-red-500" 
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter a unique username"
              required
              minLength={3}
            />
            {usernameError && (
              <p className="mt-1 text-sm text-red-600">{usernameError}</p>
            )}
            {username.length >= 3 && !usernameError && checkUsername === true && (
              <p className="mt-1 text-sm text-green-600">✓ Username is available</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name or preferred display name"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City, Country"
            />
          </div>

          <button
            type="submit"
            disabled={!!usernameError || !username || !displayName}
            className="px-4 py-2 w-full font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
}
