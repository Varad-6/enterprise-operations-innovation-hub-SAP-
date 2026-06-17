# Testing Checklist & Validation Guide

## 🎯 Pre-Testing Setup

### Step 1: Verify Environment
```bash
# Check Node.js version (should be 16+)
node --version

# Check npm
npm --version

# Navigate to project
cd /Users/varad/enterprise-operations-innovation-hub-SAP-

# Install/update dependencies
npm install
```

### Step 2: Start Development Server
```bash
# In project root:
cds watch

# Expected output:
# ✔  Listening on { url: 'http://localhost:4004' }
# ✔  Server running at: http://localhost:4004/
```

### Step 3: Verify Database
```bash
# Check seed data loaded
curl http://localhost:4004/odata/v4/operations/Employees

# Should return 4 employees:
# - Varad Kadam (EMP001) - Manager: Rahul
# - Rahul Sharma (EMP002) - Manager: Priya
# - Priya Patil (EMP003) - No manager
# - Amit Joshi (EMP004) - Manager: Rahul
```

---

## ✅ Manual Testing Checklist

### TEST 1: Request Creation with Auto-Generated Number

**Setup:**
- [ ] Server running (`cds watch`)
- [ ] Application open (http://localhost:4004/app/enterprise-operations-u/)
- [ ] Requests List visible

**Test Steps:**
- [ ] Click "Create Request" button
- [ ] Fill form:
  - Title: `"Test Request 001"`
  - Description: `"This is a test request for workflow validation"`
  - Employee: Select `Varad Kadam`
  - Priority: Select `MEDIUM` (or leave default)
  - Request Type: Select `LAPTOP` (or leave default)
- [ ] Click "Save" or "Create" button

**Verification:**
- [ ] Dialog closes
- [ ] New request appears in list
- [ ] **CRITICAL:** Request has number like `REQ-2026-0001` ✅
  - If RequestNumber is empty: **FAIL** ❌
  - If RequestNumber shows value: **PASS** ✅
- [ ] Request status is `DRAFT`

**Success Criteria:**
```
✅ PASS: RequestNumber field populated with REQ-YYYY-XXXX format
❌ FAIL: RequestNumber is empty or null
```

---

### TEST 2: Approval Record Auto-Creation

**Setup:**
- [ ] From Test 1, have a created request
- [ ] Request detail view open

**Test Steps:**
- [ ] Open the created request detail page
- [ ] Scroll down to find "Approvals" facet/tab
- [ ] Click on "Approvals" section

**Verification:**
- [ ] **CRITICAL:** Approval record visible ✅
  - If no approvals: **FAIL** ❌
  - If 1+ approval visible: **PASS** ✅
- [ ] Approver name shown: `Rahul Sharma` (Varad's manager)
- [ ] Decision status: `Pending` (initial state)
- [ ] Table columns visible:
  - [ ] Request Number
  - [ ] Title
  - [ ] Approver
  - [ ] Decision

**Success Criteria:**
```
✅ PASS: Approval record visible with Manager as Approver
❌ FAIL: No approval records shown
```

---

### TEST 3: Submit Request Workflow

**Setup:**
- [ ] Request in DRAFT status from Test 1
- [ ] Request detail view open

**Test Steps:**
- [ ] Scroll to top of Object Page
- [ ] Look for "Submit Request" button
- [ ] Click "Submit Request" button
- [ ] Confirm/accept any dialog

**Verification:**
- [ ] Button disappears after click
- [ ] Refresh page (F5)
- [ ] **CRITICAL:** Status changed to `SUBMITTED` ✅
  - If status still `DRAFT`: **FAIL** ❌
  - If status now `SUBMITTED`: **PASS** ✅
- [ ] "Submit Request" button no longer visible

**Success Criteria:**
```
✅ PASS: Request status changed from DRAFT to SUBMITTED
❌ FAIL: Status remains DRAFT after submit
```

---

### TEST 4: Approve Request Workflow

**Setup:**
- [ ] Request in SUBMITTED status from Test 3
- [ ] Request detail view open

**Test Steps:**
- [ ] Navigate to Approvals facet
- [ ] Click on approval record row (to open detail)
- [ ] Look for "Approve" button
- [ ] Click "Approve" button
- [ ] Wait for action to complete (2-3 seconds)

**Verification:**
- [ ] **CRITICAL:** Decision status changed to `Approved` ✅
  - If decision still `Pending`: **FAIL** ❌
  - If decision now `Approved`: **PASS** ✅
- [ ] Refresh request detail page
- [ ] Approval's "Decision" column shows: `Approved`
- [ ] **CRITICAL:** Request Status changed to `APPROVED` ✅
  - If status still `SUBMITTED`: **FAIL** ❌
  - If status now `APPROVED`: **PASS** ✅

**Success Criteria:**
```
✅ PASS: Both Approval Decision and Request Status = APPROVED
❌ FAIL: Decision/Status doesn't change or shows error
```

---

### TEST 5: Reject Request Workflow

**Setup:**
- [ ] Create NEW request (repeat Test 1)
- [ ] Submit NEW request (repeat Test 3)

**Test Steps:**
- [ ] Navigate to Approvals facet
- [ ] Click on approval record row (to open detail)
- [ ] Look for "Reject" button
- [ ] Click "Reject" button
- [ ] Wait for action to complete

**Verification:**
- [ ] **CRITICAL:** Decision status changed to `Rejected` ✅
  - If decision still `Pending`: **FAIL** ❌
  - If decision now `Rejected`: **PASS** ✅
- [ ] Refresh request detail page
- [ ] Approval's "Decision" column shows: `Rejected`
- [ ] **CRITICAL:** Request Status changed to `REJECTED` ✅
  - If status still `SUBMITTED`: **FAIL** ❌
  - If status now `REJECTED`: **PASS** ✅

**Success Criteria:**
```
✅ PASS: Both Approval Decision and Request Status = REJECTED
❌ FAIL: Decision/Status doesn't change or shows error
```

---

### TEST 6: Historical Approvals Tracking

**Setup:**
- [ ] Multiple requests created (from Tests 1, 4, 5)
- [ ] Some approved, some rejected

**Test Steps:**
- [ ] Open first request detail
- [ ] Navigate to Approvals facet
- [ ] Verify all columns visible

**Verification:**
- [ ] Approvals table shows multiple records (if multiple requests created)
- [ ] **CRITICAL:** All columns visible ✅
  - Request Number: Shows REQ-YYYY-XXXX format
  - Title: Shows request title
  - Approver: Shows employee name
  - Decision: Shows APPROVED/REJECTED/PENDING
- [ ] Approvals persist after page refresh
- [ ] Approve/Reject history preserved

**Success Criteria:**
```
✅ PASS: Historical approvals visible with complete details
❌ FAIL: Missing columns or data, approvals don't persist
```

---

## 🤖 Automated Testing Checklist

### Install Playwright
```bash
npm install --save-dev @playwright/test

# Or if already installed, ensure it's latest
npm update @playwright/test
```

### Run All Tests
```bash
# Run all tests
npx playwright test

# Expected output:
# ✓ Tests passed: 17/17
# ✗ Tests failed: 0/0
```

### Test-by-Test Execution

**Test Suite 1: Request Creation**
```bash
npx playwright test -g "Create Request"

# Expected: 4/4 PASS ✅
```

**Test Suite 2: Approval Creation**
```bash
npx playwright test -g "Approval Record"

# Expected: 3/3 PASS ✅
```

**Test Suite 3: Submit Workflow**
```bash
npx playwright test -g "Submit Request"

# Expected: 2/2 PASS ✅
```

**Test Suite 4: Approve Workflow**
```bash
npx playwright test -g "Approve Request"

# Expected: 4/4 PASS ✅
```

**Test Suite 5: Reject Workflow**
```bash
npx playwright test -g "Reject Request"

# Expected: 4/4 PASS ✅
```

**Test Suite 6: Historical Tracking**
```bash
npx playwright test -g "Historical Approvals"

# Expected: 2/2 PASS ✅
```

### View Test Reports
```bash
# Generate HTML report
npx playwright test

# View report
npx playwright show-report

# Report opens in browser showing:
# - All 17 tests
# - Pass/Fail status
# - Screenshots on failure
# - Timing information
```

### Debug Mode (Interactive)
```bash
# Run with UI debugger
npx playwright test --ui

# Features:
# - Watch tests execute step-by-step
# - Pause on failure
# - Inspect elements
# - Replay test actions
```

---

## 🔍 Troubleshooting Checklist

### Issue: RequestNumber is NULL or Empty

**Check:**
- [ ] Server running? (`cds watch` output visible)
- [ ] Database initialized? (seed data loaded)
- [ ] before CREATE handler executed?
  - Look for console log: `RequestNumber = REQ-...`
- [ ] Are you using "Create Request" button (not standard create)?

**Fix:**
```bash
# Restart server
cds watch

# Clear database
rm -f db.sqlite

# Restart with fresh data
cds watch
```

---

### Issue: Approval Records Not Created

**Check:**
- [ ] Employee has a Manager assigned?
  - Varad Kadam → Manager: Rahul Sharma ✓
  - Priya Patil → No Manager (won't create approval) ✗
- [ ] after CREATE handler is executing?
  - Look for console log: `Approval created for Request ...`
- [ ] PENDING decision code exists in database?
  - Check db/data/enterprise.operations-ApprovalDecision.csv

**Fix:**
```bash
# Verify employee manager in CSV:
cat db/data/enterprise.operations-Employee.csv
# Should show Manager_ID populated for all employees except executives

# Verify decision codes:
cat db/data/enterprise.operations-ApprovalDecision.csv
# Should include: PENDING, APPROVED, REJECTED
```

---

### Issue: Approve/Reject Buttons Not Responding

**Check:**
- [ ] You're on Approval detail page? (not just list)
- [ ] Buttons visible on page?
- [ ] Browser console shows errors?
  - Open DevTools (F12)
  - Check Console tab for errors
- [ ] Action name matches annotation?
  - Should be `rejectApproval` (not `reject`)

**Fix:**
```bash
# Check annotation
grep -n "rejectApproval" app/enterprise-operations-u/annotations.cds
# Should show: Action : 'OperationsService.rejectApproval'

# Check service definition
grep -n "action.*Approval" srv/operations-service.cds
# Should show: action approve() and action rejectApproval()
```

---

### Issue: Tests Failing in Playwright

**Check:**
- [ ] Server running? Test config requires `cds watch`
- [ ] Correct base URL? (http://localhost:4004)
- [ ] Fresh database? (old data might interfere)
- [ ] Firefox/Chrome browser available?

**Fix:**
```bash
# Kill old processes
lsof -ti:4004 | xargs kill -9

# Clear database
rm -f db.sqlite

# Restart fresh
cds watch

# In new terminal, run tests:
npx playwright test
```

---

### Issue: Syntax Errors in Code

**Check:**
```bash
# Validate CDS files
cds compile db/schema.cds

# Validate JavaScript
node -c srv/operations-service.js

# Check errors reported
npm run check 2>&1 | grep -i error
```

---

## 📊 Success Criteria Summary

### Manual Testing
- [ ] Test 1: RequestNumber generated ✅
- [ ] Test 2: Approval record created ✅
- [ ] Test 3: Submit status updated ✅
- [ ] Test 4: Approve workflow works ✅
- [ ] Test 5: Reject workflow works ✅
- [ ] Test 6: Historical tracking visible ✅

### Automated Testing
- [ ] All 17 Playwright tests pass ✅
- [ ] No console errors ✅
- [ ] HTML report shows 0 failures ✅

### Overall Success
```
6/6 Manual Tests PASS     ✅
17/17 Automated Tests PASS ✅
─────────────────────────────
WORKFLOW VALIDATION: ✅ COMPLETE
```

---

## 🚀 Next Steps After Validation

1. **Deploy to BTP**
   ```bash
   mta build
   cf deploy mta_archives/*.mtar
   ```

2. **Configure Production Database**
   - Replace SQLite with PostgreSQL/HANA
   - Update xs-security.json for authentication

3. **Enable Notifications**
   - Add email notifications on approval requests
   - Add SAP Event Mesh integration

4. **Extend Functionality**
   - Multi-level approvals
   - Request templates
   - Advanced search/filters
   - Analytics dashboard

---

## 📝 Test Execution Report Template

Use this template to document your testing:

```
═══════════════════════════════════════════════════════════
ENTERPRISE OPERATIONS WORKFLOW - TEST EXECUTION REPORT
═══════════════════════════════════════════════════════════

Date: ________
Tester: ________
Environment: Local/BTP/Production

MANUAL TESTS
────────────
Test 1 - Create Request with Number:    [ ] PASS  [ ] FAIL
Test 2 - Approval Auto-Creation:        [ ] PASS  [ ] FAIL
Test 3 - Submit Request:                [ ] PASS  [ ] FAIL
Test 4 - Approve Request:               [ ] PASS  [ ] FAIL
Test 5 - Reject Request:                [ ] PASS  [ ] FAIL
Test 6 - Historical Approvals:          [ ] PASS  [ ] FAIL

Manual Tests Summary: __/6 PASSED

AUTOMATED TESTS
────────────────
Total Tests: 17
Passed: ___
Failed: ___
Skipped: ___

Automated Tests Summary: __/17 PASSED

ISSUES FOUND
─────────────
1. [Issue Description]
   - Severity: High/Medium/Low
   - Status: Open/Fixed
   - Notes: ________________

SIGN-OFF
─────────
[ ] All tests passed
[ ] Ready for production
[ ] Additional fixes needed

Tester Signature: ______________________
Date: ________
```

