import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Profile</h2>
        <p className="text-gray-600 mb-6">
          Welcome! Please complete your profile to start participating in auctions.
        </p>
        
        <form onSubmit={handleCreateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="text-red-600 text-sm mt-1">{usernameError}</p>
            )}
            {username.length >= 3 && !usernameError && checkUsername === true && (
              <p className="text-green-600 text-sm mt-1">✓ Username is available</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name or preferred display name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City, Country"
            />
          </div>

          <button
            type="submit"
            disabled={!!usernameError || !username || !displayName}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
}
