const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    const {
        Requests,
        RequestStatuses,
        Employees,
        Approvals
    } = this.entities;

    // Default Status = DRAFT
    this.before('CREATE', 'Requests', async (req) => {

        const draftStatus = await SELECT.one
            .from(RequestStatuses)
            .where({ Code: 'DRAFT' });

        if (draftStatus) {
            req.data.Status_ID = draftStatus.ID;
        }

    });

    // Auto Create Approval based on Manager
    this.after('CREATE', 'Requests', async (data) => {

        if (!data.Employee_ID) {
            return;
        }

        const employee = await SELECT.one
            .from(Employees)
            .where({ ID: data.Employee_ID });

        if (!employee) {
            return;
        }

        if (!employee.Manager_ID) {
            return;
        }

        await INSERT.into(Approvals).entries({
            ID: cds.utils.uuid(),
            Request_ID: data.ID,
            Approver_ID: employee.Manager_ID
        });

    });

    // Submit Request Action
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

        return {
            message: `Request submitted successfully : ${requestNumber}`
        };

    });

});