using { enterprise.operations as db } from '../db/schema';

type DashboardStats {
    TotalRequests    : Integer;
    PendingRequests  : Integer;
    ApprovedRequests : Integer;
    RejectedRequests : Integer;
}

service OperationsService {

    entity Departments as projection on db.Department;

    entity Employees as projection on db.Employee;

    entity RequestTypes as projection on db.RequestType;

    entity RequestStatuses as projection on db.RequestStatus;

    entity Priorities as projection on db.Priority;

    entity ApprovalDecisions as projection on db.ApprovalDecision;

    entity Requests as projection on db.Request actions {

        action submitRequest() returns String;

    };

entity Approvals as projection on db.Approval actions {

    action approve() returns String;

    action reject() returns String;

};
    entity RequestComments as projection on db.RequestComment;

    entity Documents as projection on db.Document;

    action approveRequest(
        requestID : UUID
    ) returns String;

    action rejectRequest(
        requestID : UUID
    ) returns String;

    action getDashboardStats()
        returns DashboardStats;

}

annotate OperationsService.Requests with @(
    Capabilities.InsertRestrictions : {
        Insertable : true
    }
);