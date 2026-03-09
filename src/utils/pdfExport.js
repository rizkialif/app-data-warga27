import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

/**
 * Global utility to export data to PDF
 * @param {Object} options Configuration for PDF export
 * @param {string} options.filename Name of the downloaded file (e.g. 'Data_Warga.pdf')
 * @param {string} options.title Main document title
 * @param {string} [options.subtitle] Optional subtitle or printed date
 * @param {string} [options.orientation='p'] 'p' for Portrait, 'l' for Landscape
 * @param {Array<string>} options.headers Array of column headers
 * @param {Array<Array<any>>} options.data 2D Array of table rows
 * @param {Object} [options.customHeader] Options for custom multi-line headers (e.g. Zakat letterhead)
 * @param {string} options.customHeader.title1 First line of custom header
 * @param {string} options.customHeader.title2 Second line of custom header 
 * @param {string} options.customHeader.title3 Third line of custom header
 * @param {string} [options.footerText] Footer text applied to all pages
 * @param {Array<Object>} [options.signatures] Signatures array { role, name, position: 'left'|'right' }
 * @param {string} [options.signatureLocation] Location string above signatures (e.g. 'Bekasi, 14 Maret 2026')
 */
export const exportDataToPDF = ({
  filename = 'export.pdf',
  title = 'Document',
  subtitle,
  orientation = 'p',
  headers = [],
  data = [],
  customHeader = null,
  footerText = null,
  signatures = [],
  signatureLocation = ''
}) => {
  const doc = new jsPDF(orientation, 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  let startY = 15;

  // Render Header
  if (customHeader) {
    // Custom Zakat Style Header (Centered)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    if (customHeader.title1) doc.text(customHeader.title1, pageWidth / 2, startY, { align: 'center' });
    
    startY += 7;
    doc.setFontSize(12);
    if (customHeader.title2) doc.text(customHeader.title2, pageWidth / 2, startY, { align: 'center' });
    
    startY += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (customHeader.title3) doc.text(customHeader.title3, pageWidth / 2, startY, { align: 'center' });
    
    // Header divider line
    startY += 4;
    doc.setLineWidth(0.5);
    doc.line(14, startY, pageWidth - 14, startY);
    startY += 6; // Move to table start
  } else {
    // Standard Header (Left Aligned)
    doc.setFontSize(18);
    doc.text(title, 14, startY);
    if (subtitle) {
      startY += 7;
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(subtitle, 14, startY);
      doc.setTextColor(0); // reset
    }
    startY += 8; // Move to table start
  }

  // Render Table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: startY,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { 
      // Use different styles if custom header exists (zakat style) vs normal grid
      fillColor: customHeader ? false : [22, 119, 255], 
      fontStyle: 'bold', 
      textColor: customHeader ? 0 : 255, 
      lineWidth: 0.1, 
      lineColor: [200, 200, 200] 
    },
    margin: { bottom: signatures && signatures.length > 0 ? 40 : 15 }
  });

  // Handle Signatures
  if (signatures && signatures.length > 0) {
    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Check if we need a new page for signatures
    if (finalY > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      doc.setPage(doc.internal.getNumberOfPages());
    }

    const currentFinalY = doc.lastAutoTable.finalY > doc.internal.pageSize.getHeight() - 40 ? 20 : finalY;

    // Date/Location on the right
    if (signatureLocation) {
      doc.setFontSize(10);
      doc.text(signatureLocation, pageWidth - 14, currentFinalY, { align: 'right' });
    }
    
    // Signature roles
    const leftX = 30;
    const rightX = pageWidth - 30;

    signatures.forEach(sig => {
      const xPos = sig.position === 'left' ? leftX : rightX;
      doc.setFont("helvetica", "normal");
      doc.text(sig.role, xPos, currentFinalY + 10, { align: 'center' });
      
      doc.setFont("helvetica", "bold");
      doc.text(sig.name, xPos, currentFinalY + 30, { align: 'center' });
      doc.setFont("helvetica", "normal"); // reset
    });
  }

  // Handle Page Footers
  if (footerText) {
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(footerText, 14, doc.internal.pageSize.getHeight() - 10);
    }
  }

  doc.save(filename);
};
