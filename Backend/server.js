const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Allowed origins — support multiple URLs
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow all vercel.app subdomains untuk safety
        if (origin.endsWith(".vercel.app")) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",        require("./route/auth"));
app.use("/api/classes",     require("./route/classes"));
app.use("/api/materials",   require("./route/materials"));
app.use("/api/assignments", require("./route/assignments"));
app.use("/api/quizzes",     require("./route/quizzes"));
app.use("/api/comments",    require("./route/comments"));
app.use("/api/dashboard",          require("./route/dashboard"));
app.use("/api/personal-materials", require("./route/personal-materials"));

app.get("/", (req, res) => {
    res.json({ message: "Server KelasKu berjalan!" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
});