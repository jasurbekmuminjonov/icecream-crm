const jwt = require("jsonwebtoken");

exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const createRole = req?.body?.role
    
    if (createRole === "admin") {
      return next()
    }
    if (!token) {
      return res
        .status(401)
        .json({ message: "Siz avtorizatsiyadan o'tmagansiz" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Token xato" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token yaroqsiz" });
    console.log(error);
    
  }
};
