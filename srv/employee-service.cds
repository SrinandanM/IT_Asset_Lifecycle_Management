using { asset.lifecycle.db as db } from '../db/schema';

service AssetEmployeeService {

    /* =========================================
       EMPLOYEE SELF SERVICE
       ========================================= */

    entity Assets as projection on db.Assets;

    entity AssetAssignments as projection on db.AssetAssignments;

    entity AssetCategories as projection on db.AssetCategories;

}