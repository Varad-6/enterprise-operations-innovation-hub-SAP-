const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    const {
        Requests,
        RequestStatuses,
        Employees,
        Approvals
    } = this.entities;

    // Set DRAFT status when Request is created
    this.before('CREATE', 'Requests', async (req) => {

        const draftStatus = await SELECT.one
            .from(RequestStatuses)
            .where({ Code: 'DRAFT' });

        if (draftStatus) {
            req.data.Status_ID = draftStatus.ID;
        }

    });

    // Auto-create Approval based on Employee Manager
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

        await INSERT.into(Approvals).entries({
            ID: cds.utils.uuid(),
            Request_ID: data.ID,
            Approver_ID: employee.Manager_ID
        });

    });

    // Submit Request
    this.on('submitRequest', async (req) => {

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
            return req.error(400, 'SUBMITTED status not configured');
        }

        const year = new Date().getFullYear();

        const allRequests = await SELECT.from(Requests);

        const nextNumber = allRequests.length + 1;

        const requestNumber =
            `REQ-${year}-${String(nextNumber).padStart(4, '0')}`;

        await UPDATE(Requests)
            .set({
                RequestNumber: requestNumber,
                Status_ID: submittedStatus.ID
            })
            .where({
                ID: requestId
            });

        return `Request submitted successfully : ${requestNumber}`;

    });

    // Approve Request
    this.on('approveRequest', async (req) => {

        const approvedStatus = await SELECT.one
            .from(RequestStatuses)
            .where({ Code: 'APPROVED' });

        if (!approvedStatus) {
            return req.error(400, 'APPROVED status not configured');
        }

        await UPDATE(Requests)
            .set({
                Status_ID: approvedStatus.ID
            })
            .where({
                ID: req.data.requestID
            });

        return 'Request Approved';

    });

    // Reject Request
    this.on('rejectRequest', async (req) => {

        const rejectedStatus = await SELECT.one
            .from(RequestStatuses)
            .where({ Code: 'REJECTED' });

        if (!rejectedStatus) {
            return req.error(400, 'REJECTED status not configured');
        }

        await UPDATE(Requests)
            .set({
                Status_ID: rejectedStatus.ID
            })
            .where({
                ID: req.data.requestID
            });

        return 'Request Rejected';

    });

    // Dashboard Statistics
    this.on('getDashboardStats', async () => {

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