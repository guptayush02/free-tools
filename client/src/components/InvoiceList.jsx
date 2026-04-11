import React, { useEffect, useState } from 'react';
import InvoicePreview from './InvoicePreview';
import './InvoiceTool.css';

const InvoiceList = ({ onEditInvoice }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices/my', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (res.ok) {
          setInvoices(data.invoices || []);
        } else {
          setError(data.error || 'Failed to fetch invoices');
        }
      } catch (e) {
        console.error(e);
        setError('Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (loading) return <div className="invoice-status">Loading invoices...</div>;
  if (error) return <div className="invoice-status error">{error}</div>;

  return (
    <>
      <div className="invoice-list-container">
        <div className="invoice-list-headerbar">
          <h2>Your Invoices</h2>
          <span className="invoice-count">{invoices.length} invoice(s)</span>
        </div>

        {invoices.length === 0 ? (
          <div className="invoice-empty-state">No invoices found.</div>
        ) : (
          <div className="invoice-list-table card">
            <div className="invoice-list-header-row">
              <span>Invoice Code</span>
              <span>Date</span>
              <span>Payee</span>
              <span>Payer</span>
              <span className="align-right">Total</span>
              <span className="actions-col">Actions</span>
            </div>
            {invoices.map((inv) => (
              <div key={inv._id} className="invoice-list-row">
                <span className="code-cell">{inv.invoiceNumber || inv._id}</span>
                <span>{new Date(inv.date).toLocaleDateString()}</span>
                <span>{inv.payee?.name || '-'}</span>
                <span>{inv.payer?.name || '-'}</span>
                <span className="align-right">{inv.currency || '-'} {inv.total}</span>
                <span className="actions-cell">
                  <button
                    type="button"
                    className="btn btn--sm btn--secondary"
                    onClick={() => onEditInvoice?.(inv)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn--sm btn--outline"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    View
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedInvoice && (
        <InvoicePreview
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
};

export default InvoiceList;
