// import React, { useEffect, useState } from 'react';
// import jsPDF from 'jspdf';
// import './InvoiceTool.css';

// const InvoiceList = () => {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchInvoices = async () => {
//       try {
//         const res = await fetch('/api/invoices/my', {
//           headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//         });
//         const data = await res.json();
//         if (res.ok) {
//           setInvoices(data.invoices);
//         } else {
//           setError(data.error || 'Failed to fetch invoices');
//         }
//       } catch {
//         setError('Failed to fetch invoices');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchInvoices();
//   }, []);

//   const handleDownloadPDF = (invoice) => {
//     const doc = new jsPDF();
//     doc.setFontSize(16);
//     doc.text('Invoice', 20, 20);
//     doc.setFontSize(12);
//     doc.text(`Invoice Code: ${invoice._id}`, 20, 30);
//     doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 20, 40);
//     doc.text('Payee:', 20, 50);
//     doc.text(`Name: ${invoice.payee?.name || ''}`, 30, 60);
//     doc.text(`Address: ${invoice.payee?.address || ''}`, 30, 70);
//     doc.text(`Email: ${invoice.payee?.email || ''}`, 30, 80);
//     doc.text('Payer:', 20, 90);
//     doc.text(`Name: ${invoice.payer?.name || ''}`, 30, 100);
//     doc.text(`Address: ${invoice.payer?.address || ''}`, 30, 110);
//     doc.text(`Email: ${invoice.payer?.email || ''}`, 30, 120);
//     doc.text('Items:', 20, 130);
//     let y = 140;
//     invoice.items.forEach((item, idx) => {
//       doc.text(`${idx + 1}. ${item.description} | Qty: ${item.quantity} | Price: $${item.price}`, 30, y);
//       y += 10;
//     });
//     doc.text(`Total: $${invoice.total}`, 20, y + 10);
//     doc.save(`invoice_${invoice._id || 'code'}.pdf`);
//   };

//   if (loading) return <div>Loading invoices...</div>;
//   if (error) return <div className="status">{error}</div>;

//   return (
//     <div className="invoice-list">
//       <h2>Your Invoices</h2>
//       {invoices.length === 0 ? (
//         <div>No invoices found.</div>
//       ) : (
//         <div className="invoice-list-table">
//           <div className="invoice-list-header">
//             <span>Invoice Code</span>
//             <span>Date</span>
//             <span>Payee</span>
//             <span>Payer</span>
//             <span>Total</span>
//             <span>Download</span>
//           </div>
//           {invoices.map(inv => (
//             <div key={inv._id} className="invoice-list-row">
//               <span>{inv._id}</span>
//               <span>{new Date(inv.date).toLocaleDateString()}</span>
//               <span>{inv.payee?.name}</span>
//               <span>{inv.payer?.name}</span>
//               <span>${inv.total}</span>
//               <button className="download-btn" onClick={() => handleDownloadPDF(inv)}>PDF</button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default InvoiceList;


// import React, { useEffect, useState } from 'react';
// import jsPDF from 'jspdf';
// import './InvoiceTool.css';

// const InvoiceList = () => {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [previewUrl, setPreviewUrl] = useState('');
//   const [previewInvoice, setPreviewInvoice] = useState(null);

//   useEffect(() => {
//     const fetchInvoices = async () => {
//       try {
//         const res = await fetch('/api/invoices/my', {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });
//         const data = await res.json();
//         if (res.ok) {
//           setInvoices(data.invoices || []);
//         } else {
//           setError(data.error || 'Failed to fetch invoices');
//         }
//       } catch (e) {
//         console.error(e);
//         setError('Failed to fetch invoices');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchInvoices();
//   }, []);

//   const buildInvoicePdf = (invoice) => {
//     // A4 portrait, mm units
//     const doc = new jsPDF('p', 'mm', 'a4');
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const marginLeft = 20;
//     let y = 20;

//     doc.setFontSize(18);
//     doc.text('Invoice', marginLeft, y);
//     y += 10;

//     doc.setFontSize(11);
//     doc.text(`Invoice Code: ${invoice._id}`, marginLeft, y);
//     y += 7;
//     doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, marginLeft, y);
//     y += 12;

//     // Payee / Payer blocks
//     doc.setFontSize(12);
//     doc.text('Payee:', marginLeft, y);
//     y += 6;
//     doc.setFontSize(10);
//     doc.text(`Name: ${invoice.payee?.name || ''}`, marginLeft + 5, y);
//     y += 5;
//     doc.text(`Address: ${invoice.payee?.address || ''}`, marginLeft + 5, y);
//     y += 5;
//     doc.text(`Email: ${invoice.payee?.email || ''}`, marginLeft + 5, y);
//     y += 8;

//     doc.setFontSize(12);
//     doc.text('Payer:', marginLeft, y);
//     y += 6;
//     doc.setFontSize(10);
//     doc.text(`Name: ${invoice.payer?.name || ''}`, marginLeft + 5, y);
//     y += 5;
//     doc.text(`Address: ${invoice.payer?.address || ''}`, marginLeft + 5, y);
//     y += 5;
//     doc.text(`Email: ${invoice.payer?.email || ''}`, marginLeft + 5, y);
//     y += 10;

//     // Items header
//     doc.setFontSize(12);
//     doc.text('Items:', marginLeft, y);
//     y += 8;
//     doc.setFontSize(10);

//     const maxLineWidth = pageWidth - marginLeft * 2;
//     const lineHeight = 5;

//     invoice.items.forEach((item, idx) => {
//       const line = `${idx + 1}. ${item.description} | Qty: ${item.quantity} | Price: $${item.price}`;
//       const split = doc.splitTextToSize(line, maxLineWidth);

//       // Add new page if close to bottom
//       split.forEach((txtLine) => {
//         if (y > 280) {
//           doc.addPage();
//           y = 20;
//         }
//         doc.text(txtLine, marginLeft, y);
//         y += lineHeight;
//       });
//       y += 2;
//     });

//     if (y > 280) {
//       doc.addPage();
//       y = 20;
//     }

//     doc.setFontSize(12);
//     doc.text(`Total: $${invoice.total}`, marginLeft, y + 6);

//     return doc;
//   };

//   const handleDownloadPDF = (invoice) => {
//     try {
//       const doc = buildInvoicePdf(invoice);
//       doc.save(`invoice_${invoice._id || 'code'}.pdf`);
//     } catch (e) {
//       console.error('PDF download error:', e);
//       alert('Failed to generate PDF. Please try again.');
//     }
//   };

//   const handlePreviewPDF = (invoice) => {
//     try {
//       const doc = buildInvoicePdf(invoice);
//       const pdfDataUri = doc.output('datauristring');
//       setPreviewUrl(pdfDataUri);
//       setPreviewInvoice(invoice);
//     } catch (e) {
//       console.error('PDF preview error:', e);
//       alert('Failed to generate preview. Please try again.');
//     }
//   };

//   const closePreview = () => {
//     setPreviewUrl('');
//     setPreviewInvoice(null);
//   };

//   if (loading) return <div className="invoice-status">Loading invoices...</div>;
//   if (error) return <div className="invoice-status error">{error}</div>;

//   return (
//     <div className="invoice-list-container">
//       <div className="invoice-list-headerbar">
//         <h2>Your Invoices</h2>
//         <span className="invoice-count">{invoices.length} invoice(s)</span>
//       </div>

//       {invoices.length === 0 ? (
//         <div className="invoice-empty-state">No invoices found.</div>
//       ) : (
//         <div className="invoice-list-table card">
//           <div className="invoice-list-header-row">
//             <span>Invoice Code</span>
//             <span>Date</span>
//             <span>Payee</span>
//             <span>Payer</span>
//             <span className="align-right">Total</span>
//             <span className="actions-col">Actions</span>
//           </div>
//           {invoices.map((inv) => (
//             <div key={inv._id} className="invoice-list-row">
//               <span className="code-cell">{inv._id}</span>
//               <span>{new Date(inv.date).toLocaleDateString()}</span>
//               <span>{inv.payee?.name || '-'}</span>
//               <span>{inv.payer?.name || '-'}</span>
//               <span className="align-right">${inv.total}</span>
//               <span className="actions-cell">
//                 <button
//                   type="button"
//                   className="btn btn--sm btn--secondary"
//                   onClick={() => handlePreviewPDF(inv)}
//                 >
//                   Preview
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn--sm btn--primary"
//                   onClick={() => handleDownloadPDF(inv)}
//                 >
//                   Download
//                 </button>
//               </span>
//             </div>
//           ))}
//         </div>
//       )}

//       {previewUrl && (
//         <div className="invoice-preview-backdrop" onClick={closePreview}>
//           <div
//             className="invoice-preview-modal"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="invoice-preview-header">
//               <h3>Invoice Preview</h3>
//               <button
//                 type="button"
//                 className="btn btn--sm btn--outline"
//                 onClick={closePreview}
//               >
//                 Close
//               </button>
//             </div>
//             <div className="invoice-preview-body">
//               <iframe
//                 title={`Invoice Preview ${previewInvoice?._id || ''}`}
//                 src={previewUrl}
//                 className="invoice-preview-frame"
//               />
//             </div>
//             <div className="invoice-preview-footer">
//               <button
//                 type="button"
//                 className="btn btn--primary btn--full-width"
//                 onClick={() => handleDownloadPDF(previewInvoice)}
//               >
//                 Download PDF
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default InvoiceList;

import React, { useEffect, useState } from 'react';
import InvoicePreview from './InvoicePreview';
import './InvoiceTool.css';

const InvoiceList = () => {
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
                <span className="code-cell">{inv._id}</span>
                <span>{new Date(inv.date).toLocaleDateString()}</span>
                <span>{inv.payee?.name || '-'}</span>
                <span>{inv.payer?.name || '-'}</span>
                <span className="align-right">${inv.total}</span>
                <span className="actions-cell">
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
