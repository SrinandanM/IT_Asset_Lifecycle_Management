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


        }
    );
});