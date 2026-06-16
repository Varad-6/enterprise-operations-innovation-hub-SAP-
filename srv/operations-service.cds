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

@cds.redirection.target
entity Requests as projection on db.Request;

entity Approvals as projection on db.Approval;

entity RequestComments as projection on db.RequestComment;

entity Documents as projection on db.Document;

action submitRequest(
    requestID : UUID
) returns String;

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
