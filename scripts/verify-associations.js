const { sequelize, auth_users, User, Transaction } = require('../models');

async function verify() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // sync only if needed, but preferably we rely on migrations. 
        // For this test script, we might want to just check if we can include the models.

        // We won't create actual data to avoid polluting the DB if it's production.
        // Instead we will inspect the model associations programmatically.

        console.log('Checking AuthUser association...');
        if (auth_users.associations.Users) {
            console.log('✅ auth_users.hasMany(User) is defined.');
        } else {
            console.error('❌ auth_users.hasMany(User) is MISSING.');
        }

        console.log('Checking User association...');
        if (User.associations.auth_user) {
            console.log('✅ User.belongsTo(auth_users) is defined.');
        } else {
            console.error('❌ User.belongsTo(auth_users) is MISSING.');
        }

        // Check if the foreign key field exists in the raw attributes
        if (User.rawAttributes.auth_user_id) {
            console.log('✅ User model has auth_user_id field.');
        } else {
            console.error('❌ User model MISSING auth_user_id field.');
        }

        console.log('Verification Complete');
        process.exit(0);

    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

verify();
