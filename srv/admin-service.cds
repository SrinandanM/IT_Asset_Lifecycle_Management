using { asset.lifecycle.db as db } from '../db/schema';

service AssetAdminService {

    /* =========================================
       MASTER DATA
       ========================================= */
entity Departments as projection on db.Departments;

entity Employees as projection on db.Employees;

entity Vendors as projection on db.Vendors;

entity AssetCategories as projection on db.AssetCategories;

    /* =========================================
       ASSET MANAGEMENT
       ========================================= */
@odata.draft.enabled
entity Assets as projection on db.Assets {
    *,
    currentHolder.fullName as currentHolderName,
} actions {

action AssignAsset(
    employeeID   : UUID,
    assignedDate : Date
);

    action TransferAsset(
        toEmployeeID : UUID,
        transferDate : Date
    );
  
    action ReturnAsset(
        returnDate : Date
    );

    action SendForMaintenance(
        issueDescription : String @title : 'What was the issue?'
    );

    action CompleteMaintenance();

    action RetireAsset(
        reason : String @title : 'Reason for retiring the asset'
    );

    action ArchiveAsset(
        reason : String @title : 'Reason for archiving the asset'
    );

};

    entity AssetAssignments     as projection on db.AssetAssignments;
    entity OwnershipLedgers     as projection on db.OwnershipLedgers;
    entity MaintenanceRecords   as projection on db.MaintenanceRecords;
    entity ArchiveRecords       as projection on db.ArchiveRecords;
entity AssetRequests as projection on db.AssetRequests {
    *,
    employee.fullName              as employeeName,
    requestedCategory.categoryName as categoryName
} actions {

    action ApproveAssetRequest();

    action RejectAssetRequest(
        remarks : String
    );
};

    /* =========================================
       ASSET LIFECYCLE ACTIONS
       ========================================= */


/* =========================================
   DASHBOARD
   ========================================= */

entity AssetStatusChart      as projection on db.AssetStatusChart;
entity AssetCategoryChart    as projection on db.AssetCategoryChart;
entity DepartmentAssetChart  as projection on db.DepartmentAssetChart;
entity AssetKPIs             as projection on db.AssetKPIs;

action RefreshDashboard();

    /* =========================================
       REPORTS & PDF
       ========================================= */

type DownloadReportResult {
    content: String;
    filename: String;
    type: String;
};

type ShareReportResult {
    success: Boolean;
    message: String;
    timestamp: String;
};

action DownloadReport(reportType: String) returns DownloadReportResult;
action ShareReport(email: String, reportType: String) returns ShareReportResult;
}
