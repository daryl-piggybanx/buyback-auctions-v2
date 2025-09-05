import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for expired auctions every minute
crons.interval(
  "check expired auctions",
  { minutes: 1 },
  internal.auctions.checkExpiredAuctions,
  {}
);

export default crons;
