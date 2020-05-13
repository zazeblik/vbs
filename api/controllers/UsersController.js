/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    authenticated: async (req, res) => { 
        const user = await Users.findOne(req.session.User.id);
        if (!user) {
            return res.status(400).send("Авторизованный пользователь не найден");
        }
        delete user.password;
        return res.status(200).send(user);
    }
};

