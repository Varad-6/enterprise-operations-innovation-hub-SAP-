using OperationsService as service from '../../srv/operations-service';

annotate service.Requests with @(

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Request Number',
            Value : RequestNumber
        },
        {
            $Type : 'UI.DataField',
            Label : 'Title',
            Value : Title
        },
        {
            $Type : 'UI.DataField',
            Label : 'Description',
            Value : Description
        }
    ],

    UI.FieldGroup #GeneralInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            { $Type : 'UI.DataField', Label : 'Request Number', Value : RequestNumber },
            { $Type : 'UI.DataField', Label : 'Title', Value : Title },
            { $Type : 'UI.DataField', Label : 'Description', Value : Description }
        ]
    },

    UI.FieldGroup #RequestDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            { $Type : 'UI.DataField', Label : 'Status', Value : Status.Name },
            { $Type : 'UI.DataField', Label : 'Priority', Value : Priority.Name },
            { $Type : 'UI.DataField', Label : 'Request Type', Value : RequestType.Name }
        ]
    },

    UI.FieldGroup #EmployeeInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            { $Type : 'UI.DataField', Label : 'Employee Code', Value : Employee.EmployeeCode },
            { $Type : 'UI.DataField', Label : 'First Name', Value : Employee.FirstName },
            { $Type : 'UI.DataField', Label : 'Last Name', Value : Employee.LastName },
            { $Type : 'UI.DataField', Label : 'Email', Value : Employee.Email },
            { $Type : 'UI.DataField', Label : 'Department', Value : Employee.Department.Name }
        ]
    },

    UI.FieldGroup #ManagerInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            { $Type : 'UI.DataField', Label : 'Manager Code', Value : Employee.Manager.EmployeeCode },
            { $Type : 'UI.DataField', Label : 'Manager First Name', Value : Employee.Manager.FirstName },
            { $Type : 'UI.DataField', Label : 'Manager Last Name', Value : Employee.Manager.LastName },
            { $Type : 'UI.DataField', Label : 'Manager Email', Value : Employee.Manager.Email }
        ]
    },

    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'OperationsService.createRequest',
            Label : 'Create Request'
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'OperationsService.submitRequest',
            Label : 'Submit Request'
        }
    ],

    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneralInformation',
            Label : 'Request Information',
            Target : '@UI.FieldGroup#GeneralInformation'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'RequestDetails',
            Label : 'Request Details',
            Target : '@UI.FieldGroup#RequestDetails'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'EmployeeInformation',
            Label : 'Employee Information',
            Target : '@UI.FieldGroup#EmployeeInformation'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'ManagerInformation',
            Label : 'Manager Information',
            Target : '@UI.FieldGroup#ManagerInformation'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'Approvals',
            Label : 'Approvals',
            Target : 'Approvals/@UI.LineItem'
        }
    ],

    UI.CreateHidden : false

);

annotate service.Approvals with @(

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Request Number',
            Value : Request.RequestNumber
        },
        {
            $Type : 'UI.DataField',
            Label : 'Title',
            Value : Request.Title
        },
        {
            $Type : 'UI.DataField',
            Label : 'Approver',
            Value : Approver.FirstName
        },
        {
            $Type : 'UI.DataField',
            Label : 'Decision',
            Value : Decision.Name
        }
    ],

    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'OperationsService.approve',
            Label : 'Approve'
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'OperationsService.rejectApproval',
            Label : 'Reject'
        }
    ]

);