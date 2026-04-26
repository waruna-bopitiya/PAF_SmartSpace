import React, { useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * ResourceQRPrint
 * Props:
 *   resource  – { id, name, type, location, capacity, status }
 *   onClose   – callback to close the modal
 */
const ResourceQRPrint = ({ resource, onClose }) => {
  const printRef = useRef(null);

  // The URL a student will land on after scanning
  const ticketUrl = `${window.location.origin}/tickets?resourceId=${resource.id}&resourceName=${encodeURIComponent(resource.name)}`;

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Restore React app after print
  };

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="qr-modal-header">
          <h2>🖨️ Print QR Code</h2>
          <button className="qr-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Printable area */}
        <div className="qr-modal-body">
          <div ref={printRef} className="qr-print-area">
            <div className="qr-print-card">
              {/* Campus branding */}
              <div className="qr-brand-header">
                <div className="qr-brand-logo">🏫</div>
                <div className="qr-brand-text">
                  <div className="qr-brand-name">SmartSpace Campus</div>
                  <div className="qr-brand-sub">Resource Ticket System</div>
                </div>
              </div>

              {/* Resource Info */}
              <div className="qr-resource-info">
                <h3 className="qr-resource-name">{resource.name}</h3>
                <div className="qr-resource-meta">
                  {resource.type && <span className="qr-tag">📋 {resource.type}</span>}
                  {resource.location && <span className="qr-tag">📍 {resource.location}</span>}
                  {resource.capacity && <span className="qr-tag">👥 Capacity: {resource.capacity}</span>}
                </div>
              </div>

              {/* QR Code */}
              <div className="qr-code-wrapper">
                <QRCodeSVG
                  value={ticketUrl}
                  size={220}
                  level="H"
                  includeMargin={true}
                  style={{ borderRadius: '8px' }}
                />
              </div>

              {/* Instructions */}
              <div className="qr-instructions">
                <p className="qr-instruction-title">📱 How to report an issue:</p>
                <ol className="qr-steps">
                  <li>Scan this QR code with your phone</li>
                  <li>Log in to your campus account</li>
                  <li>Fill in the issue details &amp; submit</li>
                </ol>
              </div>

              {/* URL fallback */}
              <div className="qr-url-fallback">
                <span className="qr-url-label">Or visit:</span>
                <span className="qr-url-text">{ticketUrl}</span>
              </div>

              {/* Footer */}
              <div className="qr-print-footer">
                Resource ID: {resource.id?.substring(0, 12)}...
              </div>
            </div>
          </div>

          {/* Preview label */}
          <p className="qr-preview-label">Preview of the printable QR code poster</p>
        </div>

        {/* Modal footer with actions */}
        <div className="qr-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn qr-print-btn" onClick={handlePrint}>
            🖨️ Print QR Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceQRPrint;
