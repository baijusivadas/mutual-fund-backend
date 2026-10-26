const {
  Investor,
  InvestorAddress,
  InvestorBankAccount,
  InvestorKyc,
  sequelize,
} = require('../models');
const crypto = require('crypto');

const getScopedInvestor = async (id, userId, include = []) => {
  const where = { id };
  if (userId) where.user_id = userId;

  const investor = await Investor.findOne({ where, include });
  if (!investor) {
    const error = new Error('Investor not found');
    error.status = 404;
    throw error;
  }
  return investor;
};

const createInvestor = async (investorData) => {
  return await sequelize.transaction(async (t) => {
    const investor = await Investor.create(
      {
        ...investorData,
        id: crypto.randomUUID(),
      },
      { transaction: t }
    );

    if (investorData.address) {
      await InvestorAddress.create(
        {
          ...investorData.address,
          investor_id: investor.id,
          id: crypto.randomUUID(),
        },
        { transaction: t }
      );
    }

    if (investorData.bank_account) {
      await InvestorBankAccount.create(
        {
          ...investorData.bank_account,
          investor_id: investor.id,
          id: crypto.randomUUID(),
        },
        { transaction: t }
      );
    }

    // Initialize KYC as Pending
    await InvestorKyc.create(
      {
        investor_id: investor.id,
        id: crypto.randomUUID(),
        kyc_status: 'Pending',
      },
      { transaction: t }
    );

    return investor;
  });
};

const getInvestors = async (userId) => {
  const where = userId ? { user_id: userId } : {};
  return await Investor.findAll({
    where,
    include: [{ model: InvestorAddress }, { model: InvestorBankAccount }, { model: InvestorKyc }],
  });
};

const getInvestorById = async (id, userId) => {
  return getScopedInvestor(id, userId, [
    { model: InvestorAddress },
    { model: InvestorBankAccount },
    { model: InvestorKyc },
  ]);
};

const updateInvestor = async (id, updateData, userId) => {
  const investor = await getScopedInvestor(id, userId);
  const safeData = { ...updateData };
  delete safeData.id;
  delete safeData.user_id;
  return await investor.update(safeData);
};

const deleteInvestor = async (id, userId) => {
  const investor = await getScopedInvestor(id, userId);
  return await investor.destroy();
};

const addBankAccount = async (investorId, bankData) => {
  return await InvestorBankAccount.create({
    ...bankData,
    investor_id: investorId,
    id: crypto.randomUUID(),
  });
};

const updateKYC = async (investorId, kycData, userId) => {
  await getScopedInvestor(investorId, userId);
  const kyc = await InvestorKyc.findOne({ where: { investor_id: investorId } });
  if (!kyc) throw new Error('KYC record not found');
  const safeData = { ...kycData };
  delete safeData.id;
  delete safeData.investor_id;
  return await kyc.update(safeData);
};

module.exports = {
  createInvestor,
  getInvestors,
  getInvestorById,
  updateInvestor,
  deleteInvestor,
  addBankAccount,
  updateKYC,
};
