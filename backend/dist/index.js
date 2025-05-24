"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const csurf_1 = __importDefault(require("csurf"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = require("connect-redis");
const user_1 = __importDefault(require("./routers/user"));
const movie_1 = __importDefault(require("./routers/movie"));
const init_1 = __importDefault(require("./routers/init"));
const redis_1 = require("./lib/redis");
const db_1 = require("./db");
const lib_1 = require("./lib/lib");
(async () => {
    const app = (0, express_1.default)();
    const client = await (0, redis_1.initClient)();
    const redisStore = new connect_redis_1.RedisStore({
        client
    });
    app.use((0, express_session_1.default)({
        store: redisStore,
        secret: process.env.AUTH_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            maxAge: 1000 * 60 * 60,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        }
    }));
    app.use((0, csurf_1.default)());
    app.use((req, res, next) => {
        res.cookie("XSRF-TOKEN", req.csrfToken(), {
            httpOnly: false,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });
        next();
    });
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use((0, helmet_1.default)());
    app.use(helmet_1.default.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            objectSrc: ["'none'"]
        }
    }));
    await Promise.all([
        // dropTables()
        (0, db_1.createUserTable)(),
        (0, db_1.createMovieTable)()
    ]);
    app.use("/api/user", (0, lib_1.rateLimiter)(5, 15 * 60 * 1000), user_1.default);
    app.use("/api/movie", (0, lib_1.rateLimiter)(5, 15 * 60 * 1000), movie_1.default);
    app.use("/api/init", init_1.default);
    const PORT = process.env.PORT || 2217;
    app.listen(PORT, () => console.log(`Server is running in porttt: ${PORT}`));
})();
