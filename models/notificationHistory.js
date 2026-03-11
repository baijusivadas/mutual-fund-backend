const { UUID, TEXT, DATE, fn } = require("sequelize");

module.exports = (sequelize) => {
    const NotificationHistory = sequelize.define(
        "notification_history",
        {
            id: { type: UUID, primaryKey: true, defaultValue: sequelize.literal('gen_random_uuid()') },
            notification_type: TEXT,
            recipient_email: TEXT,
            subject: TEXT,
            property_name: TEXT,
            tenant_name: TEXT,
            status: { type: TEXT, defaultValue: 'sent' },
            sent_at: { type: DATE, defaultValue: fn('now') },
            created_by: UUID,
        },
        {
            underscored: true,
            timestamps: true,
        }
    );

    return NotificationHistory;
};
