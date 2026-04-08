const supabase = require("../db");

module.exports = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Akses ditolak, token tidak ada" });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ message: "Token tidak valid" });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role,
        };

        next();
    } catch (err) {
        res.status(401).json({ message: "Token tidak valid" });
    }
};