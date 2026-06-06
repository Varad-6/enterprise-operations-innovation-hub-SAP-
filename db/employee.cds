namespace enterprise.operations;

using { managed } from '@sap/cds/common';

entity Department : managed {

    key ID              : UUID;

    DepartmentCode      : String(10);

    Name                : String(100);

    Description         : String(500);

    Employees           : Composition of many Employee
                          on Employees.Department = $self;

}

entity Employee : managed {

    key ID              : UUID;

    EmployeeCode        : String(20);

    FirstName           : String(100);

    LastName            : String(100);

    Email               : String(255);

    IsActive            : Boolean default true;

    Department          : Association to Department;

    Manager             : Association to Employee;

}