using { asset.lifecycle.db as db } from '../db/schema';

service AssetManagerService {

    /* =========================================
       EMPLOYEE MANAGEMENT
       ========================================= */

    entity Employees as projection on db.Employees;

    entity Departments as projection on db.Departments;

    /* =========================================
       REFERENCE DATA (READ ONLY)
       ========================================= */

    entity AssetCategories as projection on db.AssetCategories;

    entity Assets as projection on db.Assets;

    /* =========================================
       REQUEST MANAGEMENT
       ========================================= */

@odata.draft.enabled
entity AssetRequests as projection on db.AssetRequests;
    action CreateAssetRequest(
        employeeID    : UUID,
        categoryID    : UUID,
        justification : String
    );

}