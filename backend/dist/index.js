"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const express_session_1 = __importDefault(require("express-session"));
const user_1 = __importDefault(require("./routers/user"));
const db_1 = require("./db");
const app = (0, express_1.default)();
const PgSession = (0, connect_pg_simple_1.default)(express_session_1.default);
app.use(express_1.default.json());
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
// dropTable()
(0, db_1.createUserTable)();
// const key = crypto.randomBytes(32); // 256 bits = 32 bytes
// console.log("AES-256 Key (hex):", key.toString('hex'));
app.use("/api", user_1.default);
const PORT = process.env.PORT || 2217;
app.listen(PORT, () => console.log(`Server is running in port: ${PORT}`));
