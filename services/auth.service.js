const { auth_users, User, Role } = require("../models");
const bcrypt = require("bcryptjs");

const register = async (userData) => {
    const { email, password, name, role_id } = userData;

    const existingUser = await auth_users.findOne({ where: { email } });
    if (existingUser) {
        throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAuthUser = await auth_users.create({
        id: require("crypto").randomUUID(),
        email,
        password_hash: hashedPassword,
        created_at: new Date(),
    });

    const newUser = await User.create({
        name,
        auth_user_id: newAuthUser.id,
    });

    // Assign role if provided (logic depends on how User-Role is associated, assuming simplified for now or extending later)

    return { user: newUser, auth: newAuthUser };
};

const login = async (email, password) => {
    const authUser = await auth_users.findOne({ where: { email } });
    if (!authUser) {
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, authUser.password_hash);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    // Fetch full user details
    const user = await User.findOne({ where: { auth_user_id: authUser.id } });

    return { user, authUser };
};

const getAllUsers = async () => {
    return await User.findAll({
        include: [{ model: auth_users }]
    });
};

module.exports = {
    register,
    login,
    getAllUsers
};
