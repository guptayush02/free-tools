import React, { useState, useEffect } from 'react';
import './InvoiceTool.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import InvoiceList from './InvoiceList';
import InvoicePreview from './InvoicePreview';
import CompanyAutocomplete from './CompanyAutocomplete';

const InvoiceTool = () => {
  const [view, setView] = useState('create'); // 'create' or 'list'
  const [invoice, setInvoice] = useState({
    invoiceNumber: '',
    payer: { name: '', address: '', email: '', companyId: '' },
    payee: { name: '', address: '', email: '', companyId: '' },
    bankDetails: { accountName: '', accountNumber: '', bankName: '', bankAddress: '', ifscSwift: '' },
    items: [{ description: '', quantity: 1, price: 0 }],
    date: new Date().toISOString().split('T')[0],
    total: 0,
    currency: 'USD'
  });
  // Prefill state for repeat invoice
  const [prefill, setPrefill] = useState({ payer: null, payee: null });
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [status, setStatus] = useState('');
  const [showPreview, setShowPreview] = useState(false); // ✅ NEW: Preview state
  const [previewInvoice, setPreviewInvoice] = useState(null); // ✅ NEW: Preview data
  const isEditing = Boolean(editingInvoiceId);

  const fetchNextInvoiceNumber = async () => {
    try {
      const res = await fetch('/api/invoices/next-number', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok && data.invoiceNumber) {
        return data.invoiceNumber;
      }
      return '';
    } catch {
      return '';
    }
  };

  useEffect(() => {
    const loadNextInvoiceNumber = async () => {
      const nextNumber = await fetchNextInvoiceNumber();
      if (nextNumber) {
        setInvoice(prev => ({ ...prev, invoiceNumber: nextNumber }));
      }
    };

    loadNextInvoiceNumber();
  }, []);

  const handleChange = (e, section = null) => {
    if (section) {
      setInvoice({ ...invoice, [section]: { ...invoice[section], [e.target.name]: e.target.value } });
    } else {
      setInvoice({ ...invoice, [e.target.name]: e.target.value });
    }
  };

  const handleEditInvoice = (existingInvoice) => {
    setInvoice({
      invoiceNumber: existingInvoice.invoiceNumber || '',
      payer: {
        name: existingInvoice.payer?.name || '',
        address: existingInvoice.payer?.address || '',
        email: existingInvoice.payer?.email || '',
        companyId: existingInvoice.payer?.companyId || ''
      },
      payee: {
        name: existingInvoice.payee?.name || '',
        address: existingInvoice.payee?.address || '',
        email: existingInvoice.payee?.email || '',
        companyId: existingInvoice.payee?.companyId || ''
      },
      bankDetails: {
        accountName: existingInvoice.bankDetails?.accountName || '',
        accountNumber: existingInvoice.bankDetails?.accountNumber || '',
        bankName: existingInvoice.bankDetails?.bankName || '',
        bankAddress: existingInvoice.bankDetails?.bankAddress || '',
        ifscSwift: existingInvoice.bankDetails?.ifscSwift || ''
      },
      items: (existingInvoice.items || []).length > 0
        ? existingInvoice.items
        : [{ description: '', quantity: 1, price: 0 }],
      date: existingInvoice.date
        ? new Date(existingInvoice.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      total: existingInvoice.total || 0,
      currency: existingInvoice.currency || 'USD'
    });
    setEditingInvoiceId(existingInvoice._id);
    setStatus('');
    setView('create');
  };

  // Handle autocomplete selection
  const handleCompanySelect = (company, section) => {
    const updatedInvoice = {
      ...invoice,
      [section]: {
        name: company.name,
        address: company.address || '',
        email: company.email || '',
        companyId: company.companyId || ''
      }
    };

    // If user selects an existing payee with stored bank details, prefill them
    if (section === 'payee' && company.bankDetails) {
      updatedInvoice.bankDetails = {
        accountName: company.bankDetails.accountName || '',
        accountNumber: company.bankDetails.accountNumber || '',
        bankName: company.bankDetails.bankName || '',
        bankAddress: company.bankDetails.bankAddress || '',
        ifscSwift: company.bankDetails.ifscSwift || ''
      };
    }

    setInvoice(updatedInvoice);
  };

  // Prefill for repeat invoice
  const handlePrefill = (type) => {
    if (prefill[type]) {
      setInvoice({ ...invoice, [type]: { ...prefill[type] } });
    }
  };

  const handleItemChange = (idx, e) => {
    const value = e.target.value;
    const fieldName = e.target.name;
    const items = invoice.items.map((item, i) => {
      if (i === idx) {
        if (fieldName === 'description') {
          return { ...item, [fieldName]: value };
        } else {
          return { ...item, [fieldName]: parseFloat(value) || 0 };
        }
      }
      return item;
    });
    setInvoice({ ...invoice, items });
  };

  const addItem = () => {
    setInvoice({ ...invoice, items: [...invoice.items, { description: '', quantity: 1, price: 0 }] });
  };

  const removeItem = (idx) => {
    if (invoice.items.length > 1) {
      setInvoice({ ...invoice, items: invoice.items.filter((_, i) => i !== idx) });
    }
  };

  const calculateTotal = () => {
    return invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  // Auto-calculate total when items change
  useEffect(() => {
    setInvoice(prev => ({ ...prev, total: calculateTotal() }));
  }, [invoice.items]);

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹',
      'JPY': '¥', 'AUD': 'A$', 'CAD': 'C$', 'CHF': 'Fr',
      'CNY': '¥', 'SGD': 'S$'
    };
    return symbols[currency] || '$';
  };

  // ✅ NEW: Handle Preview (before saving)
  const handlePreview = () => {
    const total = calculateTotal();
    const previewData = { ...invoice, total };
    setPreviewInvoice(previewData);
    setShowPreview(true);
  };

  const handleReset = async () => {
    const nextNumber = await fetchNextInvoiceNumber();
    setInvoice({
      invoiceNumber: nextNumber,
      payer: { name: '', address: '', email: '', companyId: '' },
      payee: { name: '', address: '', email: '', companyId: '' },
      bankDetails: { accountName: '', accountNumber: '', bankName: '', bankAddress: '', ifscSwift: '' },
      items: [{ description: '', quantity: 1, price: 0 }],
      date: new Date().toISOString().split('T')[0],
      total: 0,
      currency: 'USD'
    });
    setEditingInvoiceId(null);
    setStatus('');
    setPrefill({ payer: null, payee: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = calculateTotal();
    try {
      const endpoint = isEditing ? `/api/invoices/${editingInvoiceId}` : '/api/invoices';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...invoice, total })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(isEditing ? '✅ Invoice updated successfully!' : '✅ Invoice saved successfully!');
        setPreviewInvoice(data.invoice); // Show saved invoice in preview
        setShowPreview(true); // Auto-open preview after save

        if (!isEditing) {
          const nextNumber = await fetchNextInvoiceNumber();
          if (nextNumber) {
            setInvoice(prev => ({ ...prev, invoiceNumber: nextNumber }));
          }
        }
      } else {
        setStatus(`❌ ${data.error || 'Error saving invoice'}`);
      }
    } catch {
      setStatus('❌ Network error. Please try again.');
    }
  };

  if (view === 'list') {
    return (
      <div className="invoice-tool">
        <div className="invoice-nav">
          <button className="nav-btn nav-btn-secondary" onClick={() => setView('create')}>
            ← Create New Invoice
          </button>
        </div>
        <InvoiceList onEditInvoice={handleEditInvoice} />
      </div>
    );
  }

  return (
    <div className="invoice-tool">
      <div className="invoice-header">
        <div className="header-content">
          <h1 className="header-title">📄 {isEditing ? 'Edit Invoice' : 'Invoice Generator'}</h1>
          <p className="header-subtitle">{isEditing ? 'Update your invoice details' : 'Create professional invoices in seconds'}</p>
        </div>
        <button className="nav-btn nav-btn-primary" onClick={() => setView('list')}>
          📋 View All Invoices
        </button>
      </div>

      <div className="invoice-container">
        {/* Form Section */}
        <div className="card form-card">
          <form onSubmit={handleSubmit} className="invoice-form">
            {/* Currency & Date Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">🧾 Invoice Number</label>
                <input
                  name="invoiceNumber"
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="INV-1001"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">💰 Currency</label>
                <select 
                  name="currency" 
                  value={invoice.currency} 
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                  <option value="INR">₹ INR</option>
                  <option value="JPY">¥ JPY</option>
                  <option value="AUD">A$ AUD</option>
                  <option value="CAD">C$ CAD</option>
                  <option value="CHF">Fr CHF</option>
                  <option value="CNY">¥ CNY</option>
                  <option value="SGD">S$ SGD</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">📅 Date</label>
                <input 
                  name="date" 
                  type="date" 
                  value={invoice.date} 
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Bank Details */}
            <div className="company-section">
              <h3 className="section-title">🏦 Bank Account Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <input
                    name="accountName"
                    placeholder="Account Name"
                    value={invoice.bankDetails.accountName}
                    onChange={e => handleChange(e, 'bankDetails')}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    name="accountNumber"
                    placeholder="Account Number"
                    value={invoice.bankDetails.accountNumber}
                    onChange={e => handleChange(e, 'bankDetails')}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input
                    name="bankName"
                    placeholder="Bank Name"
                    value={invoice.bankDetails.bankName}
                    onChange={e => handleChange(e, 'bankDetails')}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    name="bankAddress"
                    placeholder="Bank Address"
                    value={invoice.bankDetails.bankAddress}
                    onChange={e => handleChange(e, 'bankDetails')}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input
                    name="ifscSwift"
                    placeholder="IFSC / SWIFT Code"
                    value={invoice.bankDetails.ifscSwift}
                    onChange={e => handleChange(e, 'bankDetails')}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Company Sections */}
            <div className="company-grid">
              <div className="company-section">
                <h3 className="section-title">🏢 From (Payee)</h3>
                <CompanyAutocomplete
                  value={invoice.payee}
                  onSelect={handleCompanySelect}
                  placeholder="Your Company Name *"
                  section="payee"
                />
                <input 
                  name="address" 
                  placeholder="Your Address *" 
                  value={invoice.payee.address} 
                  onChange={e => handleChange(e, 'payee')}
                  className="form-input"
                  required 
                />
                <input 
                  name="email" 
                  type="email"
                  placeholder="your@email.com *" 
                  value={invoice.payee.email} 
                  onChange={e => handleChange(e, 'payee')}
                  className="form-input"
                  required 
                />
                <input 
                  name="companyId" 
                  placeholder="Payee Company ID (optional)" 
                  value={invoice.payee.companyId} 
                  onChange={e => handleChange(e, 'payee')}
                  className="form-input"
                />
                {prefill.payee && (
                  <button type="button" className="prefill-btn" onClick={() => handlePrefill('payee')}>Prefill Payee</button>
                )}
              </div>

              <div className="company-section">
                <h3 className="section-title">👤 Bill To (Payer)</h3>
                <CompanyAutocomplete
                  value={invoice.payer}
                  onSelect={handleCompanySelect}
                  placeholder="Client Company Name *"
                  section="payer"
                />
                <input 
                  name="address" 
                  placeholder="Client Address *" 
                  value={invoice.payer.address} 
                  onChange={e => handleChange(e, 'payer')}
                  className="form-input"
                  required 
                />
                <input 
                    name="email" 
                    type="email"
                    placeholder="client@email.com" 
                    value={invoice.payer.email} 
                    onChange={e => handleChange(e, 'payer')}  // ← Fixed!
                    className="form-input"
                    required 
                />
                <input 
                  name="companyId" 
                  placeholder="Payer Company ID (optional)" 
                  value={invoice.payer.companyId} 
                  onChange={e => handleChange(e, 'payer')}
                  className="form-input"
                />
                {prefill.payer && (
                  <button type="button" className="prefill-btn" onClick={() => handlePrefill('payer')}>Prefill Payer</button>
                )}
              </div>
            </div>

            {/* Items Section */}
            <div className="items-section">
              <div className="items-header">
                <h3 className="section-title">📦 Items</h3>
                <button type="button" onClick={addItem} className="add-item-btn">
                  + Add Item
                </button>
              </div>
              
              <div className="items-container">
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="item-card">
                    <div className="item-number">{idx + 1}</div>
                    <div className="item-fields">
                      <input 
                        name="description" 
                        placeholder="Item description *" 
                        value={item.description} 
                        onChange={e => handleItemChange(idx, e)}
                        className="form-input item-description"
                        required
                      />
                      <input 
                        name="quantity" 
                        type="number" 
                        min="1" 
                        placeholder="Qty"
                        value={item.quantity} 
                        onChange={e => handleItemChange(idx, e)}
                        className="form-input item-quantity"
                        required
                      />
                      <input 
                        name="price" 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="Price"
                        value={item.price} 
                        onChange={e => handleItemChange(idx, e)}
                        className="form-input item-price"
                        required
                      />
                      <div className="item-total">
                        {getCurrencySymbol(invoice.currency)}{(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                    {invoice.items.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeItem(idx)}
                        className="remove-item-btn"
                        title="Remove item"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total & Action Buttons */}
            <div className="total-section">
              <div className="total-label">Grand Total:</div>
              <div className="total-amount">
                {getCurrencySymbol(invoice.currency)}{invoice.total.toFixed(2)}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn--secondary btn--lg" 
                onClick={handleReset}
              >
                {isEditing ? '✖ Cancel Edit' : '🔄 Reset Form'}
              </button>
              <button type="submit" className="btn btn--primary btn--lg">
                {isEditing ? '💾 Update Invoice' : '💾 Save Invoice'}
              </button>
            </div>
          </form>

          {status && (
            <div className={`status ${status.includes('✅') ? 'status-success' : 'status-error'}`}>
              {status}
            </div>
          )}
        </div>
      </div>

      {/* ✅ NEW: Unified Invoice Preview Modal */}
      {showPreview && previewInvoice && (
        <InvoicePreview
          invoice={previewInvoice}
          onClose={() => {
            setShowPreview(false);
            setPreviewInvoice(null);
          }}
        />
      )}
    </div>
  );
};

export default InvoiceTool;

