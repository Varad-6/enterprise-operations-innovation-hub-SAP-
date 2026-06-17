import { test, expect, Page } from '@playwright/test';

/**
 * ENTERPRISE OPERATIONS WORKFLOW TEST SUITE
 * 
 * Tests the complete request lifecycle:
 * 1. Create Request with auto-generated Request Number
 * 2. Verify Approval record created
 * 3. Submit Request (Status = SUBMITTED)
 * 4. Approve Request (Decision = APPROVED, Status = APPROVED)
 * 5. Reject Request (Decision = REJECTED, Status = REJECTED)
 * 6. Verify Historical Approvals visible
 */

const BASE_URL = 'http://localhost:4004/app/enterprise-operations-u/';

// Test data
const EMPLOYEE_ID = '11111111-eeee-1111-eeee-111111111111'; // Varad Kadam (Manager: Rahul)
const MANAGER_ID = '22222222-eeee-2222-eeee-222222222222'; // Rahul Sharma
const PRIORITY_MEDIUM = 'MEDIUM';
const REQUEST_TYPE_LAPTOP = 'LAPTOP';

let requestId = '';
let requestNumber = '';
let approvalId = '';

test.describe('Enterprise Operations - Complete Workflow', () => {

    test.beforeAll(async () => {
        console.log('🚀 Starting Enterprise Operations Workflow Tests');
    });

    test.describe('TEST 1: Create Request with Auto-Generated Request Number', () => {

        test('T1.1 - Navigate to Requests List Page', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Verify we're on the List Report page
            const listReportTable = page.locator('[data-sap-ui-area="sap.fe.templates.ListReport"]');
            await expect(listReportTable).toBeVisible();

            console.log('✓ Successfully navigated to Requests List Page');
        });

        test('T1.2 - Open Create Request Dialog', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Find and click the "Create Request" button
            const createButton = page.locator('button:has-text("Create Request")');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for dialog to open
            await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
            const dialog = page.locator('[role="dialog"]');
            await expect(dialog).toBeVisible();

            console.log('✓ Create Request dialog opened successfully');
        });

        test('T1.3 - Fill Request Form with Valid Data', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Click Create Request button
            const createButton = page.locator('button:has-text("Create Request")');
            await createButton.click();
            await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

            // Fill Title
            const titleInput = page.locator('input[placeholder*="Title"], input[aria-label*="Title"]').first();
            await titleInput.fill('Laptop Replacement Request');

            // Fill Description
            const descInput = page.locator('textarea[placeholder*="Description"], input[aria-label*="Description"]').first();
            await descInput.fill('Need a new laptop for development work. Current device is 5 years old.');

            // Select Employee (should be pre-filled or selectable)
            const employeeField = page.locator('input[placeholder*="Employee"], input[aria-label*="Employee"]').first();
            if (employeeField) {
                await employeeField.fill('Varad');
                await page.waitForTimeout(500);
                const employeeOption = page.locator('text=Varad Kadam').first();
                await employeeOption.click();
            }

            // Select Priority
            const priorityField = page.locator('input[placeholder*="Priority"], input[aria-label*="Priority"]').first();
            if (priorityField) {
                await priorityField.click();
                await page.waitForTimeout(500);
                const priorityOption = page.locator('text=MEDIUM').first();
                await priorityOption.click();
            }

            // Select Request Type
            const typeField = page.locator('input[placeholder*="Request Type"], input[aria-label*="Request Type"]').first();
            if (typeField) {
                await typeField.click();
                await page.waitForTimeout(500);
                const typeOption = page.locator('text=LAPTOP').first();
                await typeOption.click();
            }

            console.log('✓ Form filled with valid data');
        });

        test('T1.4 - Submit Form and Verify Request Number Generated', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Click Create Request
            const createButton = page.locator('button:has-text("Create Request")');
            await createButton.click();
            await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

            // Fill form fields
            const titleInput = page.locator('input[placeholder*="Title"], input[aria-label*="Title"]').first();
            await titleInput.fill('Laptop Request - QA Testing');

            const descInput = page.locator('textarea[placeholder*="Description"], input[aria-label*="Description"]').first();
            await descInput.fill('QA test request for automated testing');

            // Fill employee
            const employeeField = page.locator('input[placeholder*="Employee"], input[aria-label*="Employee"]').first();
            if (employeeField) {
                await employeeField.fill('Varad');
                await page.waitForTimeout(500);
                const employeeOption = page.locator('text=Varad Kadam').first();
                await employeeOption.click();
            }

            // Submit the form - click Save/Create button
            const saveButton = page.locator('button:has-text("Save"), button:has-text("Create")').first();
            await saveButton.click();

            // Wait for navigation or success message
            await page.waitForTimeout(2000);

            // Verify Request Number is generated in list
            const requestNumberCell = page.locator('text=/REQ-\\d{4}-\\d{4}/');
            await expect(requestNumberCell).toBeVisible();

            requestNumber = await requestNumberCell.textContent();
            console.log(`✓ Request created with Number: ${requestNumber}`);
        });

    });

    test.describe('TEST 2: Verify Approval Record Created', () => {

        test('T2.1 - Navigate to Created Request Detail', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Find the recently created request in the list
            const requestRow = page.locator('text=/REQ-\\d{4}-\\d{4}/').first();
            await requestRow.click();

            // Wait for Object Page to load
            await page.waitForLoadState('networkidle');

            // Verify Object Page loaded
            const objectPage = page.locator('[data-sap-ui-area*="ObjectPage"], .sapUiPageContent');
            await expect(objectPage).toBeVisible();

            console.log('✓ Navigated to Request Detail Page');
        });

        test('T2.2 - Verify Approvals Facet Visible', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Open a request
            const requestRow = page.locator('text=/REQ-\\d{4}-\\d{4}/').first();
            await requestRow.click();
            await page.waitForLoadState('networkidle');

            // Look for Approvals section/facet
            const approvalsFacet = page.locator('text=Approvals').first();
            await expect(approvalsFacet).toBeVisible();

            console.log('✓ Approvals facet is visible on Object Page');
        });

        test('T2.3 - Verify Approval Record Exists', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Open a request
            const requestRow = page.locator('text=/REQ-\\d{4}-\\d{4}/').first();
            await requestRow.click();
            await page.waitForLoadState('networkidle');

            // Click on Approvals tab/section if needed
            const approvalsTab = page.locator('text=Approvals').first();
            await approvalsTab.click({ force: true });
            await page.waitForTimeout(1000);

            // Verify approval record visible in table
            const approvalTable = page.locator('[role="table"]');
            await expect(approvalTable).toBeVisible();

            // Check for approver name (Manager: Rahul Sharma)
            const approverCell = page.locator('text=Rahul').first();
            await expect(approverCell).toBeVisible();

            // Extract approval ID for later tests
            const approvalRow = page.locator('tr:has-text("Rahul")').first();
            const approvalLink = approvalRow.locator('[role="link"]').first();
            approvalId = await approvalLink.getAttribute('href') || '';

            console.log(`✓ Approval record verified - Approver: Rahul Sharma`);
        });

    });

    test.describe('TEST 3: Submit Request (Status = SUBMITTED)', () => {

        test('T3.1 - Open Request and Click Submit Button', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Open a request
            const requestRow = page.locator('text=/REQ-\\d{4}-\\d{4}/').first();
            await requestRow.click();
            await page.waitForLoadState('networkidle');

            // Find and click Submit Request button
            const submitButton = page.locator('button:has-text("Submit Request")').first();
            await expect(submitButton).toBeVisible();
            await submitButton.click();

            // Wait for update to complete
            await page.waitForTimeout(2000);

            console.log('✓ Submit Request action triggered');
        });

        test('T3.2 - Verify Status Changed to SUBMITTED', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Open a request
            const requestRow = page.locator('text=/REQ-\\d{4}-\\d{4}/').first();
            await requestRow.click();
            await page.waitForLoadState('networkidle');

            // Submit the request
            const submitButton = page.locator('button:has-text("Submit Request")').first();
            if (await submitButton.isVisible()) {
                await submitButton.click();
                await page.waitForTimeout(2000);
            }

            // Verify Status field shows SUBMITTED
            const statusField = page.locator('text=Status', 'text=Submitted').first();
            await expect(statusField).toBeVisible();

            console.log('✓ Request status successfully changed to SUBMITTED');
        });

    });

    test.describe('TEST 4: Approve Request (Decision = APPROVED, Status = APPROVED)', () => {

        test('T4.1 - Navigate to Approval Detail', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Open a request
            const requestRow = page.locator('text=/REQ-\\d{4}-\\d{4}/').first();
            await requestRow.click();
            await page.waitForLoadState('networkidle');

            // Click on Approvals facet
            const approvalsTab = page.locator('text=Approvals').first();
            await approvalsTab.click({ force: true });
            await page.waitForTimeout(1000);

            // Click on the approval record (in the table)
            const approvalRow = page.locator('tr:has-text("Rahul")').first();
            await approvalRow.click();

            // Wait for Approval Object Page to load
            await page.waitForLoadState('networkidle');

            console.log('✓ Navigated to Approval Detail Page');
        });

        test('T4.2 - Click Approve Button', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Navigate to approval (simplified path)
            const requestRow = page.locator('text=/REQ-\\d{4}-\\d{4}/').first();
            await requestRow.click();
            await page.waitForLoadState('networkidle');

            const approvalsTab = page.locator('text=Approvals').first();
            await approvalsTab.click({ force: true });
            await page.waitForTimeout(1000);

            // Find and click Approve button
            const approveButton = page.locator('button:has-text("Approve")').first();
            await expect(approveButton).toBeVisible();
            await approveButton.click();

            // Wait for action to complete
            await page.waitForTimeout(2000);

            console.log('✓ Approve button clicked');
        });

        test('T4.3 - Verify Approval Decision = APPROVED', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Navigate to request
            const requestRow = page.locator('text=/REQ-\\d{4}-\\d{4}/').first();
            await requestRow.click();
            await page.waitForLoadState('networkidle');

            // Refresh to see updated data
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Check Approvals facet for decision status
            const approvalsTab = page.locator('text=Approvals').first();
            await approvalsTab.click({ force: true });
            await page.waitForTimeout(1000);

            // Verify decision shows as Approved
            const approvedCell = page.locator('text=Approved').first();
            await expect(approvedCell).toBeVisible();

            console.log('✓ Approval Decision verified as APPROVED');
        });

        test('T4.4 - Verify Request Status = APPROVED', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Open request
            const requestRow = page.locator('text=/REQ-\\d{4}-\\d{4}/').first();
            await requestRow.click();
            await page.waitForLoadState('networkidle');

            // Refresh to see updated status
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Check Status field
            const statusField = page.locator('text=Approved').first();
            await expect(statusField).toBeVisible();

            console.log('✓ Request Status verified as APPROVED');
        });

    });

    test.describe('TEST 5: Reject Request (Decision = REJECTED, Status = REJECTED)', () => {

        test('T5.1 - Create New Request for Rejection Test', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Click Create Request
            const createButton = page.locator('button:has-text("Create Request")').first();
            await createButton.click();
            await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

            // Fill form
            const titleInput = page.locator('input[placeholder*="Title"], input[aria-label*="Title"]').first();
            await titleInput.fill('Rejection Test Request');

            const descInput = page.locator('textarea[placeholder*="Description"], input[aria-label*="Description"]').first();
            await descInput.fill('This request will be rejected for testing');

            // Fill employee
            const employeeField = page.locator('input[placeholder*="Employee"], input[aria-label*="Employee"]').first();
            if (employeeField) {
                await employeeField.fill('Varad');
                await page.waitForTimeout(500);
                const employeeOption = page.locator('text=Varad Kadam').first();
                await employeeOption.click();
            }

            // Save
            const saveButton = page.locator('button:has-text("Save"), button:has-text("Create")').first();
            await saveButton.click();
            await page.waitForTimeout(2000);

            console.log('✓ New request created for rejection test');
        });

        test('T5.2 - Submit and Navigate to Approval', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Open the rejection test request
            const requestRows = page.locator('text=Rejection Test Request').first();
            await requestRows.click();
            await page.waitForLoadState('networkidle');

            // Submit request
            const submitButton = page.locator('button:has-text("Submit Request")').first();
            if (await submitButton.isVisible()) {
                await submitButton.click();
                await page.waitForTimeout(2000);
            }

            console.log('✓ Request submitted for rejection');
        });

        test('T5.3 - Click Reject Button', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Find request
            const requestRow = page.locator('text=Rejection Test Request').first();
            await requestRow.click();
            await page.waitForLoadState('networkidle');

            // Navigate to approvals
            const approvalsTab = page.locator('text=Approvals').first();
            await approvalsTab.click({ force: true });
            await page.waitForTimeout(1000);

            // Click Reject button
            const rejectButton = page.locator('button:has-text("Reject")').first();
            await expect(rejectButton).toBeVisible();
            await rejectButton.click();

            await page.waitForTimeout(2000);

            console.log('✓ Reject button clicked');
        });

        test('T5.4 - Verify Decision = REJECTED and Status = REJECTED', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Navigate to request
            const requestRow = page.locator('text=Rejection Test Request').first();
            await requestRow.click();
            await page.waitForLoadState('networkidle');

            // Refresh data
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Verify Approval Decision
            const approvalsTab = page.locator('text=Approvals').first();
            await approvalsTab.click({ force: true });
            await page.waitForTimeout(1000);

            const rejectedCell = page.locator('text=Rejected').first();
            await expect(rejectedCell).toBeVisible();

            // Also check Request Status
            const statusField = page.locator('text=Rejected').nth(1);
            await expect(statusField).toBeVisible();

            console.log('✓ Rejection verified - Decision: REJECTED, Status: REJECTED');
        });

    });

    test.describe('TEST 6: Historical Approvals Visible', () => {

        test('T6.1 - Verify Multiple Approvals Tracked', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Open a request with approvals
            const requestRow = page.locator('text=/REQ-\\d{4}-\\d{4}/').first();
            await requestRow.click();
            await page.waitForLoadState('networkidle');

            // Check Approvals facet
            const approvalsTab = page.locator('text=Approvals').first();
            await approvalsTab.click({ force: true });
            await page.waitForTimeout(1000);

            // Verify approval records are visible
            const approvalTable = page.locator('[role="table"]');
            await expect(approvalTable).toBeVisible();

            // Count approval rows
            const approvalRows = page.locator('tr').count();
            expect(approvalRows).toBeGreaterThan(0);

            console.log(`✓ Historical approvals visible - Found ${approvalRows} approval records`);
        });

        test('T6.2 - Verify Approval Details (Request, Approver, Decision, Comments)', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Open request
            const requestRow = page.locator('text=/REQ-\\d{4}-\\d{4}/').first();
            await requestRow.click();
            await page.waitForLoadState('networkidle');

            // Navigate to approvals
            const approvalsTab = page.locator('text=Approvals').first();
            await approvalsTab.click({ force: true });
            await page.waitForTimeout(1000);

            // Verify columns are present
            const requestNumberCol = page.locator('text=Request Number').first();
            const approverCol = page.locator('text=Approver').first();
            const decisionCol = page.locator('text=Decision').first();

            await expect(requestNumberCol).toBeVisible();
            await expect(approverCol).toBeVisible();
            await expect(decisionCol).toBeVisible();

            console.log('✓ All approval detail columns visible (Request, Approver, Decision)');
        });

    });

    test.afterAll(async () => {
        console.log('✅ All Enterprise Operations Workflow Tests Completed');
    });

});
