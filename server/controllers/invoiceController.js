const Invoice = require('../models/Invoice');
const { sendInvoiceEmail } = require('../utils/emailService');

const computeNextInvoiceNumber = (lastInvoiceNumber) => {
  const fallback = 'INV-1';
  if (!lastInvoiceNumber || typeof lastInvoiceNumber !== 'string') return fallback;

  const trimmed = lastInvoiceNumber.trim();
  const match = trimmed.match(/^(.*?)(\d+)$/);

  if (!match) {
    return `${trimmed}-1`;
  }

  const prefix = match[1] || '';
  const numericPart = match[2];
  const nextNumber = String(parseInt(numericPart, 10) + 1).padStart(numericPart.length, '0');

  return `${prefix}${nextNumber}`;
};

exports.createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, payee, payer, bankDetails, items, date, total, currency } = req.body;
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    // companyId is optional for both payee and payer
    const invoice = new Invoice({
      invoiceNumber,
      payee,
      payer,
      bankDetails,
      items,
      date,
      total,
      currency,
      userId
    });
    await invoice.save();
    res.status(201).json({ message: 'Invoice created', invoice });
  } catch (err) {
    console.log('Error creating invoice:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { invoiceNumber, payee, payer, bankDetails, items, date, total, currency } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, userId },
      { invoiceNumber, payee, payer, bankDetails, items, date, total, currency },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.status(200).json({ message: 'Invoice updated', invoice });
  } catch (err) {
    console.log('Error updating invoice:', err);
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

// Send invoice as email
exports.sendInvoiceEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { pdfBase64, invoiceMonth, invoiceYear } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const invoice = await Invoice.findOne({ _id: id, userId });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const fromEmail = invoice.payee?.email;
    const fromName  = invoice.payee?.name || 'Invoice Sender';
    const toEmail   = invoice.payer?.email;
    const toName    = invoice.payer?.name || 'Client';

    if (!toEmail) {
      return res.status(400).json({ error: 'Payer email is not set on this invoice.' });
    }
    if (!invoiceMonth || !String(invoiceYear || '').trim()) {
      return res.status(400).json({ error: 'Invoice month and year are required.' });
    }

    const monthYear = `${invoiceMonth}-${String(invoiceYear).trim()}`;
    const subject = `Invoice ${monthYear}`;

    // const body = `Dear ${toName},\n\nPlease find the attached invoice for ${monthYear}.\n\nInvoice Number: ${invoice.invoiceNumber || ''}\nAmount Due: ${invoice.currency || ''} ${invoice.total}\n\nKindly review and process the payment at your earliest convenience.\n\nThis is an auto generated email.\n\nBest regards,\n${fromName}`;
    const body = `Hello ${toName},\n\nI've attached your ${monthYear} invoice.\n\nInvoice #: ${invoice.invoiceNumber || 'N/A'}\n\nPlease take a look when you have a moment and let me know if you need anything.\n\n(This is an auto-generated email)\n\nReply directly to this email - I'll get back to you within 24 hours.\n\nBest,\n${fromName}`;

    const filename = `Invoice_${(invoice.invoiceNumber || invoice._id).toString().replace(/\s+/g, '_')}_${monthYear.replace(/\s+/g, '_')}.pdf`;

    await sendInvoiceEmail({
      fromEmail,
      fromName,
      toEmail,
      toName,
      subject,
      body,
      pdfBase64,
      filename,
    });

    res.status(200).json({ message: `Invoice emailed successfully to ${toEmail}` });
  } catch (err) {
    console.error('Error sending invoice email:', err);
    res.status(500).json({ error: err.message || 'Failed to send invoice email' });
  }
};

// Get next invoice number for logged-in user
exports.getNextInvoiceNumber = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const latestInvoice = await Invoice.findOne({ userId })
      .sort({ _id: -1 })
      .select('invoiceNumber');

    const invoiceNumber = computeNextInvoiceNumber(latestInvoice?.invoiceNumber);
    res.status(200).json({ invoiceNumber });
  } catch (err) {
    console.log('Error fetching next invoice number:', err);
    res.status(400).json({ error: err.message });
  }
};

