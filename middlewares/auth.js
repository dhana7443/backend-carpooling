const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // includes user_id and role_name
    console.log(req.user)
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role_name !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
