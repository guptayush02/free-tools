const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  companyId: { type: String, required: false }
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
  payee: { type: CompanySchema, required: true },
  payer: { type: CompanySchema, required: true },
  items: [ItemSchema],
  date: { type: Date, required: true },
  total: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  userId: { type: String, required: true }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
