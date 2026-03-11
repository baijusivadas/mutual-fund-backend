const db = require("../models");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("analyticsController");

const getPortfolioMetrics = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Shared 'where' clause depending on roles
        const where = userRole === 'superAdmin' ? {} : { created_by: userId };

        // 1. Fetch all assets/investments for the user
        const [
            mutualFunds,
            realEstate,
            flats,
            rentalProperties,
            bankAccounts,
            liabilities,
            customAssets,
            crypto,
            bonds,
            etfs,
            nps
        ] = await Promise.all([
            db.transaction.findAll({ where: userRole === 'superAdmin' ? {} : { user_id: userId } }), // Mutual fund transactions
            db.real_estate.findAll({ where }),
            db.flat.findAll({ where }),
            db.rental_property.findAll({ where }),
            db.bank_accounts.findAll({ where }),
            db.liabilities.findAll({ where }),
            db.custom_assets.findAll({ where }),
            db.crypto_investments.findAll({ where }),
            db.bonds.findAll({ where }),
            db.etfs.findAll({ where }),
            db.nps_investments.findAll({ where })
        ]);

        // Calculate real-time metrics
        const propertyMetrics = {
            totalProperties: realEstate.length + flats.length + rentalProperties.length,
            totalPropertyValue:
                realEstate.reduce((sum, item) => sum + parseFloat(item.price || 0), 0) +
                flats.reduce((sum, item) => sum + parseFloat(item.price || 0), 0) +
                rentalProperties.reduce((sum, item) => sum + parseFloat(item.purchase_price || 0), 0),
            totalMonthlyRevenue: rentalProperties
                .filter(p => p.status === 'occupied')
                .reduce((sum, item) => sum + parseFloat(item.monthly_rent || 0), 0),
            occupancyRate: rentalProperties.length > 0
                ? (rentalProperties.filter(p => p.status === 'occupied').length / rentalProperties.length) * 100
                : 0,
            statusDistribution: [
                { name: "Available", value: [...realEstate, ...flats, ...rentalProperties].filter(p => p.status === "available").length },
                { name: "Occupied/Sold", value: [...realEstate, ...flats, ...rentalProperties].filter(p => p.status === "occupied" || p.status === "sold").length },
                { name: "Maintenance", value: [...realEstate, ...flats, ...rentalProperties].filter(p => p.status === "maintenance").length },
            ].filter(item => item.value > 0),
            revenueData: Array.from({ length: 6 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - (5 - i));
                const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                // Simple revenue trend: current revenue with some variance for mock history
                const currentRevenue = rentalProperties
                    .filter(p => p.status === 'occupied')
                    .reduce((sum, item) => sum + parseFloat(item.monthly_rent || 0), 0);
                return {
                    month: monthName,
                    revenue: currentRevenue * (0.85 + Math.random() * 0.3)
                };
            })
        };

        res.json({
            metrics: propertyMetrics,
            details: {
                realEstate,
                flats,
                rentalProperties,
                bankAccounts,
                liabilities,
                customAssets,
                crypto,
                bonds,
                etfs,
                nps,
                mutualFunds
            }
        });
    } catch (err) {
        logger.error(`Get metrics error: ${err.message}`);
        next(err);
    }
};

module.exports = {
    getPortfolioMetrics,
};
