module.exports = (req, res, next) => {
    if (req.user === undefined || !req.user.IsAdmin) {
        return res.redirect('/');
    }
    next();
}