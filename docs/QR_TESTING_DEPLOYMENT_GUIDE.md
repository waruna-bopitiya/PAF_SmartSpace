# QR Camera Scanner - Testing & Deployment Guide

## 🧪 Pre-Deployment Testing

### 1. Frontend Build Test
```bash
# In frontend directory
cd g:\PROJECTS\PAF_SmartSpace\frontend
npm run build
```
✅ **Expected**: Build completes with "Compiled successfully"

### 2. Backend Build Test
```bash
# In backend directory
cd g:\PROJECTS\PAF_SmartSpace\backend
mvn clean compile
```
✅ **Expected**: Compilation completes without critical errors

### 3. Development Server Test
```bash
# Terminal 1: Start backend
cd g:\PROJECTS\PAF_SmartSpace\backend
mvn spring-boot:run

# Terminal 2: Start frontend
cd g:\PROJECTS\PAF_SmartSpace\frontend
npm start
```
✅ **Expected**: 
- Backend available at `http://localhost:8080`
- Frontend available at `http://localhost:3000`

## 🔍 Feature Testing

### Test Case 1: Manual QR Verification
1. Open `http://localhost:3000` in browser
2. Log in as Admin user
3. Navigate to Admin Dashboard → QR Verification
4. Click "📝 Manual" button (should already be selected)
5. Copy a booking QR code from a booking's modal
6. Paste into textarea
7. Click "✓ Verify QR Code"

✅ **Expected Results**:
- Booking details appear below
- Status badge shows "VERIFIED"
- Verification time displays
- History adds new entry

❌ **If Failed**:
- Check browser console for errors (F12)
- Verify backend is running
- Check network tab for API response

### Test Case 2: Camera QR Verification
1. Open Admin Dashboard → QR Verification
2. Click "📷 Camera" button
3. Grant camera permission when prompted
4. Point device camera at a booking QR code
5. Keep steady until detected

✅ **Expected Results**:
- Camera feed displays in real-time
- Blue scanner frame shows
- QR code auto-detects
- Booking details appear
- Camera closes automatically
- Status shows "VERIFIED"

❌ **If Camera Won't Open**:
1. Check browser camera permissions
2. Try different browser
3. Ensure no other app using camera
4. Check HTTPS/localhost requirement (must be one of these)

### Test Case 3: Mode Switching
1. Click "📝 Manual" → Should show textarea
2. Click "📷 Camera" → Should show camera feed
3. Switch back to "📝 Manual" → Textarea reappears

✅ **Expected Results**: Smooth transitions, no errors

### Test Case 4: Verification History
1. Verify 3-5 bookings
2. Scroll to "Verification History" section
3. Check last 10 entries display correctly
4. Click "🗑️ Clear History"
5. Confirm dialog appears
6. History should clear

✅ **Expected Results**: All bookings listed with timestamps

### Test Case 5: Error Handling
**Test Invalid QR Code**:
1. In manual mode, type random text
2. Click verify
3. Error message should appear: "Invalid QR code format"

**Test Non-existent Booking**:
1. Modify valid QR code (change booking ID)
2. Click verify
3. Error should appear: "Booking not found"

✅ **Expected Results**: Clear, helpful error messages

### Test Case 6: Mobile Responsiveness
1. Open in mobile device browser
2. Navigate to QR Verification
3. Camera and manual modes should work
4. Layout should be responsive
5. Buttons should be touch-friendly

✅ **Expected Results**: Smooth operation on mobile

## 📊 Backend Verification

### Check Database Updates
```bash
# Connect to MongoDB
mongosh  # or mongo for older versions

# In mongo shell
use smartcampusdb
db.bookings.findOne({qrCodeVerified: true})
```

✅ **Expected Output**: Document with:
- `qrCode`: Base64 encoded image
- `qrCodeVerified`: true
- `qrCodeVerificationTime`: ISO timestamp

### Check API Responses
```bash
# In PowerShell
# Test QR code retrieval
Invoke-WebRequest -Uri "http://localhost:8080/api/bookings/{bookingId}/qr-code" `
  -Headers @{"Authorization"="Bearer {token}"}

# Should return: {"qrCode": "data:image/png;base64,..."}
```

## 🚀 Deployment Checklist

### Before Deploying to Production

- [ ] Frontend builds without errors
- [ ] Backend compiles without critical errors
- [ ] All tests pass locally
- [ ] Camera works on target devices
- [ ] Manual mode works as fallback
- [ ] Database has test bookings with QR codes
- [ ] SSL/HTTPS certificate configured (required for camera)
- [ ] MongoDB backup created
- [ ] Admin users granted permission

### Deployment Steps

1. **Build Frontend for Production**
   ```bash
   cd frontend
   npm run build
   ```
   Output: `build/` directory with optimized files

2. **Build Backend JAR**
   ```bash
   cd backend
   mvn clean package -DskipTests
   ```
   Output: `target/smart-campus-hub-api-1.0.0.jar`

3. **Deploy Backend**
   - Copy JAR to production server
   - Restart backend service
   - Verify on logs: No startup errors

4. **Deploy Frontend**
   - Copy `build/` contents to web server
   - Configure reverse proxy (if needed)
   - Test connectivity to backend

5. **Verify Deployment**
   - Test QR verification with real data
   - Check error logs
   - Verify HTTPS/SSL working
   - Test on multiple browsers/devices

## 📋 Post-Deployment Verification

### Day 1 Checklist
- [ ] All users can access application
- [ ] Admin can see QR Verification tab
- [ ] Camera mode works with permission
- [ ] Manual mode works as fallback
- [ ] Bookings can be verified
- [ ] History persists correctly
- [ ] No errors in browser console
- [ ] No errors in backend logs

### Weekly Checklist
- [ ] QR codes generating correctly
- [ ] Verification timestamps accurate
- [ ] History clearing works
- [ ] Camera permissions working
- [ ] No performance issues
- [ ] Mobile devices work well
- [ ] Database not growing abnormally

## 🔐 Security Testing

### HTTPS Requirement
```javascript
// Camera API requires HTTPS or localhost
// Test both:
https://yourdomain.com        // ✅ Works
http://yourdomain.com         // ❌ Camera fails
http://localhost:3000         // ✅ Works (dev)
```

### Permission Scoping
- [ ] Only admins can access verification page
- [ ] Non-admins redirected away
- [ ] Token validation working
- [ ] Session management correct

### Data Privacy
- [ ] Camera stream not logged
- [ ] QR codes encrypted in DB
- [ ] Verification history only for admins
- [ ] No camera data transmitted

## 🐛 Troubleshooting During Testing

### Browser Console Issues
```javascript
// Check for errors:
Uncaught TypeError: jsQR is not defined
// → Solution: Ensure jsqr npm package installed

Cannot read property 'srcObject' of null
// → Solution: Video element not rendering

getUserMedia is not defined
// → Solution: Using non-HTTPS without localhost
```

### Backend Issues
```
[QR Code API] Booking not found
// → Check booking ID exists in database

[QR Verify API] QR code details don't match
// → Check booking resourceId and userId match

Error generating QR code
// → Check ZXing library installed (mvn install)
```

### Performance Issues
- Camera feed laggy → Check CPU usage
- Slow verification → Check database query time
- High memory → Close other apps

## 📈 Performance Benchmarks

### Expected Performance
- QR Code Generation: <500ms
- QR Code Scanning: <100ms per frame
- Verification API: <500ms
- Database Query: <50ms
- Page Load: <2 seconds

### If Performance is Poor
1. Check browser dev tools (F12)
2. Check network tab for slow requests
3. Check backend logs for errors
4. Monitor server CPU/memory usage
5. Check database indexes

## 📞 Support & Escalation

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Camera won't open | HTTPS/permissions | Check HTTPS config or allow permissions |
| QR won't detect | Bad lighting | Improve lighting, try different angle |
| Slow verification | Database | Check database indexes, connection pool |
| High memory usage | Memory leak | Restart server, check logs |

### Rollback Plan
If issues occur in production:
1. Revert to previous backend build
2. Clear browser cache
3. Restart services
4. Contact development team

## 📞 Contact Information

**For Issues**:
- Check documentation first
- Review browser console errors
- Contact System Administrator
- Report with: browser version, error message, screenshots

## ✅ Final Verification

Once deployed, verify:
```
✅ Frontend loads without errors
✅ Admin can login
✅ QR Verification page accessible
✅ Both manual and camera modes work
✅ Bookings verify successfully
✅ History persists across sessions
✅ No console errors
✅ No server errors
✅ Performance acceptable
✅ Mobile works
```

---

**Deployment Status**: Ready
**Last Updated**: 2026-04-27
**Version**: 1.0

