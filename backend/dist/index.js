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
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_session_1 = __importDefault(require("express-session"));
const user_1 = __importDefault(require("./routers/user"));
const init_1 = __importDefault(require("./routers/init"));
const db_1 = require("./db");
const app = (0, express_1.default)();
const PgSession = (0, connect_pg_simple_1.default)(express_session_1.default);
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
app.use((0, express_session_1.default)({
    store: new PgSession({
        pool: db_1.pool,
        tableName: 'session',
        createTableIfMissing: true
    }),
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
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 5
}));
// dropTable()
(0, db_1.createUserTable)();
// const key = crypto.randomBytes(32); // 256 bits = 32 bytes
// console.log("AES-256 Key (hex):", key.toString('hex'));
app.use("/api/user", user_1.default);
app.use("/api/init", init_1.default);
const PORT = process.env.PORT || 2217;
app.listen(PORT, () => console.log(`Server is running in porttt: ${PORT}`));
