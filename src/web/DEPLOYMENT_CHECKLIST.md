# LINE Login Integration - Deployment Checklist

## Pre-Deployment

### Development
- [ ] Test login flow locally with `pnpm dev`
- [ ] Clear browser cache and localStorage
- [ ] Test on mobile device (responsive design)
- [ ] Test logout functionality
- [ ] Verify user data persists on page refresh
- [ ] Check browser console for errors
- [ ] Run linter: `pnpm lint`
- [ ] Run build: `pnpm build`

### Configuration
- [ ] Have LINE Channel ID ready
- [ ] Have LINE Channel Secret (if using backend)
- [ ] Determine backend strategy:
  - [ ] Option A: Use demo mode (no backend)
  - [ ] Option B: Implement backend for real OAuth
- [ ] If using backend:
  - [ ] Test backend locally
  - [ ] Get backend URL (localhost/production)

## Staging Deployment

### Azure Static Web App Setup
- [ ] Create/select Azure Static Web App resource
- [ ] Set environment variables in Azure portal:
  - [ ] `NEXT_PUBLIC_LINE_CHANNEL_ID` = your channel ID
  - [ ] `NEXT_PUBLIC_LINE_BACKEND_URL` = backend URL (if applicable)

### LINE Console Configuration
- [ ] Go to LINE Developers Console
- [ ] Add OAuth 2.0 redirect URI:
  - [ ] Staging: `https://your-staging-domain.com/callback`
  - [ ] Production: `https://your-domain.com/callback`

### Testing on Staging
- [ ] Deploy to staging environment
- [ ] Test full login flow on staging
- [ ] Test user profile display
- [ ] Test logout
- [ ] Verify localStorage persistence
- [ ] Test on mobile via staging URL
- [ ] Monitor Azure logs for errors

## Production Deployment

### Pre-Production Checklist
- [ ] Code review completed
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance metrics acceptable
- [ ] Security review done
- [ ] Backup current deployment

### Azure Configuration
- [ ] Set production environment variables:
  - [ ] `NEXT_PUBLIC_LINE_CHANNEL_ID` = production channel ID
  - [ ] `NEXT_PUBLIC_LINE_BACKEND_URL` = production backend URL
- [ ] Ensure HTTPS is enabled
- [ ] Configure CORS headers (if using backend)
- [ ] Setup monitoring/alerts

### LINE Console Production Setup
- [ ] Production channel created (if not done)
- [ ] Add production redirect URI:
  - [ ] `https://yourdomain.com/callback`
- [ ] Test with production LINE account
- [ ] Configure production channel settings:
  - [ ] Channel image/icon
  - [ ] Privacy policy URL
  - [ ] Terms of service URL

### Post-Deployment Monitoring
- [ ] Monitor login success rates
- [ ] Check error logs for issues
- [ ] Verify user data is saving correctly
- [ ] Monitor performance metrics
- [ ] Set up alerts for failed logins
- [ ] Track user adoption

## Rollback Plan

If issues occur in production:

1. **Immediate (< 5 minutes)**
   - [ ] Revert to previous deployment
   - [ ] Or disable login button with maintenance message

2. **Short-term (< 1 hour)**
   - [ ] Identify root cause
   - [ ] Fix in development
   - [ ] Test on staging
   - [ ] Deploy fix to production

3. **Communication**
   - [ ] Notify users of issue (if significant)
   - [ ] Post status update
   - [ ] Update incident log

## Post-Deployment

### Validation
- [ ] Test login flow in production
- [ ] Verify user profiles display correctly
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify no unauthorized access attempts

### Analytics
- [ ] Setup analytics tracking for login
- [ ] Monitor login conversion rates
- [ ] Track logout events
- [ ] Identify drop-off points

### Documentation
- [ ] Update README with deployment steps
- [ ] Document any production-specific configs
- [ ] Update team wiki/docs
- [ ] Create runbook for troubleshooting

## Maintenance

### Regular Tasks
- [ ] Weekly: Review error logs
- [ ] Monthly: Check for security updates
- [ ] Quarterly: Audit user data storage
- [ ] Annually: Review security practices

### Updates to Watch For
- [ ] LINE API changes
- [ ] Next.js updates
- [ ] Security patches
- [ ] React updates

## Support

### Common Issues & Solutions

**Login not working:**
1. Check `NEXT_PUBLIC_LINE_CHANNEL_ID` is set correctly
2. Verify redirect URI in LINE Console matches exactly
3. Clear browser cache and localStorage
4. Check browser console for errors

**User data not persisting:**
1. Check localStorage is enabled
2. Verify privacy/incognito mode isn't active
3. Check browser's storage quota

**Backend integration failing:**
1. Verify backend URL is correct
2. Check backend is running
3. Verify CORS headers
4. Check Channel Secret is configured

### Contact & Escalation

- LINE Support: https://developers.line.biz/en/services/support/
- Azure Support: Azure portal support tab
- Team Lead: [contact info]
- On-call Engineer: [contact info]

---

**Last Updated:** 2025-12-22
**Deployed By:** [Your Name]
**Production URL:** https://yourdomain.com
