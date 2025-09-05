/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as archivedAuctions from "../archivedAuctions.js";
import type * as artPieces from "../artPieces.js";
import type * as auctionRequests from "../auctionRequests.js";
import type * as auctions from "../auctions.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as favorites from "../favorites.js";
import type * as http from "../http.js";
import type * as migrations from "../migrations.js";
import type * as notifications from "../notifications.js";
import type * as oauthUsers from "../oauthUsers.js";
import type * as router from "../router.js";
import type * as userManagement from "../userManagement.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  archivedAuctions: typeof archivedAuctions;
  artPieces: typeof artPieces;
  auctionRequests: typeof auctionRequests;
  auctions: typeof auctions;
  auth: typeof auth;
  crons: typeof crons;
  favorites: typeof favorites;
  http: typeof http;
  migrations: typeof migrations;
  notifications: typeof notifications;
  oauthUsers: typeof oauthUsers;
  router: typeof router;
  userManagement: typeof userManagement;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
