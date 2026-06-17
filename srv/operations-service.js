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

    const defaultPriority = await SELECT.one
        .from('enterprise.operations.Priority')
        .where({ Code: 'MEDIUM' });

   if (!req.data.Priority_ID && defaultPriority) {
    req.data.Priority_ID = defaultPriority.ID;
}

const defaultRequestType = await SELECT.one
    .from('enterprise.operations.RequestType')
    .where({ Code: 'LAPTOP' });

if (!req.data.RequestType_ID && defaultRequestType) {
    req.data.RequestType_ID = defaultRequestType.ID;
}

    if (!req.data.Title || req.data.Title.trim() === '') {
        return req.error(400, 'Title is mandatory');
    }

   if (!req.data.Description || req.data.Description.trim() === '') {
    return req.error(400, 'Description is mandatory');
}

if (!req.data.Employee_ID) {
    return req.error(400, 'Employee is mandatory');
}

const employee = await SELECT.one
    .from(Employees)
    .where({ ID: req.data.Employee_ID });

if (!employee) {
    return req.error(400, 'Invalid Employee');
}

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

});

// =====================================================
// AFTER UPDATE
// =====================================================
this.after('UPDATE', 'Requests', async (data) => {

    console.log(`Request Updated : ${data.ID}`);

});

// =====================================================
// CREATE REQUEST
// =====================================================
this.on('createRequest', async (req) => {

    const year = new Date().getFullYear();

const requestCount = await SELECT.from(Requests);

const requestNumber =
    `REQ-${year}-${String(requestCount.length + 1).padStart(4, '0')}`;

    return await this.run(
    INSERT.into(Requests).entries({
        ID: cds.utils.uuid(),
        Title: req.data.title,
        Description: req.data.description,
        Employee_ID: req.data.employeeID,
        Priority_ID: req.data.priorityID,
        RequestType_ID: req.data.requestTypeID
    })
);
    const employee = await SELECT.one
    .from(Employees)
    .where({ ID: req.data.employeeID });

const pendingDecision = await SELECT.one
    .from(ApprovalDecisions)
    .where({ Code: 'PENDING' });

await INSERT.into(Approvals).entries({
    ID: cds.utils.uuid(),
    Request_ID: newRequestId,
    Approver_ID: employee.Manager_ID,
    Decision_ID: pendingDecision.ID
});

    return 'Request Created';

});

// =====================================================
// SUBMIT REQUEST
// =====================================================
this.on('submitRequest', 'Requests', async (req) => {

    const requestId = req.params[0].ID;

    const requestData = await SELECT.one
        .from(Requests)
        .where({ ID: requestId });

    if (!requestData) {
        return req.error(404, 'Request not found');
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
// =====================================================
// APPROVE
// =====================================================
this.on('approve', 'Approvals', async (req) => {

    const approvalID = req.params[1].ID;

    const approval = await SELECT.one
        .from(Approvals)
        .where({ ID: approvalID });

    if (!approval) {
        return req.error(404, 'Approval not found');
    }

    const approvedDecision = await SELECT.one
        .from(ApprovalDecisions)
        .where({ Code: 'APPROVED' });

    const approvedStatus = await SELECT.one
        .from(RequestStatuses)
        .where({ Code: 'APPROVED' });

    await UPDATE(Approvals)
        .set({
            Decision_ID: approvedDecision.ID,
            ApprovedAt: new Date(),
            Comments: 'Approved'
        })
        .where({
            ID: approvalID
        });

    await UPDATE(Requests)
        .set({
            Status_ID: approvedStatus.ID
        })
        .where({
            ID: approval.Request_ID
        });

    return 'Approved Successfully';
});
// =====================================================
// REJECT REQUEST
// =====================================================
this.on('rejectApproval', 'Approvals', async (req) => {

    const approvalID = req.params[1].ID;

    const approval = await SELECT.one
        .from(Approvals)
        .where({ ID: approvalID });

    if (!approval) {
        return req.error(404, 'Approval not found');
    }

    const rejectedDecision = await SELECT.one
        .from(ApprovalDecisions)
        .where({ Code: 'REJECTED' });

    const rejectedStatus = await SELECT.one
        .from(RequestStatuses)
        .where({ Code: 'REJECTED' });

    await UPDATE(Approvals)
        .set({
            Decision_ID: rejectedDecision.ID,
            ApprovedAt: new Date(),
            Comments: 'Rejected'
        })
        .where({
            ID: approvalID
        });

    await UPDATE(Requests)
        .set({
            Status_ID: rejectedStatus.ID
        })
        .where({
            ID: approval.Request_ID
        });

    return 'Rejected Successfully';
});


// =====================================================
// DASHBOARD STATS
// =====================================================
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