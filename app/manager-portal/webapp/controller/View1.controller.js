sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Text",
    "sap/m/Title",
    "sap/m/VBox",
    "sap/m/Select",
    "sap/ui/core/Item"
], function (
    Controller,
    MessageBox,
    JSONModel,
    Dialog,
    Button,
    Label,
    Input,
    Text,
    Title,
    VBox,
    Select,
    Item
) {
    "use strict";

    return Controller.extend(
        "asset.lifecycle.portal.managerportal.managerportal.controller.View1",
        {

onInit() {

    this.byId("dashboardHtml").setContent(
        "<iframe src='/asset.lifecycle.dashboard.admindashboard/index.html' style='width:100%;height:1200px;border:none;'></iframe>"
    );

},
_loadDepartments: async function () {

    const response = await fetch(
        "/odata/v4/asset-manager/Departments"
    );

    const data = await response.json();

    return data.value;
},

            _loadEmployees: async function () {

    const response = await fetch(
        "/odata/v4/asset-manager/Employees"
    );

    const data = await response.json();

    const oModel =
        new sap.ui.model.json.JSONModel(
            data.value
        );

    this.getView().setModel(
        oModel,
        "employees"
    );
},

_loadRequests: async function () {

    const response = await fetch(
        "/odata/v4/asset-manager/AssetRequests"
    );

    const data = await response.json();

    const oModel =
        new JSONModel(
            data.value
        );

    this.getView().setModel(
        oModel,
        "requests"
    );

},

_loadApprovedRequests: async function () {

    const response = await fetch(
        "/odata/v4/asset-manager/AssetRequests"
    );

    const data = await response.json();

    const approved =
        data.value.filter(
            req =>
                req.status ===
                "APPROVED"
        );

    const oModel =
        new JSONModel(
            approved
        );

    this.getView().setModel(
        oModel,
        "approvedRequests"
    );

},
_loadAssets: async function () {

    const response = await fetch(
        "/odata/v4/asset-manager/Assets"
    );

    const data = await response.json();

    const oModel =
        new JSONModel(
            data.value
        );

    this.getView().setModel(
        oModel,
        "assets"
    );

},


onCreateEmployee: async function () {

    const departments =
        await this._loadDepartments();

    const oDepartmentSelect =
        new Select({
            id: "departmentSelect"
        });

    departments.forEach(dept => {

        oDepartmentSelect.addItem(
            new Item({
                key: dept.ID,
                text: dept.departmentName
            })
        );

    });

    const oDialog = new Dialog({

        title: "Create Employee",

        contentWidth: "500px",

        content: [

    new VBox({

    class: "sapUiLargeMargin",
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
                    }),

                    new Label({
                        text: "Department"
                    }),

                    oDepartmentSelect

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
                            .getValue(),

                    department_ID:
                        sap.ui.getCore()
                            .byId("departmentSelect")
                            .getSelectedKey()

                };
const response = await fetch(
    "/odata/v4/asset-manager/Employees",
    {
        method: "POST",
        headers: {
            "Content-Type":
                "application/json"
        },
        body: JSON.stringify(payload)
    }
);

const result = await response.json();

if (!response.ok) {

    let sErrorMessage =
        "Unable to create employee.";

    if (
        result.error?.message?.includes(
            "Email already exists"
        )
    ) {

        sErrorMessage =
            "The email address already exists in the system.\n\nPlease enter a different email address.";

    }

    else if (
        result.error?.message?.includes(
            "Employee Number already exists"
        )
    ) {

        sErrorMessage =
            "Employee Number already exists.\n\nPlease use a unique employee number.";

    }

    const oErrorDialog = new Dialog({

        title: "Employee Creation Failed",

        type: "Message",

        contentWidth: "700px",
        contentHeight: "280px",
        content: [

            new VBox({

                class: "sapUiMediumMargin",

                items: [

new Title({
    text: "Validation Error",
    level: "H2"
}),
            new Text({
                text: sErrorMessage,
                wrapping: true
            })

                ]

            })

        ],

        beginButton: new Button({

            text: "Close",

            type: "Emphasized",

            press: function () {
                oErrorDialog.close();
            }

        })

    });

    oErrorDialog.open();

    return;
}

MessageBox.success(
    "Employee created successfully."
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

onEditEmployee: async function () {

    const oTable =
        this.byId("employeeTable");

    const oItem =
        oTable.getSelectedItem();

    if (!oItem) {

        MessageBox.warning(
            "Please select an employee first."
        );

        return;
    }

    const employee =
        oItem.getBindingContext("employees")
            .getObject();

    const departments =
        await this._loadDepartments();

    const oDepartmentSelect =
        new Select({
            id: "editDepartmentSelect"
        });

    departments.forEach(dept => {

        oDepartmentSelect.addItem(
            new Item({
                key: dept.ID,
                text: dept.departmentName
            })
        );

    });

    oDepartmentSelect.setSelectedKey(
        employee.department_ID
    );

    const oDialog = new Dialog({

        title: "Edit Employee",

        contentWidth: "600px",

        content: [

            new VBox({

                items: [

                    new Label({
                        text: "Employee Number"
                    }),

                    new Input({
                        id: "editEmpNumber",
                        value:
                            employee.employeeNumber,
                        editable: false,
                        enabled: false
                    }),

                    new Label({
                        text: "Full Name"
                    }),

                    new Input({
                        id: "editFullName",
                        value:
                            employee.fullName
                    }),

                    new Label({
                        text: "Email"
                    }),

                    new Input({
                        id: "editEmail",
                        value:
                            employee.email
                    }),

                    new Label({
                        text: "Phone"
                    }),

                    new Input({
                        id: "editPhone",
                        value:
                            employee.phone
                    }),

                    new Label({
                        text: "Location"
                    }),

                    new Input({
                        id: "editLocation",
                        value:
                            employee.location
                    }),

                    new Label({
                        text: "Role"
                    }),

                    new Input({
                        id: "editRole",
                        value:
                            employee.role
                    }),

                    new Label({
                        text: "Status"
                    }),

                    new Input({
                        id: "editStatus",
                        value:
                            employee.status
                    }),

                    new Label({
                        text: "Department"
                    }),

                    oDepartmentSelect

                ]

            })

        ],

        beginButton: new Button({

            text: "Save",

            type: "Emphasized",

            press: async () => {

                const payload = {

                    fullName:
                        sap.ui.getCore()
                            .byId(
                                "editFullName"
                            )
                            .getValue(),

                    email:
                        sap.ui.getCore()
                            .byId(
                                "editEmail"
                            )
                            .getValue(),

                    phone:
                        sap.ui.getCore()
                            .byId(
                                "editPhone"
                            )
                            .getValue(),

                    location:
                        sap.ui.getCore()
                            .byId(
                                "editLocation"
                            )
                            .getValue(),

                    role:
                        sap.ui.getCore()
                            .byId(
                                "editRole"
                            )
                            .getValue(),

                    status:
                        sap.ui.getCore()
                            .byId(
                                "editStatus"
                            )
                            .getValue(),

                    department_ID:
                        sap.ui.getCore()
                            .byId(
                                "editDepartmentSelect"
                            )
                            .getSelectedKey()

                };

                await fetch(
                    "/odata/v4/asset-manager/Employees(" +
                    employee.ID +
                    ")",
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );

                MessageBox.success(
                    "Employee updated successfully."
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
                    oEvent.getParameter("listItem")
                        .getTitle();

                this.byId("dashboardContainer")
                    .setVisible(false);

                this.byId("employeesContainer")
                    .setVisible(false);

                this.byId("requestsContainer")
                    .setVisible(false);

                this.byId("assetsContainer")
                    .setVisible(false);

                this.byId("allocationContainer")
                    .setVisible(false);

                this.byId("contentTitle")
                    .setText(sTitle);

                switch (sTitle) {

                    case "Dashboard":

                        this.byId("contentText")
                            .setText(
                                "Manager Dashboard"
                            );

                        this.byId("dashboardContainer")
                            .setVisible(true);

                        break;

case "Employees":

    this._loadEmployees();

    this.byId("employeesContainer")
        .setVisible(true);

        break;

case "Asset Requests":

    this._loadRequests();

    this.byId("requestsContainer")
        .setVisible(true);

    break;

case "Assets":

    this._loadAssets();

    this.byId("assetsContainer")
        .setVisible(true);

    break;

case "Asset Allocation":

    this._loadApprovedRequests();

    this.byId("allocationContainer")
        .setVisible(true);

    break;
                }
            },
onCreateRequest: async function () {

    const employeeResponse = await fetch(
        "/odata/v4/asset-manager/Employees"
    );

    const employeeData =
        await employeeResponse.json();

    const categoryResponse = await fetch(
        "/odata/v4/asset-manager/AssetCategories"
    );

    const categoryData =
        await categoryResponse.json();

    const oEmployeeSelect =
        new Select({
            id: "requestEmployeeSelect"
        });

    employeeData.value.forEach(emp => {

        oEmployeeSelect.addItem(
            new Item({
                key: emp.ID,
                text:
                    emp.employeeNumber +
                    " - " +
                    emp.fullName
            })
        );

    });

    const oCategorySelect =
        new Select({
            id: "requestCategorySelect"
        });

    categoryData.value.forEach(cat => {

        oCategorySelect.addItem(
            new Item({
                key: cat.ID,
                text: cat.categoryName
            })
        );

    });

    const oDialog = new Dialog({

        title: "Create Asset Request",

        contentWidth: "600px",

        content: [

            new VBox({

                class: "sapUiMediumMargin",

                items: [

                    new Label({
                        text: "Employee"
                    }),

                    oEmployeeSelect,

                    new Label({
                        text: "Asset Category"
                    }),

                    oCategorySelect,

                    new Label({
                        text: "Business Justification"
                    }),

                    new Input({
                        id: "justificationInput"
                    })

                ]

            })

        ],

        beginButton: new Button({

            text: "Submit",

            type: "Emphasized",

            press: async () => {

                const payload = {

                    employeeID:
                        sap.ui.getCore()
                            .byId(
                                "requestEmployeeSelect"
                            )
                            .getSelectedKey(),

                    categoryID:
                        sap.ui.getCore()
                            .byId(
                                "requestCategorySelect"
                            )
                            .getSelectedKey(),

                    justification:
                        sap.ui.getCore()
                            .byId(
                                "justificationInput"
                            )
                            .getValue()

                };

                const response =
                    await fetch(
                        "/odata/v4/asset-manager/CreateAssetRequest",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify(
                                payload
                            )
                        }
                    );

                if (!response.ok) {

                    MessageBox.error(
                        "Request submission failed."
                    );

                    return;
                }

                MessageBox.success(
                    "Asset Request submitted successfully."
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

onRefreshAssets: async function () {

    await this._loadAssets();

},

onAssetSearch: function (oEvent) {

    const sValue =
        oEvent.getParameter("newValue")
            .toLowerCase();

    const oModel =
        this.getView()
            .getModel("assets");

    const aData =
        oModel.getData();

    const filtered =
        aData.filter(asset => {

            return (

                asset.assetTag
                    ?.toLowerCase()
                    .includes(sValue)

                ||

                asset.model
                    ?.toLowerCase()
                    .includes(sValue)

                ||

                asset.status
                    ?.toLowerCase()
                    .includes(sValue)

            );

        });

    oModel.setData(
        filtered
    );

},
onAssignAsset: async function () {

    const oTable =
        this.byId("requestTable");

    const oItem =
        oTable.getSelectedItem();

    if (!oItem) {

        MessageBox.warning(
            "Please select an approved request."
        );

        return;
    }

console.log(
    oItem.getBindingContext("approvedRequests")
);

console.log(
    oItem.getBindingContext("requests")
);

const request =
    (
        oItem.getBindingContext(
            "approvedRequests"
        ) ||

        oItem.getBindingContext(
            "requests"
        )
    ).getObject();

    const response =
        await fetch(
            "/odata/v4/asset-manager/Assets"
        );

    const data =
        await response.json();

    const availableAssets =
        data.value.filter(
            asset =>
                asset.status === "AVAILABLE"
        );

    const oAssetSelect =
        new Select({
            id: "assignAssetSelect"
        });

    availableAssets.forEach(asset => {

        oAssetSelect.addItem(
            new Item({
                key: asset.ID,
                text:
                    asset.assetTag +
                    " - " +
                    asset.model
            })
        );

    });

    const oDialog = new Dialog({

        title: "Assign Asset",

        contentWidth: "500px",

        content: [

            new VBox({

                items: [

                    new Label({
                        text: "Employee"
                    }),

                    new Text({
                        text:
                            request.employeeName
                    }),

                    new Label({
                        text:
                            "Available Asset"
                    }),

                    oAssetSelect

                ]

            })

        ],

        beginButton:
            new Button({

                text: "Assign",

                type: "Emphasized",

                press: async () => {

                    MessageBox.success(
                        "Manager assignment workflow created successfully."
                    );

                    oDialog.close();

                }

            }),

        endButton:
            new Button({

                text: "Cancel",

                press: function () {
                    oDialog.close();
                }

            })

    });

    oDialog.open();

},
onAssignApprovedAsset: async function () {

    const oTable =
        this.byId("allocationTable");

    const oItem =
        oTable.getSelectedItem();

    if (!oItem) {

        MessageBox.warning(
            "Select an approved request first."
        );

        return;
    }

const oContext =
    oItem.getBindingContext(
        "approvedRequests"
    );

console.log(
    "CONTEXT =",
    oContext
);

if (!oContext) {

    MessageBox.error(
        "Unable to read selected request."
    );

    return;
}

const request =
    oContext.getObject();

console.log(
    "REQUEST =",
    request
);

    if (request.status !== "APPROVED") {

        MessageBox.warning(
            "Only approved requests can be assigned."
        );

        return;
    }

    const response = await fetch(
        "/odata/v4/asset-manager/Assets"
    );

    const data =
        await response.json();

    const availableAssets =
        data.value.filter(
            a =>
                a.status ===
                "AVAILABLE"
        );

    const oAssetSelect =
        new Select({
            id: "managerAssetSelect"
        });

    availableAssets.forEach(asset => {

        oAssetSelect.addItem(
            new Item({
                key: asset.ID,
                text:
                    asset.assetTag +
                    " - " +
                    asset.model
            })
        );

    });

    const oDialog = new Dialog({

        title: "Assign Asset",

        content: [

            new VBox({

                items: [

                    new Label({
                        text: "Employee"
                    }),

                    new Text({
                        text:
                            request.employeeName
                    }),

                    new Label({
                        text: "Asset"
                    }),

                    oAssetSelect

                ]

            })

        ],

beginButton:
    new Button({

        text: "Assign",

        type: "Accept",

        press: async () => {

            const assetID =
                sap.ui.getCore()
                    .byId(
                        "managerAssetSelect"
                    )
                    .getSelectedKey();

            if (!assetID) {

                MessageBox.warning(
                    "Please select an asset."
                );

                return;
            }

            const response =
                await fetch(
                    "/odata/v4/asset-manager/AssignApprovedAsset",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({

                            requestID:
                                request.ID,

                            assetID:
                                assetID

                        })
                    }
                );

            if (!response.ok) {

                const errorText =
                    await response.text();

                MessageBox.error(
                    errorText ||
                    "Asset assignment failed."
                );

                return;
            }

            MessageBox.success(
                "Asset assigned successfully."
            );

            await this._loadApprovedRequests();

            await this._loadAssets();

            oDialog.close();
            oDialog.destroy();

        }

    }),

        endButton:
            new Button({

                text: "Cancel",

                press: function () {
                    oDialog.close();
                }

            })

    });

    oDialog.open();

},


        }
    );
});