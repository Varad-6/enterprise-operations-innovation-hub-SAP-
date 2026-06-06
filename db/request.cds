namespace enterprise.operations;

using { managed } from '@sap/cds/common';
using { enterprise.operations.Employee } from './employee';

entity RequestStatus : managed {

    key ID          : UUID;

    Code            : String(20);

    Name            : String(100);

    Description     : String(500);

}

entity RequestType : managed {

    key ID          : UUID;

    Code            : String(20);

    Name            : String(100);

    Description     : String(500);

}

entity Priority : managed {

    key ID          : UUID;

    Code            : String(20);

    Name            : String(100);

    Description     : String(500);

}

entity ApprovalDecision : managed {

    key ID          : UUID;

    Code            : String(20);

    Name            : String(100);

    Description     : String(500);

}

entity Request : managed {

    key ID              : UUID;

    RequestNumber       : String(20);

    Title               : String(200);

    Description         : String(2000);

    Employee            : Association to Employee;

    RequestType         : Association to RequestType;

    Status              : Association to RequestStatus;

    Priority            : Association to Priority;

    Approvals           : Composition of many Approval
                          on Approvals.Request = $self;

    Comments            : Composition of many RequestComment
                          on Comments.Request = $self;

    Documents           : Composition of many Document
                          on Documents.Request = $self;

}

entity Approval : managed {

    key ID              : UUID;

    Request             : Association to Request;

    Approver            : Association to Employee;

    Decision            : Association to ApprovalDecision;

    Comments            : String(1000);

    ApprovedAt          : Timestamp;

}

entity RequestComment : managed {

    key ID              : UUID;

    CommentText         : String(2000);

    Request             : Association to Request;

}

entity Document : managed {

    key ID              : UUID;

    FileName            : String(255);

    FileType            : String(50);

    StorageURL          : String(1000);

    Request             : Association to Request;

}