console.log('CAT SERVICE FILE LOADED');

const cds = require('@sap/cds');
console.log('CAT SERVICE FILE LOADED');


module.exports = cds.service.impl(async function () {

    this.before('*', req => {
        console.log(
            'EVENT =', req.event,
            'TARGET =', req.target?.name
        );
    });
this.before(['NEW', 'CREATE', 'PATCH'], 'AssetRequests.drafts', async (req) => {

    console.log('DRAFT EVENT:', req.event);
    console.log('DRAFT DATA:', req.data);

});
 const {
    Assets,
    Employees,
    AssetCategories,
    AssetAssignments,
    OwnershipLedgers,
    MaintenanceRecords,
    ArchiveRecords,
    AssetRequests
} = this.entities;

this.before('CREATE', 'Employees', async (req) => {

    const existingEmployee =
        await SELECT.one
            .from(Employees)
            .where({
                employeeNumber:
                req.data.employeeNumber
            });

    if (existingEmployee) {

req.reject(
    400,
    'Employee Number already exists'
);

    }

    const existingEmail =
        await SELECT.one
            .from(Employees)
            .where({
                email: req.data.email
            });

    if (existingEmail) {

req.reject(
    400,
    'Email already exists'
);

    }

});

    /* =====================================================
       ASSET VALIDATIONS
       ===================================================== */

    this.before(['CREATE', 'UPDATE'], 'Assets', async (req) => {

        const { assetTag, serialNumber } = req.data;

        if (assetTag) {
            const existingTag = await SELECT.one.from(Assets)
                .where({ assetTag });

            if (existingTag && existingTag.ID !== req.data.ID) {
                req.error('Asset Tag already exists');
            }
        }

        if (serialNumber) {
            const existingSerial = await SELECT.one.from(Assets)
                .where({ serialNumber });

            if (existingSerial && existingSerial.ID !== req.data.ID) {
                req.error('Serial Number already exists');
            }
        }

        if (
            req.data.purchaseDate &&
            req.data.firstDistributionDate &&
            new Date(req.data.firstDistributionDate) <
            new Date(req.data.purchaseDate)
        ) {
            req.error('Distribution date cannot be before Purchase Date');
        }
    });

this.before('SAVE', 'AssetRequests', async (req) => {

    console.log('SAVE EVENT');
    console.log(req.data);

    if (!req.data.employee_ID || !req.data.requestedCategory_ID) {
        return;
    }

    const employee = await SELECT.one
        .from(Employees)
        .where({ ID: req.data.employee_ID });

    const category = await SELECT.one
        .from('asset.lifecycle.db.AssetCategories')
        .where({ ID: req.data.requestedCategory_ID });

    req.data.employeeName = employee?.fullName;
    req.data.categoryName = category?.categoryName;
    req.data.status = 'PENDING';

    console.log('employeeName =', req.data.employeeName);
    console.log('categoryName =', req.data.categoryName);
});
    /* =====================================================
       MANAGER ACTION
       CREATE ASSET REQUEST
       ===================================================== */

this.on('CreateAssetRequest', async (req) => {

    const {
        employeeID,
        categoryID,
        justification
    } = req.data;

    const employee = await SELECT.one
        .from(Employees)
        .where({ ID: employeeID });

    const category = await SELECT.one
        .from('asset.lifecycle.db.AssetCategories')
        .where({ ID: categoryID });

    const result = await INSERT.into(AssetRequests).entries({

        employee_ID: employeeID,
        requestedCategory_ID: categoryID,

        employeeName: employee?.fullName,
        categoryName: category?.categoryName,

        justification,
        status: 'PENDING'
    });

    return result;
});


    /* =====================================================
       ADMIN ACTION
       APPROVE REQUEST
       ===================================================== */

    this.on('ApproveAssetRequest', async (req) => {

        const { requestID } = req.data;

    await UPDATE(AssetRequests)
        .set({
        status: 'APPROVED',
        approvalDate: new Date(),
        approvedBy: 'ADMIN'
    })
    .where({ ID: requestID });


        return {
            message: 'Request Approved'
        };
    });


    /* =====================================================
       ADMIN ACTION
       REJECT REQUEST
       ===================================================== */

    this.on('RejectAssetRequest', async (req) => {

        const { requestID, remarks } = req.data;

        await UPDATE(AssetRequests)
            .set({
                status: 'REJECTED',
                remarks
            })
            .where({ ID: requestID });

        return {
            message: 'Request Rejected'
        };
    });


    /* =====================================================
       ASSIGN ASSET
       ===================================================== */

    this.on('AssignAsset', async (req) => {

        const {
            assetID,
            employeeID,
            assignedDate
        } = req.data;

        const asset = await SELECT.one
            .from(Assets)
            .where({ ID: assetID });

        if (!asset) {
            req.error('Asset not found');
        }

        if (asset.status !== 'AVAILABLE') {
            req.error('Asset is not available');
        }

        const employee = await SELECT.one
            .from(Employees)
            .where({ ID: employeeID });

        if (!employee) {
            req.error('Employee not found');
        }

        if (employee.status !== 'ACTIVE') {
            req.error('Employee is not active');
        }

        await INSERT.into(AssetAssignments).entries({
            asset_ID: assetID,
            employee_ID: employeeID,
            assignedDate,
            assignmentStatus: 'ASSIGNED'
        });

        await UPDATE(Assets)
            .set({
                status: 'ASSIGNED',
                currentHolder_ID: employeeID
            })
            .where({ ID: assetID });

        await INSERT.into(OwnershipLedgers).entries({
            asset_ID: assetID,
            action: 'ASSIGN',
            toEmployee_ID: employeeID,
            transitionDate: new Date()
        });

        return {
            message: 'Asset Assigned Successfully'
        };
    });


    /* =====================================================
       TRANSFER ASSET
       ===================================================== */

    this.on('TransferAsset', async (req) => {

        const {
            assetID,
            toEmployeeID
        } = req.data;

        const asset = await SELECT.one
            .from(Assets)
            .where({ ID: assetID });

        const previousOwner = asset.currentHolder_ID;

        await UPDATE(Assets)
            .set({
                currentHolder_ID: toEmployeeID
            })
            .where({ ID: assetID });

        await INSERT.into(OwnershipLedgers).entries({
            asset_ID: assetID,
            action: 'TRANSFER',
            fromEmployee_ID: previousOwner,
            toEmployee_ID: toEmployeeID,
            transitionDate: new Date()
        });

        return {
            message: 'Asset Transferred Successfully'
        };
    });


    /* =====================================================
       RETURN ASSET
       ===================================================== */

    this.on('ReturnAsset', async (req) => {

        const {
            assetID,
            returnDate
        } = req.data;

        await UPDATE(Assets)
            .set({
                status: 'AVAILABLE',
                currentHolder_ID: null
            })
            .where({ ID: assetID });

        await UPDATE(AssetAssignments)
            .set({
                actualReturnDate: returnDate,
                assignmentStatus: 'RETURNED'
            })
            .where({
                asset_ID: assetID,
                assignmentStatus: 'ASSIGNED'
            });

        await INSERT.into(OwnershipLedgers).entries({
            asset_ID: assetID,
            action: 'RETURN',
            transitionDate: new Date()
        });

        return {
            message: 'Asset Returned Successfully'
        };
    });


    /* =====================================================
       SEND FOR MAINTENANCE
       ===================================================== */

    this.on('SendForMaintenance', async (req) => {

        const {
            assetID,
            issueDescription
        } = req.data;

        await UPDATE(Assets)
            .set({
                status: 'MAINTENANCE'
            })
            .where({ ID: assetID });

        await INSERT.into(MaintenanceRecords).entries({
            asset_ID: assetID,
            issueDescription,
            reportedDate: new Date(),
            status: 'OPEN'
        });

        return {
            message: 'Asset Sent For Maintenance'
        };
    });


    /* =====================================================
       COMPLETE MAINTENANCE
       ===================================================== */

    this.on('CompleteMaintenance', async (req) => {

        const { maintenanceID } = req.data;

        const maintenance = await SELECT.one
            .from(MaintenanceRecords)
            .where({ ID: maintenanceID });

        await UPDATE(MaintenanceRecords)
            .set({
                status: 'COMPLETED',
                completedDate: new Date()
            })
            .where({ ID: maintenanceID });

        await UPDATE(Assets)
            .set({
                status: 'AVAILABLE'
            })
            .where({
                ID: maintenance.asset_ID
            });

        return {
            message: 'Maintenance Completed'
        };
    });


    /* =====================================================
       RETIRE ASSET
       ===================================================== */

    this.on('RetireAsset', async (req) => {

        const {
            assetID,
            reason
        } = req.data;

        const asset = await SELECT.one
            .from(Assets)
            .where({ ID: assetID });

        if (asset.status === 'ASSIGNED') {
            req.error('Assigned Assets cannot be retired');
        }

        await UPDATE(Assets)
            .set({
                status: 'RETIRED'
            })
            .where({ ID: assetID });

        await INSERT.into(OwnershipLedgers).entries({
            asset_ID: assetID,
            action: 'RETIRE',
            transitionDate: new Date()
        });

        return {
            message: reason
        };
    });


    /* =====================================================
       ARCHIVE ASSET
       ===================================================== */

    this.on('ArchiveAsset', async (req) => {

        const {
            assetID,
            reason
        } = req.data;

        const asset = await SELECT.one
            .from(Assets)
            .where({ ID: assetID });

        if (asset.status !== 'RETIRED') {
            req.error('Only retired assets can be archived');
        }

        await UPDATE(Assets)
            .set({
                status: 'ARCHIVED'
            })
            .where({ ID: assetID });

        await INSERT.into(ArchiveRecords).entries({
            asset_ID: assetID,
            archivedAt: new Date(),
            archivedBy: 'ADMIN',
            reason
        });

        await INSERT.into(OwnershipLedgers).entries({
            asset_ID: assetID,
            action: 'ARCHIVE',
            transitionDate: new Date()
        });

        return {
            message: 'Asset Archived Successfully'
        };
    });


    /* =====================================================
       PROTECT OWNERSHIP LEDGER
       ===================================================== */

        this.before(['UPDATE', 'DELETE'], 'OwnershipLedgers', req => {
        req.error('Ownership Ledger is read-only');
    });

    /* =====================================================
       REFRESH DASHBOARD
       ===================================================== */

    this.on('RefreshDashboard', async () => {

        const totalAssets =
            await SELECT.from(Assets);

        const availableAssets =
            await SELECT.from(Assets)
                .where({ status: 'AVAILABLE' });

        const assignedAssets =
            await SELECT.from(Assets)
                .where({ status: 'ASSIGNED' });

        const maintenanceAssets =
            await SELECT.from(Assets)
                .where({ status: 'MAINTENANCE' });

        const retiredAssets =
            await SELECT.from(Assets)
                .where({ status: 'RETIRED' });

        const archivedAssets =
            await SELECT.from(Assets)
                .where({ status: 'ARCHIVED' });

        await DELETE.from('asset.lifecycle.db.AssetKPIs');

        await INSERT.into('asset.lifecycle.db.AssetKPIs').entries({
            KPI_ID: cds.utils.uuid(),
            totalAssets: totalAssets.length,
            availableAssets: availableAssets.length,
            assignedAssets: assignedAssets.length,
            maintenanceAssets: maintenanceAssets.length,
            retiredAssets: retiredAssets.length,
            archivedAssets: archivedAssets.length
        });

        return {
            message: 'Dashboard Refreshed Successfully'
        };
    });

});