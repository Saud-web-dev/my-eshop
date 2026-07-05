import jwt from 'jsonwebtoken'


export default (req, res, next) => {
    try {
        const adminCookies = req.cookies?.adminCookies;

        // console.log(token, "token")

        if (!adminCookies) {
            return res.status(401).json({ msg: 'adminCookies is required' });
        }

        const decoded = jwt.verify(adminCookies, process.env.JWT_ADMIN_SECRET)

        // console.log(decoded);

        const { userId, role } = decoded

        req.user = { userId, role };

        next()

    } catch (error) {

        return res.status(401).json(error.message)

    }
}