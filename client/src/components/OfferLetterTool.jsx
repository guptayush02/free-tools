import React, { useState } from 'react';
import jsPDF from 'jspdf';
import './OfferLetterTool.css';

const OfferLetterTool = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    companyLogo: null,
    hrEmail: '',
    candidateName: '',
    candidateEmail: '',
    jobTitle: '',
    department: '',
    managerName: '',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    salary: '',
    currency: 'USD',
    workLocation: 'Office',
    workHours: '9 AM - 6 PM, Monday to Friday',
    returnByDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    additionalDetails: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData({ ...formData, companyLogo: file });
      setStatus('✅ Logo uploaded successfully');
      setTimeout(() => setStatus(''), 2000);
    } else {
      setStatus('❌ Please upload a valid image file');
    }
  };

  const handlePreview = async () => {
    if (!formData.candidateName || !formData.jobTitle || !formData.salary) {
      setStatus('❌ Please fill candidate name, job title, and salary');
      return;
    }
    
    setStatus('⏳ Generating preview...');
    const doc = await generatePDF();
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setShowPreview(true);
    setStatus('');
  };

  const formatSalary = (amount) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency || 'USD'
    }).format(num);
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 20;
    const marginRight = 20;
    const marginBottom = 20;
    const maxWidth = pageWidth - marginLeft - marginRight;
    let y = 20;

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace) => {
      if (y + requiredSpace > pageHeight - marginBottom) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    // Company Logo (if uploaded)
    if (formData.companyLogo) {
      try {
        const logoDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(formData.companyLogo);
        });
        
        const logoImg = new Image();
        logoImg.src = logoDataUrl;
        await new Promise((resolve) => {
          logoImg.onload = () => {
            const logoWidth = 30;
            const logoHeight = 30;
            doc.addImage(logoImg, 'PNG', pageWidth - marginRight - logoWidth, y, logoWidth, logoHeight);
            resolve();
          };
        });
      } catch (e) {
        console.warn('Logo failed to load:', e);
      }
    }
    y += 5;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(formData.companyName || 'Your Company', marginLeft, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (formData.companyAddress) {
      doc.text(formData.companyAddress, marginLeft, y);
      y += 6;
    }
    y += 10;

    // Main Header Line
    doc.setDrawColor(0, 0, 0);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 12;

    // Date
    doc.text(`Date: ${new Date().toLocaleDateString()}`, marginLeft, y);
    y += 7;

    // Salutation
    checkPageBreak(15);
    doc.setFontSize(12);
    doc.text(`Dear ${formData.candidateName},`, marginLeft, y);
    y += 10;

    // Offer statement with BOLD job title and company name
    checkPageBreak(25);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Calculate text widths for inline bold
    const text1 = 'We are excited to offer you the position of ';
    const jobTitle = formData.jobTitle || 'Position';
    const text2 = ' at ';
    const companyName = `${formData.companyName}` || 'our company ';
    const text3 = '.';
    const text4 = ' You will be joining our ';
    const department = formData.department || 'N/A';
    const text5 = ' department.';
    
    // Line 1: "We are excited to offer you the position of"
    doc.text(text1, marginLeft, y);
    let xPos = marginLeft + doc.getTextWidth(text1);
    
    // BOLD job title
    doc.setFont('helvetica', 'bold');
    doc.text(jobTitle, xPos, y);
    xPos += doc.getTextWidth(jobTitle);
    
    // Normal "at"
    doc.setFont('helvetica', 'normal');
    doc.text(text2, xPos, y);
    xPos += doc.getTextWidth(text2);
    
    // BOLD company name
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, xPos, y);
    xPos += doc.getTextWidth(companyName);
    
    // Normal period
    doc.setFont('helvetica', 'normal');
    doc.text(text3, xPos, y);

    y += 7;

    // Add department if provided
    if (formData.department) {
      checkPageBreak(10);
      const deptText = `You will be joining our ${formData.department} department.`;
      const deptLines = doc.splitTextToSize(deptText, maxWidth);
      deptLines.forEach(line => {
        doc.text(line, marginLeft, y);
        y += 6;
      });
      y += 5;
    }

    // Position details
    checkPageBreak(50);
    doc.setFont('helvetica', 'bold');
    doc.text('Position Details:', marginLeft, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    
    const details = [
      `Job Title: ${formData.jobTitle}`,
      `Department: ${formData.department || 'N/A'}`, 
      `Reporting to: ${formData.managerName || 'TBD'}`,
      `Start Date: ${new Date(formData.startDate).toLocaleDateString()}`,
      `Location: ${formData.workLocation}`,
      `Work Hours: ${formData.workHours}`
    ];
    
    details.forEach(detail => {
      checkPageBreak(7);
      const detailLines = doc.splitTextToSize(`• ${detail}`, maxWidth - 5);
      detailLines.forEach(line => {
        doc.text(line, marginLeft + 5, y);
        y += 6;
      });
    });
    y += 5;

    // Compensation
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Compensation:', marginLeft, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    
    const salaryText = `• Base Salary: ${formatSalary(formData.salary)} per annum`;
    const salaryLines = doc.splitTextToSize(salaryText, maxWidth - 5);
    salaryLines.forEach(line => {
      checkPageBreak(6);
      doc.text(line, marginLeft + 5, y);
      y += 6;
    });
    y += 7;

    // Additional Details (Custom textarea)
    if (formData.additionalDetails.trim()) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Additional Information:', marginLeft, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const detailsLines = doc.splitTextToSize(formData.additionalDetails, maxWidth - 5);
      detailsLines.forEach(line => {
        checkPageBreak(6);
        doc.text(line, marginLeft + 5, y);
        y += 6;
      });
      y += 10;
    }

    // Next steps
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.text('Next Steps:', marginLeft, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    
    const step1 = `1. Please sign and return this letter by ${new Date(formData.returnByDate).toLocaleDateString()}`;
    const step1Lines = doc.splitTextToSize(step1, maxWidth - 5);
    step1Lines.forEach(line => {
      checkPageBreak(6);
      doc.text(line, marginLeft + 5, y);
      y += 6;
    });
    
    if (formData.hrEmail) {
      const step2 = `2. Contact HR with any questions: ${formData.hrEmail}`;
      const step2Lines = doc.splitTextToSize(step2, maxWidth - 5);
      step2Lines.forEach(line => {
        checkPageBreak(6);
        doc.text(line, marginLeft + 5, y);
        y += 6;
      });
    }
    
    const step3 = `${formData.hrEmail ? '3' : '2'}. Complete onboarding paperwork prior to start date`;
    const step3Lines = doc.splitTextToSize(step3, maxWidth - 5);
    step3Lines.forEach(line => {
      checkPageBreak(6);
      doc.text(line, marginLeft + 5, y);
      y += 6;
    });
    y += 7;

    // Closing
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('We look forward to welcoming you to the team!', marginLeft, y);
    y += 20;

    doc.setFontSize(11);
    doc.text('Sincerely,', marginLeft, y);
    y += 7;
    doc.text('HR Manager', marginLeft, y);
    y += 6;
    doc.text(formData.companyName || 'Your Company', marginLeft, y);

    // Signature line
    // checkPageBreak(30);
    y += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.line(marginLeft, y, marginLeft + 60, y);
    doc.text('Candidate Signature', marginLeft, y + 6);
    doc.line(pageWidth - marginRight - 60, y, pageWidth - marginRight, y);
    doc.text('Date', pageWidth - marginRight - 25, y + 6);

    return doc;
  };

  const downloadPDF = async () => {
    const doc = await generatePDF();
    doc.save(`Offer_Letter_${formData.candidateName || 'Candidate'}_${formData.jobTitle || 'Position'}.pdf`);
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="offer-letter-tool">
      <div className="header-section">
        <h2>📋 Offer Letter Generator</h2>
        <p>Create professional job offer letters in seconds</p>
      </div>

      <div className="offer-form-container">
        <div className="form-grid">
          {/* Company Info */}
          <div className="form-group">
            <label>🏢 Company Name</label>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Your Company Pvt Ltd"
            />
          </div>

          <div className="form-group">
            <label>🏠 Company Address</label>
            <input
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              placeholder="123 Business St, City, State 12345"
            />
          </div>

          {/* Logo Upload */}
          <div className="form-group full-width">
            <label>🏛️ Company Logo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="file-input"
            />
            {formData.companyLogo && (
              <div className="logo-preview">
                <img 
                  src={URL.createObjectURL(formData.companyLogo)} 
                  alt="Logo Preview" 
                  style={{width: '40px', height: '40px', objectFit: 'contain'}}
                />
                <span>✅ Logo selected</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>📧 HR Email</label>
            <input
              name="hrEmail"
              type="email"
              value={formData.hrEmail}
              onChange={handleChange}
              placeholder="hr@yourcompany.com"
            />
          </div>

          {/* Candidate Info */}
          <div className="form-group">
            <label>👤 Candidate Name *</label>
            <input
              name="candidateName"
              value={formData.candidateName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label>📧 Candidate Email</label>
            <input
              name="candidateEmail"
              type="email"
              value={formData.candidateEmail}
              onChange={handleChange}
              placeholder="john.doe@email.com"
            />
          </div>

          {/* Job Details */}
          <div className="form-group">
            <label>💼 Job Title *</label>
            <input
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="Senior Software Engineer"
              required
            />
          </div>

          <div className="form-group">
            <label>🏛️ Department</label>
            <input
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Engineering"
            />
          </div>

          <div className="form-group">
            <label>👨‍💼 Manager Name</label>
            <input
              name="managerName"
              value={formData.managerName}
              onChange={handleChange}
              placeholder="Jane Smith, Engineering Lead"
            />
          </div>

          {/* Compensation */}
          <div className="form-group">
            <label>💰 Annual Salary * (numeric)</label>
            <input
              name="salary"
              type="number"
              value={formData.salary}
              onChange={handleChange}
              placeholder="120000"
              required
            />
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="currency-select"
            >
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
              <option value="INR">₹ INR</option>
            </select>
          </div>

          {/* Dates */}
          <div className="form-group">
            <label>📅 Start Date</label>
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>📤 Return By Date *</label>
            <input
              name="returnByDate"
              type="date"
              value={formData.returnByDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label>📍 Work Location</label>
            <input
              name="workLocation"
              value={formData.workLocation}
              onChange={handleChange}
              placeholder="Office, Remote, or Hybrid"
            />
          </div>

          <div className="form-group full-width">
            <label>⏰ Work Hours</label>
            <input
              name="workHours"
              value={formData.workHours}
              onChange={handleChange}
              placeholder="9 AM - 6 PM, Monday to Friday"
            />
          </div>

          {/* Additional Details */}
          <div className="form-group full-width">
            <label>✍️ Additional Details (Optional)</label>
            <textarea
              name="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleChange}
              rows="4"
              placeholder="Add any special terms, probation period, notice period, or other details..."
              className="textarea-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={handlePreview} type="button">
            👁️ Preview & Download
          </button>
        </div>

        {status && <div className={`status ${status.includes('❌') ? 'error' : 'success'}`}>{status}</div>}
      </div>

      {showPreview && previewUrl && (
        <div className="pdf-preview" onClick={() => setShowPreview(false)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={previewUrl}
              className="pdf-frame"
              title="Offer Letter Preview"
            />
            <div className="preview-actions">
              <button className="btn btn-primary" onClick={downloadPDF}>
                💾 Download PDF
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPreview(false)}>
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferLetterTool;
