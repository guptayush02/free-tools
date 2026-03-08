const Invoice = require('../models/Invoice');

exports.createInvoice = async (req, res) => {
  try {
    const { payee, payer, items, date, total, currency } = req.body;
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    // companyId is optional for both payee and payer
    const invoice = new Invoice({ payee, payer, items, date, total, currency, userId });
    await invoice.save();
    res.status(201).json({ message: 'Invoice created', invoice });
  } catch (err) {
    console.log('Error creating invoice:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get all invoices for logged-in user
exports.getUserInvoices = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const invoices = await Invoice.find({ userId }).sort({ date: -1 });
    res.status(200).json({ invoices });
  } catch (err) {
    console.log('Error fetching invoices:', err);
    res.status(400).json({ error: err.message });
  }
};
