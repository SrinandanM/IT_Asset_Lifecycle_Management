sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/VBox",
    "sap/m/MessageBox",
    "sap/m/CheckBox"
], function (
    Controller,
    JSONModel,
    Dialog,
    Button,
    Label,
    Input,
    VBox,
    MessageBox,
    CheckBox
) {
    "use strict";

    return Controller.extend(
        "asset.lifecycle.portal.adminportal.controller.View1",
        {

            onInit: function () {

                this._loadDashboard();

            },

            _loadDashboard: async function () {

                const response = await fetch(
                    "/odata/v4/asset-admin/AssetKPIs"
                );

                const data = await response.json();

                if (data.value && data.value.length > 0) {

                    const model = new JSONModel(
                        data.value[0]
                    );

                    this.getView().setModel(
                        model,
                        "dashboard"
                    );
                }
            },
_loadEmployees: async function () {

    const response = await fetch(
        "/odata/v4/asset-admin/Employees?$count=true"
    );

    const data = await response.json();

    console.log("EMPLOYEES DATA");
    console.log(data);

    console.log("EMPLOYEE COUNT");
    console.log(data.value.length);

    const oModel = new JSONModel(data.value);

    this.getView().setModel(
        oModel,
        "employees"
    );
},

_loadDepartments: async function () {

    const response = await fetch(
        "/odata/v4/asset-admin/Departments"
    );

    const data = await response.json();

    const oModel = new JSONModel(
        data.value
    );

    this.getView().setModel(
        oModel,
        "departments"
    );

},
onCreateDepartment: function () {

    const oDialog = new Dialog({

        title: "Create Department",

        content: [

            new VBox({

                items: [

                    new Label({
                        text: "Department Name"
                    }),

                    new Input({
                        id: "deptNameInput"
                    }),

                    new Label({
                        text: "Cost Center"
                    }),

                    new Input({
                        id: "costCenterInput"
                    })

                ]

            })

        ],

        beginButton: new Button({

            text: "Save",

            press: async () => {

                const payload = {

                    departmentName:
                        sap.ui.getCore()
                            .byId("deptNameInput")
                            .getValue(),

                    costCenter:
                        sap.ui.getCore()
                            .byId("costCenterInput")
                            .getValue(),

                    isActive: true
                };

                await fetch(
                    "/odata/v4/asset-admin/Departments",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify(payload)
                    }
                );

                await this._loadDepartments();

                oDialog.close();
            }

        }),

        endButton: new Button({

            text: "Cancel",

            press: function () {
                oDialog.close();
            }

        })

    });

    oDialog.open();
},
onEditDepartment: function () {

    const oTable = this.byId("departmentTable");

    const oItem = oTable.getSelectedItem();

    if (!oItem) {
        MessageBox.warning(
            "Please select a department first."
        );
        return;
    }

    const department =
        oItem.getBindingContext("departments")
            .getObject();

    const oDialog = new Dialog({

        title: "Edit Department",

        content: [

            new VBox({

                items: [

                    new Label({
                        text: "Department Name"
                    }),

                    new Input({
                        id: "editDeptName",
                        value: department.departmentName
                    }),

                    new Label({
                        text: "Cost Center"
                    }),

                    new Input({
                        id: "editCostCenter",
                        value: department.costCenter
                    })

                ]

            })

        ],

        beginButton: new Button({

            text: "Save",

            press: async () => {

                const payload = {

                    departmentName:
                        sap.ui.getCore()
                            .byId("editDeptName")
                            .getValue(),

                    costCenter:
                        sap.ui.getCore()
                            .byId("editCostCenter")
                            .getValue()

                };

                await fetch(
                    "/odata/v4/asset-admin/Departments(" +
                    department.ID +
                    ")",
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify(payload)
                    }
                );

                await this._loadDepartments();

                oDialog.close();
            }

        }),

        endButton: new Button({
            text: "Cancel",
            press: function () {
                oDialog.close();
            }
        })

    });

    oDialog.open();
},

onDeleteDepartment: function () {

    const oTable =
        this.byId("departmentTable");

    const oItem =
        oTable.getSelectedItem();

    if (!oItem) {

        MessageBox.warning(
            "Please select a department first."
        );

        return;
    }

    const department =
        oItem.getBindingContext("departments")
            .getObject();

    MessageBox.confirm(
        "Delete department " +
        department.departmentName +
        " ?",
        {
            title: "Confirm Delete",

            actions: [
                MessageBox.Action.YES,
                MessageBox.Action.NO
            ],

            onClose: async (sAction) => {

                if (
                    sAction ===
                    MessageBox.Action.YES
                ) {

                    await fetch(
                        "/odata/v4/asset-admin/Departments(" +
                        department.ID +
                        ")",
                        {
                            method: "DELETE"
                        }
                    );

                    await this._loadDepartments();
                }
            }
        }
    );
},

onDepartmentSearch: function (oEvent) {

    const sValue =
        oEvent.getParameter("newValue")
            .toLowerCase();

    const oModel =
        this.getView().getModel("departments");

    const aData =
        oModel.getData();

    const aFiltered =
        aData.filter(dept => {

            return (

                dept.departmentName
                    ?.toLowerCase()
                    .includes(sValue)

                ||

                dept.costCenter
                    ?.toLowerCase()
                    .includes(sValue)

            );

        });

    oModel.setData(aFiltered);
},



_loadVendors: async function () {

    const response = await fetch(
        "/odata/v4/asset-admin/Vendors"
    );

    const data = await response.json();

    const oModel = new JSONModel(
        data.value
    );

    this.getView().setModel(
        oModel,
        "vendors"
    );

},

onCreateVendor: function () {

    const oDialog = new Dialog({

        title: "Create Vendor",

        content: [

            new VBox({

                items: [

                    new Label({
                        text: "Vendor Name"
                    }),

                    new Input({
                        id: "vendorNameInput"
                    }),

                    new Label({
                        text: "Email"
                    }),

                    new Input({
                        id: "vendorEmailInput"
                    }),

                    new Label({
                        text: "Phone"
                    }),

                    new Input({
                        id: "vendorPhoneInput"
                    }),

                    new Label({
                        text: "Address"
                    }),

                    new Input({
                        id: "vendorAddressInput"
                    })

                ]

            })

        ],

        beginButton: new Button({

            text: "Save",

            press: async () => {

                const payload = {

                    vendorName:
                        sap.ui.getCore()
                            .byId("vendorNameInput")
                            .getValue(),

                    email:
                        sap.ui.getCore()
                            .byId("vendorEmailInput")
                            .getValue(),

                    phone:
                        sap.ui.getCore()
                            .byId("vendorPhoneInput")
                            .getValue(),

                    address:
                        sap.ui.getCore()
                            .byId("vendorAddressInput")
                            .getValue()
                };

                await fetch(
                    "/odata/v4/asset-admin/Vendors",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    }
                );

                await this._loadVendors();

                oDialog.close();
            }

        }),

        endButton: new Button({

            text: "Cancel",

            press: function () {
                oDialog.close();
            }

        })

    });

    oDialog.open();
},

onEditVendor: function () {

    const oTable =
        this.byId("vendorTable");

    const oItem =
        oTable.getSelectedItem();

    if (!oItem) {

        MessageBox.warning(
            "Please select a vendor first."
        );

        return;
    }

    const vendor =
        oItem.getBindingContext("vendors")
            .getObject();

    const oDialog = new Dialog({

        title: "Edit Vendor",

        content: [

            new VBox({

                items: [

                    new Label({
                        text: "Vendor Name"
                    }),

                    new Input({
                        id: "editVendorName",
                        value: vendor.vendorName
                    }),

                    new Label({
                        text: "Email"
                    }),

                    new Input({
                        id: "editVendorEmail",
                        value: vendor.email
                    }),

                    new Label({
                        text: "Phone"
                    }),

                    new Input({
                        id: "editVendorPhone",
                        value: vendor.phone
                    }),

                    new Label({
                        text: "Address"
                    }),

                    new Input({
                        id: "editVendorAddress",
                        value: vendor.address
                    })

                ]

            })

        ],

        beginButton: new Button({

            text: "Save",

            press: async () => {

                const payload = {

                    vendorName:
                        sap.ui.getCore()
                            .byId("editVendorName")
                            .getValue(),

                    email:
                        sap.ui.getCore()
                            .byId("editVendorEmail")
                            .getValue(),

                    phone:
                        sap.ui.getCore()
                            .byId("editVendorPhone")
                            .getValue(),

                    address:
                        sap.ui.getCore()
                            .byId("editVendorAddress")
                            .getValue()

                };

                await fetch(
                    "/odata/v4/asset-admin/Vendors(" +
                    vendor.ID +
                    ")",
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    }
                );

                await this._loadVendors();

                oDialog.close();
            }

        }),

        endButton: new Button({

            text: "Cancel",

            press: function () {
                oDialog.close();
            }

        })

    });

    oDialog.open();
},

onDeleteVendor: function () {

    const oTable =
        this.byId("vendorTable");

    const oItem =
        oTable.getSelectedItem();

    if (!oItem) {

        MessageBox.warning(
            "Please select a vendor first."
        );

        return;
    }

    const vendor =
        oItem.getBindingContext("vendors")
            .getObject();

    MessageBox.confirm(

        "Delete vendor " +
        vendor.vendorName +
        " ?",

        {

            title: "Confirm Delete",

            actions: [
                MessageBox.Action.YES,
                MessageBox.Action.NO
            ],

            onClose: async (sAction) => {

                if (
                    sAction ===
                    MessageBox.Action.YES
                ) {

                    await fetch(
                        "/odata/v4/asset-admin/Vendors(" +
                        vendor.ID +
                        ")",
                        {
                            method: "DELETE"
                        }
                    );

                    await this._loadVendors();
                }
            }
        }
    );
},

onVendorSearch: function (oEvent) {

    const sValue =
        oEvent.getParameter("newValue")
            .toLowerCase();

    const oModel =
        this.getView()
            .getModel("vendors");

    const aData =
        oModel.getData();

    const aFiltered =
        aData.filter(vendor => {

            return (

                vendor.vendorName
                    ?.toLowerCase()
                    .includes(sValue)

                ||

                vendor.email
                    ?.toLowerCase()
                    .includes(sValue)

                ||

                vendor.phone
                    ?.toLowerCase()
                    .includes(sValue)

            );

        });

    oModel.setData(aFiltered);
},

_loadCategories: async function () {

    const response = await fetch(
        "/odata/v4/asset-admin/AssetCategories"
    );

    const data = await response.json();

    const oModel = new JSONModel(
        data.value
    );

    this.getView().setModel(
        oModel,
        "categories"
    );

},

_loadRequests: async function () {

    const response = await fetch(
        "/odata/v4/asset-admin/AssetRequests"
    );

    const data = await response.json();

    const oModel = new JSONModel(
        data.value
    );

    this.getView().setModel(
        oModel,
        "requests"
    );
},  

onApproveRequest: async function () {

    const oTable =
        this.byId("requestTable");

    const oItem =
        oTable.getSelectedItem();

    if (!oItem) {

        MessageBox.warning(
            "Select a request first."
        );

        return;
    }

    const request =
        oItem.getBindingContext("requests")
            .getObject();

    await fetch(

        "/odata/v4/asset-admin/AssetRequests(" +
        request.ID +
        ")/AssetAdminService.ApproveAssetRequest",

        {
            method: "POST"
        }

    );

    await this._loadRequests();
},

onRejectRequest: function () {

    const oTable =
        this.byId("requestTable");

    const oItem =
        oTable.getSelectedItem();

    if (!oItem) {

        MessageBox.warning(
            "Select a request first."
        );

        return;
    }

    const request =
        oItem.getBindingContext("requests")
            .getObject();

    const oDialog = new Dialog({

        title: "Reject Request",

        content: [

            new VBox({

                items: [

                    new Label({
                        text: "Remarks"
                    }),

                    new Input({
                        id: "rejectRemarks"
                    })

                ]

            })

        ],

        beginButton: new Button({

            text: "Reject",

            type: "Negative",

            press: async () => {

                const remarks =
                    sap.ui.getCore()
                        .byId("rejectRemarks")
                        .getValue();

                await fetch(

                    "/odata/v4/asset-admin/AssetRequests(" +
                    request.ID +
                    ")/AssetAdminService.RejectAssetRequest",

                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            remarks: remarks
                        })
                    }

                );

                await this._loadRequests();

                oDialog.close();
            }

        }),

        endButton: new Button({

            text: "Cancel",

            press: function () {
                oDialog.close();
            }

        })

    });

    oDialog.open();
},

onRefreshRequests: async function () {

    await this._loadRequests();

},

onRequestSearch: function (oEvent) {

    const sValue =
        oEvent.getParameter("newValue")
            .toLowerCase();

    const oModel =
        this.getView()
            .getModel("requests");

    const aData =
        oModel.getData();

    const filtered =
        aData.filter(req => {

            return (

                req.employeeName
                    ?.toLowerCase()
                    .includes(sValue)

                ||

                req.categoryName
                    ?.toLowerCase()
                    .includes(sValue)

                ||

                req.status
                    ?.toLowerCase()
                    .includes(sValue)

            );

        });

    oModel.setData(filtered);
},

onCreateCategory: function () {

    const oDialog = new Dialog({

        title: "Create Category",

        content: [

            new VBox({

                items: [

                    new Label({
                        text: "Category Name"
                    }),

                    new Input({
                        id: "categoryNameInput"
                    }),

                    new Label({
                        text: "Lifespan Months"
                    }),

                    new Input({
                        id: "lifespanInput"
                    }),

                    new CheckBox({
                        id: "categoryActiveInput",
                        text: "Active",
                        selected: true
                    })

                ]

            })

        ],

        beginButton: new Button({

            text: "Save",

            press: async () => {

                const payload = {

                    categoryName:
                        sap.ui.getCore()
                            .byId("categoryNameInput")
                            .getValue(),

                    lifespanMonths:
                        parseInt(
                            sap.ui.getCore()
                                .byId("lifespanInput")
                                .getValue()
                        ),

                    active:
                        sap.ui.getCore()
                            .byId("categoryActiveInput")
                            .getSelected()

                };

                await fetch(
                    "/odata/v4/asset-admin/AssetCategories",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify(payload)
                    }
                );

                await this._loadCategories();

                oDialog.close();
            }

        }),

        endButton: new Button({
            text: "Cancel",
            press: function () {
                oDialog.close();
            }
        })

    });

    oDialog.open();
},

onEditCategory: function () {

    const oTable =
        this.byId("categoryTable");

    const oItem =
        oTable.getSelectedItem();

    if (!oItem) {

        MessageBox.warning(
            "Please select a category first."
        );

        return;
    }

    const category =
        oItem.getBindingContext("categories")
            .getObject();

    const oDialog = new Dialog({

        title: "Edit Category",

        content: [

            new VBox({

                items: [

                    new Label({
                        text: "Category Name"
                    }),

                    new Input({
                        id: "editCategoryName",
                        value: category.categoryName
                    }),

                    new Label({
                        text: "Lifespan Months"
                    }),

                    new Input({
                        id: "editLifespanMonths",
                        value: category.lifespanMonths
                    }),

                    new CheckBox({
                        id: "editCategoryActive",
                        text: "Active",
                        selected: category.active
                    })

                ]

            })

        ],

        beginButton: new Button({

            text: "Save",

            press: async () => {

                const payload = {

                    categoryName:
                        sap.ui.getCore()
                            .byId("editCategoryName")
                            .getValue(),

                    lifespanMonths:
                        parseInt(
                            sap.ui.getCore()
                                .byId("editLifespanMonths")
                                .getValue()
                        ),

                    active:
                        sap.ui.getCore()
                            .byId("editCategoryActive")
                            .getSelected()

                };

                await fetch(
                    "/odata/v4/asset-admin/AssetCategories(" +
                    category.ID +
                    ")",
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify(payload)
                    }
                );

                await this._loadCategories();

                oDialog.close();
            }

        }),

        endButton: new Button({

            text: "Cancel",

            press: function () {
                oDialog.close();
            }

        })

    });

    oDialog.open();
},

onDeleteCategory: function () {

    const oTable =
        this.byId("categoryTable");

    const oItem =
        oTable.getSelectedItem();

    if (!oItem) {

        MessageBox.warning(
            "Please select a category first."
        );

        return;
    }

    const category =
        oItem.getBindingContext("categories")
            .getObject();

    MessageBox.confirm(

        "Delete category " +
        category.categoryName +
        " ?",

        {

            title: "Confirm Delete",

            actions: [
                MessageBox.Action.YES,
                MessageBox.Action.NO
            ],

            onClose: async (sAction) => {

                if (
                    sAction ===
                    MessageBox.Action.YES
                ) {

                    await fetch(
                        "/odata/v4/asset-admin/AssetCategories(" +
                        category.ID +
                        ")",
                        {
                            method: "DELETE"
                        }
                    );

                    await this._loadCategories();
                }
            }
        }
    );
},

onCategorySearch: function (oEvent) {

    const sValue =
        oEvent.getParameter("newValue")
            .toLowerCase();

    const oModel =
        this.getView()
            .getModel("categories");

    const aData =
        oModel.getData();

    const aFiltered =
        aData.filter(category => {

            return (

                category.categoryName
                    ?.toLowerCase()
                    .includes(sValue)

            );

        });

    oModel.setData(aFiltered);
},


onEmployeeSearch: function (oEvent) {

    const sValue =
        oEvent.getParameter("newValue")
            .toLowerCase();

    const oModel =
        this.getView().getModel("employees");

    const aData =
        oModel.getData();

    const aFiltered =
        aData.filter(emp => {

            return (
                emp.employeeNumber?.toLowerCase().includes(sValue) ||
                emp.fullName?.toLowerCase().includes(sValue) ||
                emp.email?.toLowerCase().includes(sValue)
            );

        });

    oModel.setData(aFiltered);

},
onCreateEmployee: function () {

    const oDialog = new Dialog({
        title: "Create Employee",
        contentWidth: "500px",

        content: [

            new VBox({

                items: [

                    new Label({
                        text: "Employee Number"
                    }),

                    new Input({
                        id: "empNumberInput"
                    }),

                    new Label({
                        text: "Full Name"
                    }),

                    new Input({
                        id: "fullNameInput"
                    }),

                    new Label({
                        text: "Email"
                    }),

                    new Input({
                        id: "emailInput"
                    }),

                    new Label({
                        text: "Phone"
                    }),

                    new Input({
                        id: "phoneInput"
                    }),

                    new Label({
                        text: "Location"
                    }),

                    new Input({
                        id: "locationInput"
                    }),

                    new Label({
                        text: "Role"
                    }),

                    new Input({
                        id: "roleInput"
                    }),

                    new Label({
                        text: "Status"
                    }),

                    new Input({
                        id: "statusInput",
                        value: "ACTIVE"
                    })

                ]

            })

        ],

        beginButton: new Button({

            text: "Save",

            press: async () => {

                const payload = {

                    employeeNumber:
                        sap.ui.getCore()
                            .byId("empNumberInput")
                            .getValue(),

                    fullName:
                        sap.ui.getCore()
                            .byId("fullNameInput")
                            .getValue(),

                    email:
                        sap.ui.getCore()
                            .byId("emailInput")
                            .getValue(),

                    phone:
                        sap.ui.getCore()
                            .byId("phoneInput")
                            .getValue(),

                    location:
                        sap.ui.getCore()
                            .byId("locationInput")
                            .getValue(),

                    role:
                        sap.ui.getCore()
                            .byId("roleInput")
                            .getValue(),

                    status:
                        sap.ui.getCore()
                            .byId("statusInput")
                            .getValue()

                };

const response = await fetch(
    "/odata/v4/asset-admin/Employees",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }
);

const result = await response.text();

console.log("STATUS:", response.status);
console.log("RESULT:", result);

if (!response.ok) {
    alert(result);
    return;
}

await this._loadEmployees();

oDialog.close();
            }

        }),

        endButton: new Button({

            text: "Cancel",

            press: function () {
                oDialog.close();
            }

        })

    });

    oDialog.open();

},
onDeleteEmployee: function () {

    const oTable =
        this.byId("employeeTable");

    const oItem =
        oTable.getSelectedItem();

    if (!oItem) {

        sap.m.MessageBox.warning(
            "Please select an employee first."
        );

        return;
    }

    const employee =
        oItem.getBindingContext("employees")
            .getObject();

    sap.m.MessageBox.confirm(

        "Delete employee " +
        employee.fullName +
        " ?",

        {

            title: "Confirm Delete",

            actions: [
                sap.m.MessageBox.Action.YES,
                sap.m.MessageBox.Action.NO
            ],

            onClose: async (sAction) => {

                if (
                    sAction ===
                    sap.m.MessageBox.Action.YES
                ) {

                    await fetch(
                        "/odata/v4/asset-admin/Employees(" +
                        employee.ID +
                        ")",
                        {
                            method: "DELETE"
                        }
                    );

                    await this._loadEmployees();
                }
            }
        }
    );
},
onEditEmployee: function () {


    const oTable = this.byId("employeeTable");

    const oItem = oTable.getSelectedItem();

    if (!oItem) {
        sap.m.MessageBox.warning(
            "Please select an employee first."
        );
        return;
    }

    const employee =
        oItem.getBindingContext("employees")
            .getObject();

    const oDialog = new Dialog({
        title: "Edit Employee",
        contentWidth: "500px",

        content: [
            new VBox({
                items: [

                    new Label({
                        text: "Employee Number"
                    }),
                   new Input({
                    id: "editEmpNumber",
                    value: employee.employeeNumber,
                    editable: false,
                    enabled: false
                }),

                    new Label({
                        text: "Full Name"
                    }),
                    new Input({
                        id: "editFullName",
                        value: employee.fullName
                    }),

                    new Label({
                        text: "Email"
                    }),
                    new Input({
                        id: "editEmail",
                        value: employee.email
                    }),

                    new Label({
                        text: "Phone"
                    }),
                    new Input({
                        id: "editPhone",
                        value: employee.phone
                    }),

                    new Label({
                        text: "Location"
                    }),
                    new Input({
                        id: "editLocation",
                        value: employee.location
                    }),

                    new Label({
                        text: "Role"
                    }),
                    new Input({
                        id: "editRole",
                        value: employee.role
                    }),

                    new Label({
                        text: "Status"
                    }),
                    new Input({
                        id: "editStatus",
                        value: employee.status
                    })

                ]
            })
        ],

        beginButton: new Button({

            text: "Save",

            press: async () => {

                const payload = {


                    fullName:
                        sap.ui.getCore()
                            .byId("editFullName")
                            .getValue(),

                    email:
                        sap.ui.getCore()
                            .byId("editEmail")
                            .getValue(),

                    phone:
                        sap.ui.getCore()
                            .byId("editPhone")
                            .getValue(),

                    location:
                        sap.ui.getCore()
                            .byId("editLocation")
                            .getValue(),

                    role:
                        sap.ui.getCore()
                            .byId("editRole")
                            .getValue(),

                    status:
                        sap.ui.getCore()
                            .byId("editStatus")
                            .getValue()

                };

                await fetch(
                    "/odata/v4/asset-admin/Employees(" +
                    employee.ID +
                    ")",
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify(payload)
                    }
                );

                await this._loadEmployees();

                oDialog.close();
            }

        }),

        endButton: new Button({

            text: "Cancel",

            press: function () {
                oDialog.close();
            }

        })

    });

    oDialog.open();
},

onMenuSelect: function (oEvent) {

    const sTitle =
        oEvent.getParameter("listItem").getTitle();

    this.byId("dashboardContainer")
        .setVisible(false);

    this.byId("employeesContainer")
        .setVisible(false);

    this.byId("departmentsContainer")
        .setVisible(false);

    this.byId("vendorsContainer")
        .setVisible(false);

    this.byId("categoriesContainer")
        .setVisible(false);

    this.byId("requestsContainer")
        .setVisible(false);

    this.byId("assetsContainer")
        .setVisible(false);

    switch (sTitle) {

        case "Assets":
            this.byId("assetsContainer")
                .setVisible(true);
            break;

case "Asset Requests":

    this._loadRequests();

    this.byId("requestsContainer")
        .setVisible(true);

    break;

    case "Employees":

    this._loadEmployees();

    this.byId("employeesContainer")
        .setVisible(true);

    break;

case "Departments":

    this._loadDepartments();

    this.byId("departmentsContainer")
        .setVisible(true);

    break;

case "Vendors":

    this._loadVendors();

    this.byId("vendorsContainer")
        .setVisible(true);

    break;

case "Categories":

    this._loadCategories();

    this.byId("categoriesContainer")
        .setVisible(true);

    break;
    }

}

        }
    );
});