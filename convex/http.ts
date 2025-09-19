import { auth } from "./auth";
import router from "./router";
// import { httpRouter } from "convex/server";

const http = router;

auth.addHttpRoutes(http);

export default http;
