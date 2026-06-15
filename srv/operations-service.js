const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    const {
        Requests,
        RequestStatuses,
        Employees,
        Approvals,
        ApprovalDecisions
    } = this.entities;

    // =====================================================
    // BEFORE CREATE
    // =====================================================
    this.before('CREATE', 'Requests', async (req) => {

        const draftStatus = await SELECT.one
            .from(RequestStatuses)
            .where({ Code: 'DRAFT' });

        if (draftStatus) {
            req.data.Status_ID = draftStatus.ID;
        }

        if (!req.data.Title || req.data.Title.trim() === '') {
            return req.error(400, 'Title is mandatory');
        }

        if (!req.data.Description || req.data.Description.trim() === '') {
            return req.error(400, 'Description is mandatory');
        }

        // Generate Request Number

        const year = new Date().getFullYear();

        const requestCount = await SELECT.from(Requests);

        req.data.RequestNumber =
            `REQ-${year}-${String(requestCount.length + 1).padStart(4, '0')}`;

    });

    // =====================================================
    // AFTER CREATE
    // =====================================================
    this.after('CREATE', 'Requests', async (data) => {

        if (!data.Employee_ID) {
            return;
        }

        const employee = await SELECT.one
            .from(Employees)
            .where({ ID: data.Employee_ID });

        if (!employee || !employee.Manager_ID) {
            return;
        }

        const pendingDecision = await SELECT.one
            .from(ApprovalDecisions)
            .where({ Code: 'PENDING' });

        await INSERT.into(Approvals).entries({
            ID: cds.utils.uuid(),
            Request_ID: data.ID,
            Approver_ID: employee.Manager_ID,
            Decision_ID: pendingDecision ? pendingDecision.ID : null
        });

        console.log(
            `Approval created for Request ${data.ID}`
        );

    });

    // =====================================================
    // BEFORE UPDATE
    // =====================================================
    this.before('UPDATE', 'Requests', async (req) => {

        const existingRequest = await SELECT.one
            .from(Requests)
            .where({ ID: req.data.ID });

        if (!existingRequest) {
            return req.error(404, 'Request not found');
        }

        const status = await SELECT.one
            .from(RequestStatuses)
            .where({ ID: existingRequest.Status_ID });

        if (
            status &&
            (
                status.Code === 'APPROVED' ||
                status.Code === 'REJECTED'
            )
        ) {
            return req.error(
                400,
                'Approved or Rejected requests cannot be modified'
            );
        }

        if (
            req.data.Title !== undefined &&
            req.data.Title.trim() === ''
        ) {
            return req.error(
                400,
                'Title cannot be empty'
            );
        }

        if (
            req.data.Description !== undefined &&
            req.data.Description.trim() === ''
        ) {
            return req.error(
                400,
                'Description cannot be empty'
            );
        }

    });

    // =====================================================
    // AFTER UPDATE
    // =====================================================
    this.after('UPDATE', 'Requests', async (data) => {

        console.log(`Request Updated : ${data.ID}`);

    });

    // =====================================================
    // SUBMIT REQUEST
    // =====================================================
    this.on('submitRequest', async (req) => {

        if (
            !req.user.is('Employee') &&
            !req.user.is('Manager') &&
            !req.user.is('Admin')
        ) {
            return req.error(
                403,
                'Not authorized to submit requests'
            );
        }

        const requestId = req.data.requestID;

        const requestData = await SELECT.one
            .from(Requests)
            .where({ ID: requestId });

        if (!requestData) {
            return req.error(404, 'Request not found');
        }

        if (!requestData.Title) {
            return req.error(400, 'Title is mandatory');
        }

        if (!requestData.Description) {
            return req.error(400, 'Description is mandatory');
        }

        const submittedStatus = await SELECT.one
            .from(RequestStatuses)
            .where({ Code: 'SUBMITTED' });

        if (!submittedStatus) {
            return req.error(
                400,
                'SUBMITTED status not configured'
            );
        }

        await UPDATE(Requests)
            .set({
                Status_ID: submittedStatus.ID
            })
            .where({
                ID: requestId
            });

        return `Request submitted successfully : ${requestData.RequestNumber}`;

    });

    // =====================================================
    // APPROVE REQUEST
    // =====================================================
    this.on('approveRequest', async (req) => {

        const approvedStatus = await SELECT.one
            .from(RequestStatuses)
            .where({ Code: 'APPROVED' });

        const approvedDecision = await SELECT.one
            .from(ApprovalDecisions)
            .where({ Code: 'APPROVED' });

        await UPDATE(Approvals)
            .set({
                Decision_ID: approvedDecision.ID,
                Comments: req.data.comments,
                ApprovedAt: new Date()
            })
            .where({
                Request_ID: req.data.requestID
            });

        await UPDATE(Requests)
            .set({
                Status_ID: approvedStatus.ID
            })
            .where({
                ID: req.data.requestID
            });

        return 'Request Approved';

    });

    // =====================================================
    // REJECT REQUEST
    // =====================================================
    this.on('rejectRequest', async (req) => {

        const rejectedStatus = await SELECT.one
            .from(RequestStatuses)
            .where({ Code: 'REJECTED' });

        const rejectedDecision = await SELECT.one
            .from(ApprovalDecisions)
            .where({ Code: 'REJECTED' });

        await UPDATE(Approvals)
            .set({
                Decision_ID: rejectedDecision.ID,
                Comments: req.data.comments,
                ApprovedAt: new Date()
            })
            .where({
                Request_ID: req.data.requestID
            });

        await UPDATE(Requests)
            .set({
                Status_ID: rejectedStatus.ID
            })
            .where({
                ID: req.data.requestID
            });

        return 'Request Rejected';

    });

    // =====================================================
    // DASHBOARD STATS
    // =====================================================
    this.on('getDashboardStats', async (req) => {

        /*
        if (!req.user.is('Admin')) {
            return req.error(
                403,
                'Only Admin can access dashboard statistics'
            );
        }
        */

        const allRequests = await SELECT.from(Requests);

        const approvedStatus = await SELECT.one
            .from(RequestStatuses)
            .where({ Code: 'APPROVED' });

        const rejectedStatus = await SELECT.one
            .from(RequestStatuses)
            .where({ Code: 'REJECTED' });

        const submittedStatus = await SELECT.one
            .from(RequestStatuses)
            .where({ Code: 'SUBMITTED' });

        const approved = approvedStatus
            ? await SELECT.from(Requests)
                .where({ Status_ID: approvedStatus.ID })
            : [];

        const rejected = rejectedStatus
            ? await SELECT.from(Requests)
                .where({ Status_ID: rejectedStatus.ID })
            : [];

        const pending = submittedStatus
            ? await SELECT.from(Requests)
                .where({ Status_ID: submittedStatus.ID })
            : [];

        return {
            TotalRequests: allRequests.length,
            PendingRequests: pending.length,
            ApprovedRequests: approved.length,
            RejectedRequests: rejected.length
        };

    });

});