const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let token = req.header("Authorization");

  console.log("RAW HEADER:", token);

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  console.log("TOKEN USED:", token);

  try {
    const decoded = jwt.verify(token.trim(), "mysecret123");
    console.log("DECODED:", decoded);
    req.user = decoded.id;
    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
