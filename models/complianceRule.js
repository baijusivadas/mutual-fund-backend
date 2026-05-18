module.exports = (sequelize, DataTypes) => {
  const ComplianceRule = sequelize.define('ComplianceRule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    rule_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rule_type: DataTypes.STRING,
    description: DataTypes.TEXT,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'compliance_rules',
    underscored: true
  });

  return ComplianceRule;
};
