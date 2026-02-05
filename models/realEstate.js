module.exports = (sequelize, DataTypes) => {
  const realEstate = sequelize.define(
    "real_estate",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      property_name: DataTypes.TEXT,
      location: DataTypes.TEXT,
      price: DataTypes.DECIMAL,
      area: DataTypes.DECIMAL,
      property_type: DataTypes.TEXT,
      status: DataTypes.TEXT,
      description: DataTypes.TEXT,
      images: DataTypes.ARRAY(DataTypes.TEXT),
      created_by: DataTypes.UUID,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
  return realEstate;
};
