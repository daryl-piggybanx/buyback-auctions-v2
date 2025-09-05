import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  artPieces: defineTable({
    title: v.string(),
    imageId: v.optional(v.id("_storage")),
    videoId: v.optional(v.id("_storage")),
    createdBy: v.id("users"),
    category: v.string(),
    dimensions: v.union(v.literal("100%"), v.literal("400%"), v.literal("10000%")),
    variation: v.optional(v.string()),
    purchaseDate: v.optional(v.number()),
  }).index("by_creator", ["createdBy"]),

  auctionRequests: defineTable({
    artPieceId: v.id("artPieces"),
    requesterId: v.id("users"),
    title: v.string(),
    description: v.string(),
    suggestedStartingPrice: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    adminNotes: v.optional(v.string()),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectedBy: v.optional(v.id("users")),
    rejectedAt: v.optional(v.number()),
    auctionId: v.optional(v.id("auctions")),
  })
    .index("by_status", ["status"])
    .index("by_requester", ["requesterId"]),

  auctions: defineTable({
    artPieceId: v.id("artPieces"),
    auctioneerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    startingPrice: v.number(),
    currentBid: v.number(),
    currentBidderId: v.optional(v.id("users")),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("ended"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    startTime: v.number(),
    endTime: v.number(),
    isFixedEndTime: v.boolean(),
    bidCount: v.number(),
    isLocked: v.boolean(),
    winnerAccepted: v.optional(v.boolean()),
    paymentDeadline: v.optional(v.number()),
    shippingDeadline: v.optional(v.number()),
    flaggedCount: v.number(),
    auctionRequestId: v.optional(v.id("auctionRequests")),
  })
    .index("by_status", ["status"])
    .index("by_auctioneer", ["auctioneerId"])
    .index("by_end_time", ["endTime"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status"],
    }),

  bids: defineTable({
    auctionId: v.id("auctions"),
    bidderId: v.id("users"),
    amount: v.number(),
    timestamp: v.number(),
    isValid: v.boolean(),
    isWinning: v.boolean(),
  })
    .index("by_auction", ["auctionId"])
    .index("by_bidder", ["bidderId"])
    .index("by_auction_and_amount", ["auctionId", "amount"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    username: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    totalBids: v.number(),
    totalWins: v.number(),
    totalAuctions: v.number(),
    rating: v.number(),
    isVerified: v.boolean(),
    joinedAt: v.number(),
    isAdmin: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_username", ["username"]),

  blacklist: defineTable({
    userId: v.id("users"),
    reason: v.string(),
    addedBy: v.id("users"),
    isActive: v.boolean(),
  }).index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("bid_placed"),
      v.literal("bid_outbid"),
      v.literal("auction_won"),
      v.literal("auction_ended"),
      v.literal("payment_due"),
      v.literal("shipping_due"),
      v.literal("auction_request_approved"),
      v.literal("auction_request_rejected")
    ),
    title: v.string(),
    message: v.string(),
    auctionId: v.optional(v.id("auctions")),
    auctionRequestId: v.optional(v.id("auctionRequests")),
    isRead: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  }).index("by_user", ["userId"]),

  favorites: defineTable({
    userId: v.id("users"),
    auctionId: v.id("auctions"),
  })
    .index("by_user", ["userId"])
    .index("by_auction", ["auctionId"])
    .index("by_user_and_auction", ["userId", "auctionId"]),

  transactions: defineTable({
    auctionId: v.id("auctions"),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("completed"),
      v.literal("disputed")
    ),
    paymentMethod: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
  }).index("by_auction", ["auctionId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
