"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionMiddleware = void 0;
const sessionMiddleware = (req, res, next) => {
    try {
        const s = req.session;
        console.log(s);
        if (!s.user || !s.user.success) {
            res.status(401).json({ message: "Unauthorized request. Please sign in first." });
            return;
        }
        next();
    }
    catch (e) {
        console.error("Error in session middleware: ", e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.sessionMiddleware = sessionMiddleware;
