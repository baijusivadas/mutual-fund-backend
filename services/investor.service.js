const { Investor, InvestorAddress, InvestorBankAccount, InvestorKyc, sequelize } = require("../models");
const crypto = require("crypto");

const createInvestor = async (investorData) => {
  return await sequelize.transaction(async (t) => {
    const investor = await Investor.create({
      ...investorData,
      id: crypto.randomUUID()
    }, { transaction: t });

    if (investorData.address) {
      await InvestorAddress.create({
        ...investorData.address,
        investor_id: investor.id,
        id: crypto.randomUUID()
      }, { transaction: t });
    }

    if (investorData.bank_account) {
      await InvestorBankAccount.create({
        ...investorData.bank_account,
        investor_id: investor.id,
        id: crypto.randomUUID()
      }, { transaction: t });
    }

    // Initialize KYC as Pending
    await InvestorKyc.create({
      investor_id: investor.id,
      id: crypto.randomUUID(),
      kyc_status: 'Pending'
    }, { transaction: t });

    return investor;
  });
};

const getInvestors = async (userId) => {
  const where = userId ? { user_id: userId } : {};
  return await Investor.findAll({
    where,
    include: [
      { model: InvestorAddress },
      { model: InvestorBankAccount },
      { model: InvestorKyc }
    ]
  });
};

const getInvestorById = async (id) => {
  const investor = await Investor.findByPk(id, {
    include: [
      { model: InvestorAddress },
      { model: InvestorBankAccount },
      { model: InvestorKyc }
    ]
  });
  if (!investor) throw new Error("Investor not found");
  return investor;
};

const updateInvestor = async (id, updateData) => {
  const investor = await Investor.findByPk(id);
  if (!investor) throw new Error("Investor not found");
  return await investor.update(updateData);
};

const deleteInvestor = async (id) => {
  const investor = await Investor.findByPk(id);
  if (!investor) throw new Error("Investor not found");
  return await investor.destroy();
};

const addBankAccount = async (investorId, bankData) => {
  return await InvestorBankAccount.create({
    ...bankData,
    investor_id: investorId,
    id: crypto.randomUUID()
  });
};

const updateKYC = async (investorId, kycData) => {
  const kyc = await InvestorKyc.findOne({ where: { investor_id: investorId } });
  if (!kyc) throw new Error("KYC record not found");
  return await kyc.update(kycData);
};

module.exports = {
  createInvestor,
  getInvestors,
  getInvestorById,
  updateInvestor,
  deleteInvestor,
  addBankAccount,
  updateKYC
};
