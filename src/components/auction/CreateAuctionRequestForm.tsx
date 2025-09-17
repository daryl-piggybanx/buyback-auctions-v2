import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { toast } from "sonner";
import { DatePicker } from "~/components/DatePicker";
import { collectionCategories } from "~/lib/data";

export function CreateAuctionRequestForm() {
  const [step, setStep] = useState<"art-piece" | "request">("art-piece");
  const [selectedArtPieceId, setSelectedArtPieceId] = useState<string>("");
  
  // Art piece form state
  const [artTitle, setArtTitle] = useState("");
  const [category, setCategory] = useState("");
  const [dimensions, setDimensions] = useState<"100%" | "400%" | "10000%" | "">("");
  const [variation, setVariation] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  
  // Auction request form state
  const [requestDescription, setRequestDescription] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const userArtPieces = useQuery(api.artPieces.getUserArtPieces);
  const generateUploadUrl = useMutation(api.artPieces.generateUploadUrl);
  const createArtPiece = useMutation(api.artPieces.createArtPiece);
  const createAuctionRequest = useMutation(api.auctionRequests.createAuctionRequest);

  const handleCreateArtPiece = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dimensions) {
      toast.error("Please select dimensions");
      return;
    }
    
    try {
      let imageId, videoId;

      // Upload image if selected
      if (selectedImage) {
        const imageUploadUrl = await generateUploadUrl();
        const imageResult = await fetch(imageUploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        const imageJson = await imageResult.json();
        if (!imageResult.ok) {
          throw new Error(`Image upload failed: ${JSON.stringify(imageJson)}`);
        }
        imageId = imageJson.storageId;
      }

      // Upload video if selected
      if (selectedVideo) {
        const videoUploadUrl = await generateUploadUrl();
        const videoResult = await fetch(videoUploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedVideo.type },
          body: selectedVideo,
        });
        const videoJson = await videoResult.json();
        if (!videoResult.ok) {
          throw new Error(`Video upload failed: ${JSON.stringify(videoJson)}`);
        }
        videoId = videoJson.storageId;
      }

      const artPieceId = await createArtPiece({
        title: artTitle,
        category,
        dimensions,
        variation: variation || undefined,
        purchaseDate: purchaseDate?.getTime(),
        imageId,
        videoId,
      });

      setSelectedArtPieceId(artPieceId);
      setStep("request");
      toast.success("Art piece created successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create art piece");
    }
  };

  const handleCreateAuctionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAuctionRequest({
        title: artTitle,
        description: requestDescription,
        selectedArtPieceId: selectedArtPieceId ? selectedArtPieceId as any : undefined,
        artPiece: {
          category: category || "Other",
          dimensions: dimensions,
          variation: variation,
          purchaseDate: purchaseDate?.getTime(),
        },
      });

      // Reset form
      setStep("art-piece");
      setSelectedArtPieceId("");
      setArtTitle("");
      setCategory("");
      setDimensions("");
      setVariation("");
      setPurchaseDate(undefined);
      setSelectedImage(null);
      setSelectedVideo(null);
      setRequestDescription("");
      
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";

      toast.success("Auction request submitted successfully! You'll be notified when it's reviewed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create auction request");
    }
  };

  if (step === "art-piece") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Create Auction Request</h2>
          
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Or select existing art piece:</h3>
            {userArtPieces && userArtPieces.length > 0 && (
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                {userArtPieces.map((piece) => (
                  <div
                    key={piece._id}
                    onClick={() => {
                      setSelectedArtPieceId(piece._id);
                      setStep("request");
                    }}
                    className="p-4 rounded-lg border border-gray-200 transition-colors cursor-pointer hover:border-blue-500"
                  >
                    {piece.imageUrl && (
                      <img 
                        src={piece.imageUrl} 
                        alt={piece.title}
                        className="object-cover mb-2 w-full h-32 rounded"
                      />
                    )}
                    <h4 className="font-medium text-gray-900">{piece.title}</h4>
                    <p className="text-sm text-gray-600">{piece.category}</p>
                    <p className="text-xs text-gray-500">Dimensions: {piece.dimensions}</p>
                    {piece.variation && (
                      <p className="text-xs text-gray-500">Variation: {piece.variation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleCreateArtPiece} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                value={artTitle}
                onChange={(e) => setArtTitle(e.target.value)}
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {collectionCategories.map((category) => {
                    if (category.subcategories.length > 0) {
                      return (
                        <optgroup key={category.name} label={category.name}>
                          {category.subcategories.map((subcategory) => (
                            <option key={subcategory} value={subcategory}>{subcategory}</option>
                          ))}
                        </optgroup>
                      );
                    }
                    return (
                      <option key={category.name} value={category.name}>{category.name}</option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Dimensions *
                </label>
                <select
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value as "100%" | "400%" | "10000%" | "")}
                  className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select dimensions</option>
                  <option value="100%">100%</option>
                  <option value="400%">400%</option>
                  <option value="10000%">10000%</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Variation
                </label>
                <input
                  type="text"
                  value={variation}
                  onChange={(e) => setVariation(e.target.value)}
                  placeholder="e.g., Angel Dust, Disco, Refractor"
                  className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Purchase Date
                </label>
                <DatePicker
                  value={purchaseDate}
                  onChange={setPurchaseDate}
                  placeholder="Select purchase date"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Image
              </label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Video (optional)
              </label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => setSelectedVideo(e.target.files?.[0] || null)}
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-3 w-full font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
            >
              Create Art Piece & Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Auction Request</h2>
          <button
            onClick={() => setStep("art-piece")}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Art Piece
          </button>
        </div>

        <form onSubmit={handleCreateAuctionRequest} className="space-y-4">

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Auction Description
            </label>
            <textarea
              value={requestDescription}
              onChange={(e) => setRequestDescription(e.target.value)}
              rows={3}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Anything else you want to add..."
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="mb-2 font-medium text-blue-900">What happens next?</h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Your request will be reviewed by PiggyBanx</li>
              <li>• PiggyBanx will set the auction date and starting price</li>
              <li>• You'll receive a notification with the auction details</li>
              <li>• Your auction will go live at the scheduled time</li>
            </ul>
          </div>

          <button
            type="submit"
            className="px-4 py-3 w-full font-medium text-white bg-green-600 rounded-md transition-colors hover:bg-green-700"
          >
            Submit Auction Request
          </button>
        </form>
      </div>
    </div>
  );
}
