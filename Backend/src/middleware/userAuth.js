import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res.json({
            success: false,
            message: "Unauthorized Access, Please Login First!"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id) {
            if (!req.body) req.body = {};
            req.body.userId = decoded.id;
        } else {
            return res.json({
                success: false,
                message: "Unauthorized Access, Please Login First!"
            })
        }
        next();

    } catch (error) {
        console.log("Error in userAuth Middleware:", error);
        return res.json({
            success: false,
            message: "Invalid Token, Please Login Again!"
        })
    }
}
export default userAuth;