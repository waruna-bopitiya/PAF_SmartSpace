import React, { useState, useContext, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import AuthContext from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import '../styles/QRVerification.css';

const QRVerification = () => {
  const { user } = useContext(AuthContext);
  const [qrInput, setQrInput] = useState('');
  const [verifiedBooking, setVerifiedBooking] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [lastScannedQR, setLastScannedQR] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    // Load verification history from localStorage
    const savedHistory = localStorage.getItem('qrVerificationHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start camera feed
  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use rear camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        scanQRCode();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
      setUseCamera(false);
    }
  };

  // Stop camera feed
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    setCameraActive(false);
  };

  // Scan QR code from camera
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Draw video frame to canvas
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Decode QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (code && code.data !== lastScannedQR) {
      // New QR code detected
      setLastScannedQR(code.data);
      setQrInput(code.data);
      console.log('QR Code scanned:', code.data);
      
      // Auto-verify the scanned QR code
      handleVerifyQR(null, code.data);
      
      // Stop camera after successful scan
      stopCamera();
      setUseCamera(false);
    }

    // Continue scanning
    if (cameraActive) {
      animationIdRef.current = requestAnimationFrame(scanQRCode);
    }
  };

  const handleVerifyQR = async (e, scannedData = null) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setVerifiedBooking(null);

    const dataToVerify = scannedData || qrInput.trim();
    
    if (!dataToVerify) {
      setError('Please enter or scan a QR code');
      return;
    }

    setLoading(true);
    try {
      // Extract booking ID from QR data if it's in the format BOOKING_VERIFY|bookingId|resourceId|userId
      const response = await bookingAPI.verifyQRCode(dataToVerify);
      
      if (response.data && response.data.booking) {
        setVerifiedBooking(response.data.booking);
        setSuccess(response.data.message || 'Booking verified successfully!');
        if (!scannedData) {
          setQrInput('');
        }

        // Add to history
        const newHistory = [{
          bookingId: response.data.booking.id,
          resourceId: response.data.booking.resourceId,
          userId: response.data.booking.userId,
          verificationTime: new Date().toLocaleString(),
          verified: response.data.verified,
        }, ...history].slice(0, 10); // Keep last 10 verifications
        setHistory(newHistory);
        localStorage.setItem('qrVerificationHistory', JSON.stringify(newHistory));
      }
    } catch (err) {
      console.error('Error verifying QR code:', err);
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      'Failed to verify QR code. Please try again.';
      setError(typeof errorMsg === 'string' ? errorMsg : 'Invalid QR code format');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the verification history?')) {
      setHistory([]);
      localStorage.removeItem('qrVerificationHistory');
      setSuccess('History cleared');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="qr-verification-container">
      <div className="qr-verification-header">
        <h1>🔍 Verify Booking QR Code</h1>
        <p>Scan or paste a QR code to verify a booking</p>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* QR Input Form */}
      <div className="verification-card">
        <div className="qr-input-header">
          <h2>QR Code Input</h2>
          <div className="input-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${!useCamera ? 'active' : ''}`}
              onClick={() => {
                if (useCamera) {
                  stopCamera();
                }
                setUseCamera(false);
                setError('');
              }}
            >
              📝 Manual
            </button>
            <button
              type="button"
              className={`mode-btn ${useCamera ? 'active' : ''}`}
              onClick={() => {
                setUseCamera(true);
                setError('');
                startCamera();
              }}
            >
              📷 Camera
            </button>
          </div>
        </div>

        {useCamera ? (
          // Camera Mode
          <div className="camera-container">
            <video
              ref={videoRef}
              className="camera-feed"
              playsInline
              muted
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <div className="camera-overlay">
              <div className="qr-scanner-frame">
                <div className="corner corner-top-left"></div>
                <div className="corner corner-top-right"></div>
                <div className="corner corner-bottom-left"></div>
                <div className="corner corner-bottom-right"></div>
              </div>
              <p className="scanner-hint">Point camera at QR code</p>
            </div>

            <div className="camera-controls">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  stopCamera();
                  setUseCamera(false);
                }}
              >
                ✕ Close Camera
              </button>
              {lastScannedQR && (
                <p className="scanned-code-info">
                  Last scanned: {lastScannedQR.substring(0, 30)}...
                </p>
              )}
            </div>
          </div>
        ) : (
          // Manual Input Mode
          <form onSubmit={handleVerifyQR} className="qr-form">
            <div className="form-group">
              <label htmlFor="qrInput">QR Code Data</label>
              <textarea
                id="qrInput"
                className="form-control"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Paste QR code data here or use camera mode to scan..."
                rows="4"
                disabled={loading}
              />
              <small className="form-text text-muted">
                You can paste the QR code data directly, or click the Camera button above to scan
              </small>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || !qrInput.trim()}
            >
              {loading ? 'Verifying...' : '✓ Verify QR Code'}
            </button>
          </form>
        )}
      </div>

      {/* Verified Booking Details */}
      {verifiedBooking && (
        <div className="verification-card verified-booking-card">
          <div className="booking-verification-header">
            <h2>✓ Booking Details</h2>
            <span className={`status-badge badge-${verifiedBooking.qrCodeVerified ? 'success' : 'warning'}`}>
              {verifiedBooking.qrCodeVerified ? 'VERIFIED' : 'UNVERIFIED'}
            </span>
          </div>

          <div className="booking-details-grid">
            <div className="detail-item">
              <label>Booking ID</label>
              <p className="detail-value">{verifiedBooking.id}</p>
            </div>

            <div className="detail-item">
              <label>Resource</label>
              <p className="detail-value">{verifiedBooking.resourceId}</p>
            </div>

            <div className="detail-item">
              <label>User ID</label>
              <p className="detail-value">{verifiedBooking.userId}</p>
            </div>

            <div className="detail-item">
              <label>Status</label>
              <p className="detail-value">
                <span className={`badge badge-${getStatusColor(verifiedBooking.status)}`}>
                  {verifiedBooking.status}
                </span>
              </p>
            </div>

            <div className="detail-item">
              <label>Date</label>
              <p className="detail-value">
                {new Date(verifiedBooking.startTime).toLocaleDateString()}
              </p>
            </div>

            <div className="detail-item">
              <label>Time</label>
              <p className="detail-value">
                {new Date(verifiedBooking.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })} - {new Date(verifiedBooking.endTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="detail-item">
              <label>Purpose</label>
              <p className="detail-value">{verifiedBooking.purpose}</p>
            </div>

            <div className="detail-item">
              <label>Expected Attendees</label>
              <p className="detail-value">{verifiedBooking.expectedAttendees}</p>
            </div>

            {verifiedBooking.qrCodeVerified && (
              <div className="detail-item">
                <label>Verification Time</label>
                <p className="detail-value">
                  {new Date(verifiedBooking.qrCodeVerificationTime).toLocaleString()}
                </p>
              </div>
            )}

            {verifiedBooking.approvalDate && (
              <div className="detail-item">
                <label>Approved By</label>
                <p className="detail-value">{verifiedBooking.approvedBy || 'N/A'}</p>
              </div>
            )}
          </div>

          <div className="verification-actions">
            <button
              className="btn btn-success"
              onClick={() => setVerifiedBooking(null)}
            >
              Verify Another
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => window.print()}
            >
              🖨️ Print
            </button>
          </div>
        </div>
      )}

      {/* Verification History */}
      {history.length > 0 && (
        <div className="verification-card">
          <div className="history-header">
            <h2>Recent Verifications</h2>
            <button
              className="btn btn-sm btn-danger"
              onClick={handleClearHistory}
            >
              Clear History
            </button>
          </div>

          <div className="history-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Resource</th>
                  <th>User</th>
                  <th>Verification Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index}>
                    <td className="booking-id">{item.bookingId}</td>
                    <td>{item.resourceId}</td>
                    <td>{item.userId}</td>
                    <td>{item.verificationTime}</td>
                    <td>
                      <span className={`badge ${item.verified ? 'badge-success' : 'badge-warning'}`}>
                        {item.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="verification-card instructions-card">
        <h3>📋 How to Verify</h3>
        <ol>
          <li>Ask the user to show the QR code (screenshot or printed)</li>
          <li>Use a QR code scanner app to scan the code</li>
          <li>Paste the scanned QR code data in the input field above</li>
          <li>Click "Verify QR Code" to confirm the booking</li>
          <li>Review the booking details to ensure authenticity</li>
        </ol>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'secondary',
  };
  return colors[status] || 'secondary';
};

export default QRVerification;
