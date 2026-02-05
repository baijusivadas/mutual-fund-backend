module.exports = (sequelize, DataTypes) => {
  const rental = sequelize.define(
    "rental_properties",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      property_name: DataTypes.TEXT,
      location: DataTypes.TEXT,
      monthly_rent: DataTypes.DECIMAL,
      deposit: DataTypes.DECIMAL,
      bedrooms: DataTypes.INTEGER,
      bathrooms: DataTypes.INTEGER,
      area: DataTypes.DECIMAL,
      status: DataTypes.TEXT,
      tenant_name: DataTypes.TEXT,
      lease_start_date: DataTypes.DATEONLY,
      lease_end_date: DataTypes.DATEONLY,
      created_by: DataTypes.UUID,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
  return rental;
};
