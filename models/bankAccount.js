module.exports = (sequelize, DataTypes) => {
    const BankAccount = sequelize.define(
        "bank_accounts",
        {
            id: { type: DataTypes.UUID, primaryKey: true },
            bank_name: DataTypes.TEXT,
            account_type: DataTypes.TEXT,
            account_number: DataTypes.TEXT,
            current_balance: DataTypes.DECIMAL,
            interest_rate: DataTypes.DECIMAL,
            maturity_date: DataTypes.DATEONLY,
            status: DataTypes.TEXT,
            created_by: DataTypes.UUID,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        { timestamps: false }
    );
    return BankAccount;
};
