const { roles } = require("../models");

const createRole = async (roleData) => {
    return await roles.create({
        id: require("crypto").randomUUID(),
        ...roleData,
        created_at: new Date()
    });
};

const getAllRoles = async () => {
    return await roles.findAll();
};

const updateRole = async (id, roleData) => {
    const role = await roles.findByPk(id);
    if (!role) throw new Error("Role not found");
    return await role.update(roleData);
};

const deleteRole = async (id) => {
    const role = await roles.findByPk(id);
    if (!role) throw new Error("Role not found");
    return await role.destroy();
};

module.exports = {
    createRole,
    getAllRoles,
    updateRole,
    deleteRole
};
