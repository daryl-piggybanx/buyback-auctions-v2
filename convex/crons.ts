import { cronJobs } from "convex/server";

const crons = cronJobs();

// No more expensive polling crons - using scheduled functions instead
// Individual auctions now schedule their own start/end events

export default crons;
