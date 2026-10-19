namespace asset.lifecycle.db;

using {
    managed,
    cuid
} from '@sap/cds/common';

/* =====================================================
   DEPARTMENTS
   ===================================================== */

entity Departments : cuid, managed {

    departmentName : String(100) @title : 'Department Name';
    costCenter     : String(50)  @title : 'Cost Center';
    isActive       : Boolean default true @title : 'Active';
    employees      : Association to many Employees
                        on employees.department = $self;
}

/* =====================================================
   EMPLOYEES
   ===================================================== */

entity Employees : cuid, managed {
employeeNumber : String(20) @title : 'Employee Number';
fullName       : String(100) @title : 'Full Name';
email          : String(100) @title : 'Email Address';
phone          : String(20) @title : 'Phone Number';
location       : String(100) @title : 'Office Location';
status         : String(20) @title : 'Employee Status';
role           : String(20) @title : 'Role';     // ADMIN, MANAGER, EMPLOYEE
department     : Association to Departments;
}

/* =====================================================
   ASSET CATEGORIES
   ===================================================== */

entity AssetCategories : cuid, managed {

    categoryName   : String(100) @title : 'Category Name';
    lifespanMonths : Integer     @title : 'Lifespan (Months)';
    active         : Boolean default true @title : 'Active';
    assets         : Association to many Assets
                        on assets.category = $self;
}
/* =====================================================
   VENDORS
   ===================================================== */

entity Vendors : cuid, managed {

    vendorName : String(100) @title : 'Vendor Name';
    email      : String(100) @title : 'Email Address';
    phone      : String(20)  @title : 'Phone Number';
    address    : String(255) @title : 'Address';
}

/* =====================================================
   ASSETS
   ===================================================== */

entity Assets : cuid, managed {

    assetTag              : String(50)  @title : 'Asset Tag';
    serialNumber          : String(50)  @title : 'Serial Number';
    model                 : String(100) @title : 'Model';
    description           : String(255) @title : 'Description';
    purchaseDate          : Date @title : 'Purchase Date';
    purchaseCost          : Decimal(15,2) @title : 'Purchase Cost';
    warrantyExpiry        : Date @title : 'Warranty Expiry';
    firstDistributionDate : Date @title : 'First Distribution Date';
    status : String(30)
         default 'AVAILABLE'
         @title : 'Asset Status';
      category              : Association to AssetCategories;
    vendor                : Association to Vendors;
    currentHolder         : Association to Employees;
    assignments           : Composition of many AssetAssignments
                                on assignments.asset = $self;
    maintenanceRecords    : Composition of many MaintenanceRecords
                                on maintenanceRecords.asset = $self;
    ownershipHistory      : Composition of many OwnershipLedgers
                              on ownershipHistory.asset = $self;
    archiveRecords        : Composition of many ArchiveRecords
                                on archiveRecords.asset = $self;
}

/* =====================================================
   ASSET ASSIGNMENTS
   ===================================================== */

entity AssetAssignments : cuid, managed {

    asset              : Association to Assets;
    employee           : Association to Employees;
    assignedDate       : Date;
    expectedReturnDate : Date;
    actualReturnDate   : Date;
    assignmentStatus   : String(30);
    // ASSIGNED
    // RETURNED
    // OVERDUE
}

/* =====================================================
   OWNERSHIP LEDGER
   ===================================================== */

entity OwnershipLedgers : cuid, managed {

    asset             : Association to Assets;
    action            : String(30);
    // ASSIGN
    // TRANSFER
    // RETURN
    // RETIRE
    // ARCHIVE
    fromEmployee      : Association to Employees;
    toEmployee        : Association to Employees;
    transitionDate    : Timestamp;
}

/* =====================================================
   MAINTENANCE RECORDS
   ===================================================== */

entity MaintenanceRecords : cuid, managed {

    asset             : Association to Assets;
    serviceVendor     : Association to Vendors;
    maintenanceType   : String(50);
    issueDescription  : String(500);
    reportedDate      : Date;
    completedDate     : Date;
    status            : String(30);
    // OPEN
    // IN_PROGRESS
    // COMPLETED
}

/* =====================================================
   ARCHIVE RECORDS
   ===================================================== */

entity ArchiveRecords : cuid, managed {

    asset             : Association to Assets;
    archivedAt        : Timestamp;
    archivedBy        : String(100);
    reason            : String(500);
    disposalMethod    : String(100);
}

entity AssetRequests : cuid, managed {

    employee           : Association to Employees;
    requestedCategory  : Association to AssetCategories;

    employeeName       : String(100);
    categoryName       : String(100);

    requestedBy        : Association to Employees;

    justification      : String(500) @title : 'Business Justification';

    status             : String(20)
                         default 'PENDING'
                         @title : 'Request Status';

    approvalDate       : Date @title : 'Approval Date';

    remarks            : String(500) @title : 'Remarks';
}
/* =====================================================
   DASHBOARD - STATUS CHART
   ===================================================== */

entity AssetStatusChart {
    key status      : String(30);
    assetCount      : Integer;
}

/* =====================================================
   DASHBOARD - CATEGORY CHART
   ===================================================== */

entity AssetCategoryChart {
    key categoryName : String(100);
    assetCount       : Integer;
}

/* =====================================================
   DASHBOARD - DEPARTMENT CHART
   ===================================================== */

entity DepartmentAssetChart {
    key departmentName : String(100);
    assetCount         : Integer;
}

/* =====================================================
   DASHBOARD - KPI ENTITY
   ===================================================== */

entity AssetKPIs {

    key KPI_ID           : UUID;
    totalAssets          : Integer;
    availableAssets      : Integer;
    assignedAssets       : Integer;
    maintenanceAssets    : Integer;
    retiredAssets        : Integer;
    archivedAssets       : Integer;
}