import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { ProfileSetup } from "./ProfileSetup";

export function UserProfile() {
  const [isCreating, setIsCreating] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const userProfile = useQuery(api.users.getUserProfile, {});
  const userAuctions = useQuery(api.auctions.getUserAuctions);
  const userBids = useQuery(api.auctions.getUserBids);
  const createUserProfile = useMutation(api.users.createUserProfile);
  const createOrUpdateFromAuth = useMutation(api.oauthUsers.createOrUpdateProfileFromAuth);
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
      
      setIsCreating(false);
      setUsername("");
      setDisplayName("");
      setBio("");
      setLocation("");
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create profile");
    }
  };

  // Auto-create profile for OAuth users
  useEffect(() => {
    if (userProfile === null) {
      createOrUpdateFromAuth().catch(console.error);
    }
  }, [userProfile, createOrUpdateFromAuth]);

  if (userProfile === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userProfile && !isCreating) {
    return <ProfileSetup />;
  }

  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Profile</h2>
          
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

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!!usernameError || !username || !displayName}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Profile
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Username:</span> @{userProfile?.username}</p>
              <p><span className="font-medium">Display Name:</span> {userProfile?.displayName}</p>
              <p><span className="font-medium">Email:</span> {userProfile?.email} <span className="text-xs text-gray-500">(private)</span></p>
              {userProfile?.location && (
                <p><span className="font-medium">Location:</span> {userProfile.location}</p>
              )}
              {userProfile?.bio && (
                <p><span className="font-medium">Bio:</span> {userProfile.bio}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Statistics</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Total Bids:</span> {userProfile?.totalBids}</p>
              <p><span className="font-medium">Auctions Won:</span> {userProfile?.totalWins}</p>
              <p><span className="font-medium">Auctions Created:</span> {userProfile?.totalAuctions}</p>
              <p><span className="font-medium">Rating:</span> ⭐ {userProfile?.rating.toFixed(1)}</p>
              <p><span className="font-medium">Member Since:</span> {userProfile?.joinedAt ? new Date(userProfile.joinedAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">My Auctions</h3>
          {userAuctions === undefined ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : userAuctions.length === 0 ? (
            <p className="text-gray-500">No auctions created yet</p>
          ) : (
            <div className="space-y-3">
              {userAuctions.slice(0, 5).map((auction) => (
                <div key={auction._id} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{auction.title}</h4>
                      <p className="text-sm text-gray-600">
                        Current: ${auction.currentBid.toLocaleString()} • {auction.bidCount} bids
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      auction.status === "active" ? "bg-green-100 text-green-800" :
                      auction.status === "ended" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {auction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">My Bids</h3>
          {userBids === undefined ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : userBids.length === 0 ? (
            <p className="text-gray-500">No bids placed yet</p>
          ) : (
            <div className="space-y-3">
              {userBids.slice(0, 5).map((bid) => (
                <div key={bid._id} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{bid.auction?.title}</h4>
                      <p className="text-sm text-gray-600">
                        Your bid: ${bid.amount.toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      bid.isCurrentWinner ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {bid.isCurrentWinner ? "Winning" : "Outbid"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
