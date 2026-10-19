const cds = require('@sap/cds');

module.exports = cds.service.impl(function () {

const {
    AssetRequests,
    Assets,
    Employees,
    AssetAssignments,
    OwnershipLedgers,
    MaintenanceRecords,
    ArchiveRecords
} = this.entities;
this.on('ApproveAssetRequest', async (req) => {

    console.log('APPROVE CLICKED');

    const requestID = req.params[0].ID;

    const result = await cds.tx(req).run(
        UPDATE('asset.lifecycle.db.AssetRequests')
            .set({
                status: 'APPROVED',
                approvalDate: new Date()
            })
            .where({ ID: requestID })
    );

    console.log('Rows Updated =', result);

    return 'Approved';
});

this.on('RejectAssetRequest', async (req) => {

    console.log('REJECT CLICKED');
    console.log(req.data);
    console.log('Remarks =', req.data.remarks);

    const requestID = req.params[0].ID;

    const result = await cds.tx(req).run(
        UPDATE('asset.lifecycle.db.AssetRequests')
            .set({
                status: 'REJECTED',
                remarks: req.data.remarks
            })
            .where({ ID: requestID })
    );

    console.log('Rows Updated =', result);

    return 'Rejected';
});
this.on('TransferAsset', async (req) => {

    console.log('TRANSFER CLICKED');
    console.log(req.params);
    console.log(req.data);

    const assetID = req.params[0].ID;

    const { toEmployeeID } = req.data;

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

    return 'Transferred';
});

this.on('CompleteMaintenance', async (req) => {

    const assetID = req.params[0].ID;

    const maintenance = await SELECT.one
        .from(MaintenanceRecords)
        .where({
            asset_ID: assetID,
            status: 'OPEN'
        });

    if (!maintenance) {
        req.error('No open maintenance record found');
    }

    await UPDATE(MaintenanceRecords)
        .set({
            status: 'COMPLETED',
            completedDate: new Date()
        })
        .where({ ID: maintenance.ID });

    await UPDATE(Assets)
        .set({
            status: 'AVAILABLE'
        })
        .where({ ID: assetID });

    return 'Maintenance Completed';
});

this.on('RetireAsset', async (req) => {

    console.log('RETIRE CLICKED');

    const assetID = req.params[0].ID;

    const { reason } = req.data;

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

this.on('ArchiveAsset', async (req) => {

    console.log('ARCHIVE CLICKED');

    const assetID = req.params[0].ID;

    const { reason } = req.data;

    const asset = await SELECT.one
        .from(Assets)
        .where({ ID: assetID });

    if (!asset) {
        req.error('Asset not found');
    }

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
        reason: reason
    });

    await INSERT.into(OwnershipLedgers).entries({
        asset_ID: assetID,
        action: 'ARCHIVE',
        transitionDate: new Date()
    });

    console.log('ARCHIVED SUCCESSFULLY');

    return 'Asset Archived Successfully';
});

this.on('ReturnAsset', async (req) => {

    console.log('RETURN CLICKED');

    const assetID = req.params[0].ID;

    const { returnDate } = req.data;

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

    return 'Returned';
});

this.on('SendForMaintenance', async (req) => {

    console.log('MAINTENANCE CLICKED');

    const assetID = req.params[0].ID;

    const { issueDescription } = req.data;

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

    return 'Asset Sent For Maintenance';
});

this.on('AssignAsset', async (req) => {

    console.log('ASSIGN CLICKED');
    console.log(req.params);
    console.log(req.data);

    const assetID = req.params[0].ID;

    const {
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

    return 'Asset Assigned Successfully';
});

});