const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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