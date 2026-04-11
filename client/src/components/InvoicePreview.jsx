import React from 'react';
import jsPDF from 'jspdf';
import './InvoicePreview.css';

const InvoicePreview = ({ invoice, onClose, showCloseButton = true }) => {
  const buildInvoicePdf = (invoice) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 20;
    const marginRight = 20;
    const tableWidth = pageWidth - marginLeft - marginRight;
    let y = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', marginLeft, y);
    y += 15;

    // Invoice details box
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Invoice #: ${invoice.invoiceNumber || invoice._id || 'DRAFT'}`, marginLeft, y);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, pageWidth - marginRight - 50, y, { align: 'right' });
    y += 10;

    // Draw line
    doc.setDrawColor(200, 200, 200);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 10;

    // Payee section (FROM)
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('FROM:', marginLeft, y);
    y += 7;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    if (invoice.payee?.name) {
      doc.text(invoice.payee.name, marginLeft, y);
      y += 5;
    }
    if (invoice.payee?.address) {
      const addressLines = doc.splitTextToSize(invoice.payee.address, 80);
      addressLines.forEach(line => {
        doc.text(line, marginLeft, y);
        y += 5;
      });
    }
    if (invoice.payee?.companyId) {
      const companyIdLines = doc.splitTextToSize(invoice.payee.companyId, 80);
      companyIdLines.forEach(line => {
        doc.text(line, marginLeft, y);
        y += 5;
      });
    }
    if (invoice.payee?.email) {
      doc.text(invoice.payee.email, marginLeft, y);
      y += 5;
    }
    y += 5;

    // Payer section (TO)
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('TO:', marginLeft, y);
    y += 7;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    if (invoice.payer?.name) {
      doc.text(invoice.payer.name, marginLeft, y);
      y += 5;
    }
    if (invoice.payer?.address) {
      const addressLines = doc.splitTextToSize(invoice.payer.address, 80);
      addressLines.forEach(line => {
        doc.text(line, marginLeft, y);
        y += 5;
      });
    }
    if (invoice.payer?.companyId) {
      const companyIdLines = doc.splitTextToSize(invoice.payer.companyId, 80);
      companyIdLines.forEach(line => {
        doc.text(line, marginLeft, y);
        y += 5;
      });
    }
    if (invoice.payer?.email) {
      doc.text(invoice.payer.email, marginLeft, y);
      y += 5;
    }
    y += 10;

    // ✅ FIXED: Items table header - CLEAR column separation
    doc.setFillColor(240, 240, 240);
    doc.rect(marginLeft, y - 5, tableWidth, 8, 'F');
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');

    // ✅ FIXED POSITIONS - NO OVERLAP
    const descX = marginLeft + 2;
    const qtyX = marginLeft + tableWidth * 0.58;      // Qty column
    const priceX = marginLeft + tableWidth * 0.78;    // Price column  
    const amountX = pageWidth - marginRight - 12;     // Amount column (extra padding)

    doc.text('Description', descX, y);
    doc.text('Qty', qtyX, y, { align: 'right' });
    doc.text('Price', priceX, y, { align: 'right' });
    doc.text('Amount', amountX, y, { align: 'right' });
    y += 8;

    // ✅ BULLETPROOF number formatter
    const formatHugeNumber = (num, currency) => {
      const numValue = Number(num);
      if (isNaN(numValue) || numValue === 0) return `${currency} 0.00`;
      
      const numStr = String(Math.abs(numValue));
      
      // Abbreviate massive numbers to prevent overflow
      if (numStr.length > 12) {
        const trillion = Math.floor(numValue / 1e12);
        return `${currency} ${trillion}T`;
      } else if (numStr.length > 9) {
        const billion = Math.floor(numValue / 1e9);
        return `${currency} ${billion}B`;
      } else if (numStr.length > 6) {
        const million = Math.floor(numValue / 1e6);
        return `${currency} ${million}M`;
      } else {
        return `${currency} ${numValue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }
    };

    // Items
    doc.setFont(undefined, 'normal');
    invoice.items.forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const currency = invoice.currency || '$';
      const priceStr = formatHugeNumber(item.price, currency);
      const qtyStr = String(Math.floor(item.quantity));
      const amountNum = item.quantity * item.price;
      const amountStr = formatHugeNumber(amountNum, currency);

      const descMaxWidth = tableWidth * 0.52;  // More space for numbers
      const descriptionLines = doc.splitTextToSize(item.description || '', descMaxWidth);

      descriptionLines.forEach((line, lineIdx) => {
        doc.text(line, descX, y);
        if (lineIdx === 0) {
          doc.text(qtyStr, qtyX, y, { align: 'right' });
          doc.text(priceStr, priceX, y, { align: 'right' });
          doc.text(amountStr, amountX, y, { align: 'right' });
        }
        y += 5;
      });
      y += 3;
    });

    // Line before total
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 12; // Extra space

    // ✅ FIXED TOTAL - SEPARATE LINE, LARGER FONT, CLEAR POSITIONING
    doc.setFontSize(16);  // Bigger font
    doc.setFont(undefined, 'bold');
    
    // TOTAL label on Price column position, Amount on Amount column
    doc.text('TOTAL:', priceX - 25, y, { align: 'right' });  // Fixed position
    const totalStr = formatHugeNumber(invoice.total, invoice.currency || '$');
    doc.text(totalStr, amountX, y, { align: 'right' });

    // Bank details section
    const hasBankDetails = invoice.bankDetails && (
      invoice.bankDetails.accountName ||
      invoice.bankDetails.accountNumber ||
      invoice.bankDetails.bankName ||
      invoice.bankDetails.bankAddress ||
      invoice.bankDetails.ifscSwift
    );

    if (hasBankDetails) {
      y += 18;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Bank Details:', marginLeft, y);
      y += 6;
      doc.setFont(undefined, 'normal');

      if (invoice.bankDetails.accountName) {
        doc.text(`Account Name: ${invoice.bankDetails.accountName}`, marginLeft, y);
        y += 5;
      }
      if (invoice.bankDetails.accountNumber) {
        doc.text(`Account Number: ${invoice.bankDetails.accountNumber}`, marginLeft, y);
        y += 5;
      }
      if (invoice.bankDetails.bankName) {
        doc.text(`Bank Name: ${invoice.bankDetails.bankName}`, marginLeft, y);
        y += 5;
      }
      if (invoice.bankDetails.bankAddress) {
        const bankAddressLines = doc.splitTextToSize(`Bank Address: ${invoice.bankDetails.bankAddress}`, tableWidth);
        bankAddressLines.forEach(line => {
          doc.text(line, marginLeft, y);
          y += 5;
        });
      }
      if (invoice.bankDetails.ifscSwift) {
        doc.text(`IFSC / SWIFT: ${invoice.bankDetails.ifscSwift}`, marginLeft, y);
        y += 5;
      }
    }

    // Notes section if present
    if (invoice.notes) {
      y += 18;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Notes:', marginLeft, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      const notesLines = doc.splitTextToSize(invoice.notes, tableWidth);
      notesLines.forEach(line => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, marginLeft, y);
        y += 5;
      });
    }

    return doc;
  };

  const handleDownloadPDF = () => {
    try {
      const doc = buildInvoicePdf(invoice);
      const filename = `invoice_${invoice._id ? invoice._id.slice(-8) : 'draft'}_${Date.now()}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error('PDF download error:', e);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const getPdfDataUri = () => {
    try {
      const doc = buildInvoicePdf(invoice);
      return doc.output('datauristring');
    } catch (e) {
      console.error('PDF preview error:', e);
      return null;
    }
  };

  const pdfUri = getPdfDataUri();

  return (
    <div className="invoice-preview-backdrop" onClick={onClose}>
      <div className="invoice-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="invoice-preview-header">
          <div className="invoice-preview-title">
            <h3>Invoice Preview</h3>
            <span className="invoice-preview-subtitle">
              {invoice.invoiceNumber || (invoice._id ? `#${invoice._id.slice(-8)}` : 'Draft')}
            </span>
          </div>
          {showCloseButton && (
            <button
              type="button"
              className="btn btn--sm btn--outline"
              onClick={onClose}
            >
              ✕ Close
            </button>
          )}
        </div>

        <div className="invoice-preview-body">
          {pdfUri ? (
            <iframe
              title={`Invoice Preview ${invoice._id || 'draft'}`}
              src={pdfUri}
              className="invoice-preview-frame"
            />
          ) : (
            <div className="invoice-preview-error">
              Failed to generate preview. Please try downloading the PDF directly.
            </div>
          )}
        </div>

        <div className="invoice-preview-footer">
          <div className="invoice-preview-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleDownloadPDF}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
