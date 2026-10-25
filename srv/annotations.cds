using AssetAdminService from './admin-service';
using AssetManagerService from './manager-service';
using AssetEmployeeService from './employee-service';

/* ===========================================================
   ASSETS - ADMIN
   =========================================================== */

annotate AssetAdminService.Assets with @(

    UI.Identification : [

        {
            $Type  : 'UI.DataFieldForAction',
            Label  : 'Assign Asset',
            Action : 'AssetAdminService.AssignAsset'
        },
        {
            $Type  : 'UI.DataFieldForAction',
            Label  : 'Return Asset',
            Action : 'AssetAdminService.ReturnAsset'
        },
        {
            $Type  : 'UI.DataFieldForAction',
            Label  : 'Send For Maintenance',
            Action : 'AssetAdminService.SendForMaintenance'
        },
        {
            $Type  : 'UI.DataFieldForAction',
            Label  : 'Retire Asset',
            Action : 'AssetAdminService.RetireAsset'
        },
        {
            $Type  : 'UI.DataFieldForAction',
            Label  : 'Archive Asset',
            Action : 'AssetAdminService.ArchiveAsset'
        },

        {
            $Type  : 'UI.DataFieldForAction',
            Label  : 'Complete Maintenance',
            Action : 'AssetAdminService.CompleteMaintenance'
        },
        {
            $Type  : 'UI.DataFieldForAction',
            Label  : 'Transfer Asset',
            Action : 'AssetAdminService.TransferAsset'
        },
        {
            $Type  : 'UI.DataFieldForAction',
            Label  : 'Download Report',
            Action : 'AssetAdminService.DownloadReport'
        },
        {
            $Type  : 'UI.DataFieldForAction',
            Label  : 'Share Report',
            Action : 'AssetAdminService.ShareReport'
        },
        {
            $Type : 'UI.DataField',
            Value : assetTag
        },
        {
            $Type : 'UI.DataField',
            Value : serialNumber
        },
        {
            $Type : 'UI.DataField',
            Value : model
        }
    ],

    UI.HeaderInfo : {
        TypeName : 'Asset',
        TypeNamePlural : 'Assets',
        Title : {
            Value : assetTag
        }
    },

    UI.SelectionFields : [
        assetTag,
        serialNumber,
        status,
        category,
        vendor,
        currentHolder
    ],

    UI.LineItem : [

        {
            $Type : 'UI.DataField',
            Label : 'Asset Tag',
            Value : assetTag
        },

        {
            $Type : 'UI.DataField',
            Label : 'Serial Number',
            Value : serialNumber
        },

        {
            $Type : 'UI.DataField',
            Label : 'Model',
            Value : model
        },

        {
            $Type : 'UI.DataField',
            Label : 'Status',
            Value : status
        },

        {
            $Type : 'UI.DataField',
            Label : 'Purchase Date',
            Value : purchaseDate
        },

{
    $Type : 'UI.DataField',
    Label : 'Current Holder',
    Value : currentHolderName
}

    ],

    UI.Facets : [

        {
            $Type : 'UI.ReferenceFacet',
            Label : 'General Information',
            Target : '@UI.FieldGroup#General'
        },

        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Procurement Information',
            Target : '@UI.FieldGroup#Procurement'
        }
    ],

UI.FieldGroup #General : {
    Data : [

        {
            $Type : 'UI.DataField',
            Label : 'Asset Tag',
            Value : assetTag
        },

        {
            $Type : 'UI.DataField',
            Label : 'Serial Number',
            Value : serialNumber
        },

        {
            $Type : 'UI.DataField',
            Label : 'Model',
            Value : model
        },

        {
            $Type : 'UI.DataField',
            Label : 'Description',
            Value : description
        },

        {
            $Type : 'UI.DataField',
            Label : 'Asset Status',
            Value : status
        },

        {
            $Type : 'UI.DataField',
            Label : 'Category',
            Value : category_ID
        },
        
    ]
},

    UI.FieldGroup #Procurement : {
        Data : [

            {
                $Type : 'UI.DataField',
                Value : purchaseDate
            },

            {
                $Type : 'UI.DataField',
                Value : purchaseCost
            },

            {
                $Type : 'UI.DataField',
                Value : warrantyExpiry
            },

            {
                $Type : 'UI.DataField',
                Label : 'Vendor',
                Value : vendor_ID
            }
        ]
    }
);
annotate AssetAdminService.Assets with {

    category @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'AssetCategories',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : category_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'categoryName'
            }
        ]
    };

    vendor @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Vendors',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : vendor_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'vendorName'
            }
        ]
    };

    currentHolder @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Employees',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : currentHolder_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'fullName'
            }
        ]
    };

};

annotate AssetAdminService.AssignAsset with @(
    cds.odata.bindingparameter.collection: true
);

annotate AssetAdminService.TransferAsset with @(
    cds.odata.bindingparameter.collection: true
);


/* ===========================================================
   EMPLOYEES - ADMIN
   =========================================================== */

annotate AssetAdminService.Employees with @(

    UI.HeaderInfo : {
        TypeName : 'Employee',
        TypeNamePlural : 'Employees',
        Title : {
            Value : fullName
        }
    },

    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Employee Information',
            Target : '@UI.FieldGroup#EmployeeInfo'
        }
    ],

    UI.FieldGroup #EmployeeInfo : {
        Data : [

            {
                $Type : 'UI.DataField',
                Value : employeeNumber
            },

            {
                $Type : 'UI.DataField',
                Value : fullName
            },

            {
                $Type : 'UI.DataField',
                Value : email
            },

            {
                $Type : 'UI.DataField',
                Value : phone
            },

            {
                $Type : 'UI.DataField',
                Value : location
            },

            {
                $Type : 'UI.DataField',
                Value : role
            },

            {
                $Type : 'UI.DataField',
                Value : status
            },
            {
                $Type : 'UI.DataField',
                Label : 'Department',
                Value : department_ID
            }
        ]
    },

    UI.SelectionFields : [
        employeeNumber,
        fullName,
        role,
        status
    ],

    UI.LineItem : [

        {
            $Type : 'UI.DataField',
            Label : 'Employee Number',
            Value : employeeNumber
        },

        {
            $Type : 'UI.DataField',
            Label : 'Full Name',
            Value : fullName
        },

        {
            $Type : 'UI.DataField',
            Label : 'Email Address',
            Value : email
        },

        {
            $Type : 'UI.DataField',
            Label : 'Phone Number',
            Value : phone
        },

        {
            $Type : 'UI.DataField',
            Label : 'Office Location',
            Value : location
        },

        {
            $Type : 'UI.DataField',
            Label : 'Role',
            Value : role
        },

        {
            $Type : 'UI.DataField',
            Label : 'Employee Status',
            Value : status
        },

        {
            $Type : 'UI.DataField',
            Label : 'Department',
            Value : department
        }
    ]
);
annotate AssetAdminService.Employees with {

    department @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Departments',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : department_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'departmentName'
            }
        ]
    };

};
/* ===========================================================
   DEPARTMENTS - ADMIN
   =========================================================== */

annotate AssetAdminService.Departments with @(

    UI.LineItem : [

        {
            $Type : 'UI.DataField',
            Label : 'Department',
            Value : departmentName
        },

        {
            $Type : 'UI.DataField',
            Label : 'Cost Center',
            Value : costCenter
        },

        {
            $Type : 'UI.DataField',
            Label : 'Active',
            Value : isActive
        }
    ]
);

/* ===========================================================
   VENDORS - ADMIN
   =========================================================== */

annotate AssetAdminService.Vendors with @(

    UI.LineItem : [

        {
            $Type : 'UI.DataField',
            Label : 'Vendor',
            Value : vendorName
        },

        {
            $Type : 'UI.DataField',
            Label : 'Email',
            Value : email
        },

        {
            $Type : 'UI.DataField',
            Label : 'Phone',
            Value : phone
        }
    ]
);

/* ===========================================================
   ASSET CATEGORIES - ADMIN
   =========================================================== */

annotate AssetAdminService.AssetCategories with @(

    UI.LineItem : [

    {
        $Type : 'UI.DataField',
        Label : 'Category',
        Value : categoryName
    },

        {
            $Type : 'UI.DataField',
            Label : 'Lifespan',
            Value : lifespanMonths
        },

        {
            $Type : 'UI.DataField',
            Label : 'Active',
            Value : active
        }
    ]
);

/* ===========================================================
   ASSET REQUESTS - ADMIN
   =========================================================== */

annotate AssetAdminService.AssetRequests with @(
    UI.Identification : [

    {
        $Type  : 'UI.DataFieldForAction',
        Label  : 'Approve',
        Action : 'AssetAdminService.ApproveAssetRequest'
    },

    {
        $Type  : 'UI.DataFieldForAction',
        Label  : 'Reject',
        Action : 'AssetAdminService.RejectAssetRequest'
    }
],

    UI.HeaderInfo : {
        TypeName : 'Asset Request',
        TypeNamePlural : 'Asset Requests',
        Title : {
            Value : employeeName
        }
    },

    UI.LineItem : [

        {
            $Type : 'UI.DataField',
            Label : 'Employee',
            Value : employeeName
        },

        {
            $Type : 'UI.DataField',
            Label : 'Requested Category',
            Value : categoryName
        },

        {
            $Type : 'UI.DataField',
            Label : 'Request Status',
            Value : status
        },
        {
            $Type : 'UI.DataField',
            Label : 'Remarks',
            Value : remarks
        },

    ],

    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Request Information',
            Target : '@UI.FieldGroup#RequestInfo'
        }
    ],

    UI.FieldGroup #RequestInfo : {
        Data : [

            {
                $Type : 'UI.DataField',
                Label : 'Employee',
                Value : employeeName
            },

            {
                $Type : 'UI.DataField',
                Label : 'Requested Category',
                Value : categoryName
            },

            {
                $Type : 'UI.DataField',
                Label : 'Business Justification',
                Value : justification
            },

            {
                $Type : 'UI.DataField',
                Label : 'Request Status',
                Value : status
            },

            {
                $Type : 'UI.DataField',
                Label : 'Approval Date',
                Value : approvalDate
            },
            {
                $Type : 'UI.DataField',
                Label : 'Remarks',
                Value : remarks
            }

        ]
    }

);

/* ===========================================================
   MANAGER - EMPLOYEES
   =========================================================== */

annotate AssetManagerService.Employees with @(

    UI.LineItem : [

        {
            $Type : 'UI.DataField',
            Value : employeeNumber
        },

        {
            $Type : 'UI.DataField',
            Value : fullName
        },

        {
            $Type : 'UI.DataField',
            Value : role
        },

        {
            $Type : 'UI.DataField',
            Value : status
        }
    ]
);

/* ===========================================================
   MANAGER - REQUESTS
   =========================================================== */

annotate AssetManagerService.AssetRequests with @(

    UI.HeaderInfo : {
        TypeName : 'Asset Request',
        TypeNamePlural : 'Asset Requests',
        Title : {
                Value : employeeName
            }
    },

    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Request Details',
            Target : '@UI.FieldGroup#RequestDetails'    
        }
    ],
);
annotate AssetManagerService.AssetRequests with @(
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Request Details',
            Target : '@UI.FieldGroup#RequestDetails'
        }
    ],

    UI.FieldGroup #RequestDetails : {
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Employee',
                Value : employee_ID
            },
            {
                $Type : 'UI.DataField',
                Label : 'Requested Category',
                Value : requestedCategory_ID
            },
            {
                $Type : 'UI.DataField',
                Label : 'Business Justification',
                Value : justification
            },
            {
                $Type : 'UI.DataField',
                Label : 'Request Status',
                Value : status
            },
            {
                $Type : 'UI.DataField',
                Label : 'Remarks',
                Value : remarks
            }
        ]
    },

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Employee',
            Value : employeeName
        },
        {
            $Type : 'UI.DataField',
            Label : 'Requested Category',
            Value : categoryName
        },
        {
            $Type : 'UI.DataField',
            Label : 'Request Status',
            Value : status
        }
    ]
);
annotate AssetManagerService.AssetRequests with {

    employee @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Employees',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : employee_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'fullName'
            }
        ]
    };

    requestedCategory @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'AssetCategories',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : requestedCategory_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'categoryName'
            }
        ]
    };

};

/* ===========================================================
   EMPLOYEE - MY ASSETS
   =========================================================== */

annotate AssetEmployeeService.Assets with @(

    UI.LineItem : [

        {
            $Type : 'UI.DataField',
            Label : 'Asset Tag',
            Value : assetTag
        },

        {
            $Type : 'UI.DataField',
            Label : 'Serial Number',
            Value : serialNumber
        },

        {
            $Type : 'UI.DataField',
            Label : 'Model',
            Value : model
        },

        {
            $Type : 'UI.DataField',
            Label : 'Status',
            Value : status
        }
    ]
);
annotate AssetAdminService.AssetKPIs with @(
    UI.Identification : [
        {
            $Type  : 'UI.DataFieldForAction',
            Label  : 'Refresh Dashboard',
            Action : 'AssetAdminService.RefreshDashboard'
        }
    ],
    
    UI.LineItem : [

        {
            $Type : 'UI.DataField',
            Label : 'Total Assets',
            Value : totalAssets
        },

        {
            $Type : 'UI.DataField',
            Label : 'Available',
            Value : availableAssets
        },

        {
            $Type : 'UI.DataField',
            Label : 'Assigned',
            Value : assignedAssets
        },

        {
            $Type : 'UI.DataField',
            Label : 'Maintenance',
            Value : maintenanceAssets
        },

        {
            $Type : 'UI.DataField',
            Label : 'Retired',
            Value : retiredAssets
        },

        {
            $Type : 'UI.DataField',
            Label : 'Archived',
            Value : archivedAssets
        }

    ]
);