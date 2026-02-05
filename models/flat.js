module.exports = (sequelize, DataTypes) => {
  const flat = sequelize.define(
    "flats",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      flat_name: DataTypes.TEXT,
      location: DataTypes.TEXT,
      price: DataTypes.DECIMAL,
      bedrooms: DataTypes.INTEGER,
      bathrooms: DataTypes.INTEGER,
      area: DataTypes.DECIMAL,
      floor: DataTypes.INTEGER,
      status: DataTypes.TEXT,
      description: DataTypes.TEXT,
      images: DataTypes.ARRAY(DataTypes.TEXT),
      created_by: DataTypes.UUID,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
  return flat;
};
