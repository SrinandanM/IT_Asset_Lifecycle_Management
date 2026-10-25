sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/VBox",
    "sap/m/MessageBox",
    "sap/m/CheckBox",
    "sap/m/MessageToast",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/TextArea",
    "sap/m/Text"
], function (
    Controller,
    JSONModel,
    Dialog,
    Button,
    Label,
    Input,
    VBox,
    MessageBox,
    CheckBox,
    MessageToast,
    Select,
    Item,
    TextArea,
    Text
) {
    "use strict";

    return Controller.extend(
        "asset.lifecycle.portal.adminportal.controller.View1",
        {

            onInit: function () {
                this._loadDashboard();
                this._loadDashboardCharts();
            },

            // ===== HELPER FOR MODERN WARNINGS =====
            _showWarning: function (sMessage) {
                if (!this._oWarnDialog) {
                    this._oWarnDialog = new Dialog({
                        title: "Action Required",
                        icon: "sap-icon://warning",
                        state: "Warning",
                        content: new Text({ 
                            text: sMessage 
                        }).addStyleClass("sapUiSmallMargin sapUiMediumMarginTopBottom"),
                        beginButton: new Button({
                            text: "Understood",
                            type: "Emphasized",
                            press: function () {
                                this._oWarnDialog.close();
                            }.bind(this)
                        }),
                        afterClose: function () {
                            this._oWarnDialog.destroy();
                            this._oWarnDialog = null;
                        }.bind(this)
                    }).addStyleClass("sapUiContentPadding");
                }
                this._oWarnDialog.open();
            },

            // ===== DASHBOARD SECTION =====

            _loadDashboard: async function () {
                const response = await fetch(
                    "/odata/v4/asset-admin/AssetKPIs"
                );
                const data = await response.json();
                if (data.value && data.value.length > 0) {
                    const model = new JSONModel(data.value[0]);
                    this.getView().setModel(model, "dashboard");
                }
            },

            _loadDashboardCharts: async function () {
                await this._loadStatusChart();
                await this._loadCategoryChart();
                await this._loadDepartmentChart();
            },

            _loadStatusChart: async function () {
                const response = await fetch(
                    "/odata/v4/asset-admin/AssetStatusChart"
                );
                const data = await response.json();
                
                const oModel = this.getView().getModel("dashboard");
                if (oModel) {
                    oModel.setProperty("/statusChart", data.value);
                }

                const oChart = this.byId("statusChart");
                if (oChart) {
                    setTimeout(() => {
                        oChart.setVizProperties({
                            title: {
                                visible: true,
                                text: "Asset Status Distribution"
                            },
                            legend: {
                                visible: true
                            }
                        });
                    }, 100);
                }
            },

            _loadCategoryChart: async function () {
                const response = await fetch(
                    "/odata/v4/asset-admin/AssetCategoryChart"
                );
                const data = await response.json();
                
                const oModel = this.getView().getModel("dashboard");
                if (oModel) {
                    oModel.setProperty("/categoryChart", data.value);
                }

                const oChart = this.byId("categoryChart");
                if (oChart) {
                    setTimeout(() => {
                        oChart.setVizProperties({
                            title: {
                                visible: true,
                                text: "Assets By Category"
                            },
                            legend: {
                                visible: true
                            }
                        });
                    }, 100);
                }
            },

            _loadDepartmentChart: async function () {
                const response = await fetch(
                    "/odata/v4/asset-admin/DepartmentAssetChart"
                );
                const data = await response.json();
                
                const oModel = this.getView().getModel("dashboard");
                if (oModel) {
                    oModel.setProperty("/departmentChart", data.value);
                }

                const oChart = this.byId("departmentChart");
                if (oChart) {
                    setTimeout(() => {
                        oChart.setVizProperties({
                            title: {
                                visible: true,
                                text: "Assets By Department"
                            },
                            legend: {
                                visible: true
                            }
                        });
                    }, 100);
                }
            },

            // ===== ASSET MANAGEMENT SECTION =====

            _loadAssets: async function () {
                const response = await fetch(
                    "/odata/v4/asset-admin/Assets"
                );
                const data = await response.json();
                const oModel = new JSONModel(data.value);
                this.getView().setModel(oModel, "assets");
            },

            onCreateAsset: function () {
                const oDialog = new Dialog({
                    title: "Create Asset",
                    contentWidth: "500px",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Asset Tag" }),
                                new Input({ id: "assetTagInput" }),
                                new Label({ text: "Model" }),
                                new Input({ id: "modelInput" }),
                                new Label({ text: "Serial Number" }),
                                new Input({ id: "serialNumberInput" }),
                                new Label({ text: "Category" }),
                                new Input({ id: "categoryIdInput" }),
                                new Label({ text: "Purchase Date" }),
                                new Input({ id: "purchaseDateInput", type: "Date" }),
                                new Label({ text: "Acquisition Cost" }),
                                new Input({ id: "costInput", type: "Number" })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Save",
                        press: async () => {
                            const payload = {
                                assetTag: sap.ui.getCore().byId("assetTagInput").getValue(),
                                model: sap.ui.getCore().byId("modelInput").getValue(),
                                serialNumber: sap.ui.getCore().byId("serialNumberInput").getValue(),
                                categoryID: sap.ui.getCore().byId("categoryIdInput").getValue(),
                                purchaseDate: sap.ui.getCore().byId("purchaseDateInput").getValue(),
                                acquisitionCost: parseFloat(sap.ui.getCore().byId("costInput").getValue()),
                                status: "AVAILABLE"
                            };

                            const response = await fetch(
                                "/odata/v4/asset-admin/Assets",
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload)
                                }
                            );

                            if (response.ok) {
                                MessageToast.show("Asset created successfully");
                                await this._loadAssets();
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to create asset");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },

            onAssignAsset: async function () {
                const oTable = this.byId("assetTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select an asset first.");
                    return;
                }

                const asset = oItem.getBindingContext("assets").getObject();

                // Show loading while fetching employees
                MessageToast.show("Loading employees...");

                try {
                    // Fetch employees from the backend
                    const empResponse = await fetch("/odata/v4/asset-admin/Employees");
                    const empData = await empResponse.json();

                    if (!empData.value || empData.value.length === 0) {
                        MessageBox.error("No employees found to assign.");
                        return;
                    }

                    // Create the dropdown items
                    const aItems = empData.value.map(emp => {
                        return new Item({
                            key: emp.ID, // The ID sent to the backend
                            text: `${emp.fullName} (${emp.employeeNumber})` // What the user sees
                        });
                    });

                    const oSelect = new Select({
                        id: "assignEmployeeSelect",
                        width: "100%",
                        items: aItems,
                        placeholder: "Select an Employee"
                    });

                    const oDialog = new Dialog({
                        title: "Assign Asset",
                        contentWidth: "500px",
                        content: [
                            new VBox({
                                items: [
                                    new Label({ text: "Asset: " + asset.assetTag }),
                                    new Label({ text: "Employee" }),
                                    oSelect, // The new dropdown
                                    new Label({ text: "Assigned Date" }),
                                    new Input({ id: "assignedDateInput", type: "Date" })
                                ]
                            })
                        ],
                        beginButton: new Button({
                            text: "Assign",
                            type: "Emphasized",
                            press: async () => {
                                const selectedEmpID = oSelect.getSelectedKey();
                                
                                if (!selectedEmpID) {
                                    this._showWarning("Please select an employee from the list.");
                                    return;
                                }

                                const response = await fetch(
                                    `/odata/v4/asset-admin/Assets(${asset.ID})/AssetAdminService.AssignAsset`,
                                    {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            employeeID: selectedEmpID,
                                            assignedDate: sap.ui.getCore().byId("assignedDateInput").getValue()
                                        })
                                    }
                                );

                                if (response.ok) {
                                    MessageToast.show("Asset assigned successfully");
                                    await this._loadAssets();
                                    oDialog.close();
                                } else {
                                    const err = await response.text();
                                    console.error("Backend Error:", err);
                                    MessageBox.error("Failed to assign asset.");
                                }
                            }
                        }),
                        endButton: new Button({
                            text: "Cancel",
                            press: () => oDialog.close()
                        }),
                        afterClose: () => oDialog.destroy()
                    });
                    
                    oDialog.open();

                } catch (error) {
                    console.error("Error loading employees:", error);
                    MessageBox.error("Failed to load employees for assignment.");
                }
            },

            onReturnAsset: function () {
                const oTable = this.byId("assetTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select an asset first.");
                    return;
                }

                const asset = oItem.getBindingContext("assets").getObject();

                const oDialog = new Dialog({
                    title: "Return Asset",
                    contentWidth: "500px",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Asset: " + asset.assetTag }),
                                new Label({ text: "Return Date" }),
                                new Input({ id: "returnDateInput", type: "Date" }),
                                new Label({ text: "Remarks" }),
                                new TextArea({ id: "returnRemarksInput", rows: 3 })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Return",
                        press: async () => {
                            const response = await fetch(
                                `/odata/v4/asset-admin/Assets(${asset.ID})/AssetAdminService.ReturnAsset`,
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        returnDate: sap.ui.getCore().byId("returnDateInput").getValue()
                                    })
                                }
                            );

                            if (response.ok) {
                                MessageToast.show("Asset returned successfully");
                                await this._loadAssets();
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to return asset");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },

            onTransferAsset: function () {
                const oTable = this.byId("assetTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select an asset first.");
                    return;
                }

                const asset = oItem.getBindingContext("assets").getObject();

                const oDialog = new Dialog({
                    title: "Transfer Asset",
                    contentWidth: "500px",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Asset: " + asset.assetTag }),
                                new Label({ text: "Transfer To Employee ID" }),
                                new Input({ id: "transferEmployeeIdInput" }),
                                new Label({ text: "Transfer Date" }),
                                new Input({ id: "transferDateInput", type: "Date" })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Transfer",
                        press: async () => {
                            const response = await fetch(
                                `/odata/v4/asset-admin/Assets(${asset.ID})/AssetAdminService.TransferAsset`,
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        toEmployeeID: sap.ui.getCore().byId("transferEmployeeIdInput").getValue(),
                                        transferDate: sap.ui.getCore().byId("transferDateInput").getValue()
                                    })
                                }
                            );

                            if (response.ok) {
                                MessageToast.show("Asset transferred successfully");
                                await this._loadAssets();
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to transfer asset");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },

            onSendForMaintenance: function () {
                const oTable = this.byId("assetTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select an asset first.");
                    return;
                }

                const asset = oItem.getBindingContext("assets").getObject();

                const oDialog = new Dialog({
                    title: "Send for Maintenance",
                    contentWidth: "500px",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Asset: " + asset.assetTag }),
                                new Label({ text: "Issue Description" }),
                                new TextArea({ id: "maintenanceIssueInput", rows: 4 })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Send",
                        press: async () => {
                            const response = await fetch(
                                `/odata/v4/asset-admin/Assets(${asset.ID})/AssetAdminService.SendForMaintenance`,
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        issueDescription: sap.ui.getCore().byId("maintenanceIssueInput").getValue()
                                    })
                                }
                            );

                            if (response.ok) {
                                MessageToast.show("Asset sent for maintenance");
                                await this._loadAssets();
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to send asset for maintenance");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },
            onReturnFromMaintenance: function () {
                const oTable = this.byId("assetTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select an asset first.");
                    return;
                }

                const asset = oItem.getBindingContext("assets").getObject();

                const oDialog = new Dialog({
                    title: "Return from Maintenance",
                    contentWidth: "500px",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Asset: " + asset.assetTag }),
                                new Label({ text: "Resolution Notes" }),
                                new TextArea({ id: "maintenanceResolveInput", rows: 4 })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Return to Service",
                        type: "Emphasized",
                        press: async () => {
                            // --- FIXED: Removed resolutionNotes so the backend doesn't reject it ---
                            const response = await fetch(
                                `/odata/v4/asset-admin/Assets(${asset.ID})/AssetAdminService.CompleteMaintenance`, 
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({}) // Send empty payload
                                }
                            );

                            if (response.ok) {
                                MessageToast.show("Maintenance completed successfully");
                                await this._loadAssets();
                                oDialog.close();
                            } else {
                                const errorText = await response.text();
                                console.error("Backend Error:", errorText);
                                MessageBox.error("Failed to complete maintenance");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },
            onRetireAsset: function () {
                const oTable = this.byId("assetTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select an asset first.");
                    return;
                }

                const asset = oItem.getBindingContext("assets").getObject();

                const oDialog = new Dialog({
                    title: "Retire Asset",
                    contentWidth: "500px",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Asset: " + asset.assetTag }),
                                new Label({ text: "Reason for Retirement" }),
                                new TextArea({ id: "retireReasonInput", rows: 4 })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Retire",
                        type: "Negative",
                        press: async () => {
                            const response = await fetch(
                                `/odata/v4/asset-admin/Assets(${asset.ID})/AssetAdminService.RetireAsset`,
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        reason: sap.ui.getCore().byId("retireReasonInput").getValue()
                                    })
                                }
                            );

                            if (response.ok) {
                                MessageToast.show("Asset retired successfully");
                                await this._loadAssets();
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to retire asset");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },

            onAssetSearch: function (oEvent) {
                const sValue = oEvent.getParameter("newValue").toLowerCase();
                const oModel = this.getView().getModel("assets");
                const aData = oModel.getData();

                const aFiltered = aData.filter(asset => {
                    return (
                        asset.assetTag?.toLowerCase().includes(sValue) ||
                        asset.model?.toLowerCase().includes(sValue) ||
                        asset.status?.toLowerCase().includes(sValue)
                    );
                });

                oModel.setData(aFiltered);
            },

            // ===== EMPLOYEE SECTION =====

            _loadEmployees: async function () {
                const response = await fetch(
                    "/odata/v4/asset-admin/Employees?$count=true"
                );
                const data = await response.json();
                const oModel = new JSONModel(data.value);
                this.getView().setModel(oModel, "employees");
            },

            onCreateEmployee: function () {
                const oDialog = new Dialog({
                    title: "Create Employee",
                    contentWidth: "500px",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Employee Number" }),
                                new Input({ id: "empNumberInput" }),
                                new Label({ text: "Full Name" }),
                                new Input({ id: "fullNameInput" }),
                                new Label({ text: "Email" }),
                                new Input({ id: "emailInput" }),
                                new Label({ text: "Phone" }),
                                new Input({ id: "phoneInput" }),
                                new Label({ text: "Location" }),
                                new Input({ id: "locationInput" }),
                                new Label({ text: "Role" }),
                                new Input({ id: "roleInput" }),
                                new Label({ text: "Status" }),
                                new Input({ id: "statusInput", value: "ACTIVE" })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Save",
                        press: async () => {
                            const payload = {
                                employeeNumber: sap.ui.getCore().byId("empNumberInput").getValue(),
                                fullName: sap.ui.getCore().byId("fullNameInput").getValue(),
                                email: sap.ui.getCore().byId("emailInput").getValue(),
                                phone: sap.ui.getCore().byId("phoneInput").getValue(),
                                location: sap.ui.getCore().byId("locationInput").getValue(),
                                role: sap.ui.getCore().byId("roleInput").getValue(),
                                status: sap.ui.getCore().byId("statusInput").getValue()
                            };

                            const response = await fetch(
                                "/odata/v4/asset-admin/Employees",
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload)
                                }
                            );

                            if (response.ok) {
                                await this._loadEmployees();
                                MessageToast.show("Employee created successfully");
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to create employee");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },

            onEditEmployee: function () {
                const oTable = this.byId("employeeTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select an employee first.");
                    return;
                }

                const employee = oItem.getBindingContext("employees").getObject();

                const oDialog = new Dialog({
                    title: "Edit Employee",
                    contentWidth: "500px",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Employee Number" }),
                                new Input({ id: "editEmpNumber", value: employee.employeeNumber, editable: false, enabled: false }),
                                new Label({ text: "Full Name" }),
                                new Input({ id: "editFullName", value: employee.fullName }),
                                new Label({ text: "Email" }),
                                new Input({ id: "editEmail", value: employee.email }),
                                new Label({ text: "Phone" }),
                                new Input({ id: "editPhone", value: employee.phone }),
                                new Label({ text: "Location" }),
                                new Input({ id: "editLocation", value: employee.location }),
                                new Label({ text: "Role" }),
                                new Input({ id: "editRole", value: employee.role }),
                                new Label({ text: "Status" }),
                                new Input({ id: "editStatus", value: employee.status })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Save",
                        press: async () => {
                            const payload = {
                                fullName: sap.ui.getCore().byId("editFullName").getValue(),
                                email: sap.ui.getCore().byId("editEmail").getValue(),
                                phone: sap.ui.getCore().byId("editPhone").getValue(),
                                location: sap.ui.getCore().byId("editLocation").getValue(),
                                role: sap.ui.getCore().byId("editRole").getValue(),
                                status: sap.ui.getCore().byId("editStatus").getValue()
                            };

                            const response = await fetch(
                                `/odata/v4/asset-admin/Employees(${employee.ID})`,
                                {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload)
                                }
                            );

                            if (response.ok) {
                                await this._loadEmployees();
                                MessageToast.show("Employee updated successfully");
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to update employee");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },

            onDeleteEmployee: function () {
                const oTable = this.byId("employeeTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select an employee first.");
                    return;
                }

                const employee = oItem.getBindingContext("employees").getObject();

                MessageBox.confirm(
                    "Delete employee " + employee.fullName + " ?",
                    {
                        title: "Confirm Delete",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: async (sAction) => {
                            if (sAction === MessageBox.Action.YES) {
                                const response = await fetch(
                                    `/odata/v4/asset-admin/Employees(${employee.ID})`,
                                    { method: "DELETE" }
                                );

                                if (response.ok) {
                                    await this._loadEmployees();
                                    MessageToast.show("Employee deleted successfully");
                                } else {
                                    MessageBox.error("Failed to delete employee");
                                }
                            }
                        }
                    }
                );
            },

            onEmployeeSearch: function (oEvent) {
                const sValue = oEvent.getParameter("newValue").toLowerCase();
                const oModel = this.getView().getModel("employees");
                const aData = oModel.getData();

                const aFiltered = aData.filter(emp => {
                    return (
                        emp.employeeNumber?.toLowerCase().includes(sValue) ||
                        emp.fullName?.toLowerCase().includes(sValue) ||
                        emp.email?.toLowerCase().includes(sValue)
                    );
                });

                oModel.setData(aFiltered);
            },

            // ===== DEPARTMENT SECTION =====

            _loadDepartments: async function () {
                const response = await fetch(
                    "/odata/v4/asset-admin/Departments"
                );
                const data = await response.json();
                const oModel = new JSONModel(data.value);
                this.getView().setModel(oModel, "departments");
            },

            onCreateDepartment: function () {
                const oDialog = new Dialog({
                    title: "Create Department",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Department Name" }),
                                new Input({ id: "deptNameInput" }),
                                new Label({ text: "Cost Center" }),
                                new Input({ id: "costCenterInput" })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Save",
                        press: async () => {
                            const payload = {
                                departmentName: sap.ui.getCore().byId("deptNameInput").getValue(),
                                costCenter: sap.ui.getCore().byId("costCenterInput").getValue(),
                                isActive: true
                            };

                            const response = await fetch(
                                "/odata/v4/asset-admin/Departments",
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload)
                                }
                            );

                            if (response.ok) {
                                await this._loadDepartments();
                                MessageToast.show("Department created successfully");
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to create department");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },

            onEditDepartment: function () {
                const oTable = this.byId("departmentTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select a department first.");
                    return;
                }

                const department = oItem.getBindingContext("departments").getObject();

                const oDialog = new Dialog({
                    title: "Edit Department",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Department Name" }),
                                new Input({ id: "editDeptName", value: department.departmentName }),
                                new Label({ text: "Cost Center" }),
                                new Input({ id: "editCostCenter", value: department.costCenter })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Save",
                        press: async () => {
                            const payload = {
                                departmentName: sap.ui.getCore().byId("editDeptName").getValue(),
                                costCenter: sap.ui.getCore().byId("editCostCenter").getValue()
                            };

                            const response = await fetch(
                                `/odata/v4/asset-admin/Departments(${department.ID})`,
                                {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload)
                                }
                            );

                            if (response.ok) {
                                await this._loadDepartments();
                                MessageToast.show("Department updated successfully");
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to update department");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },

            onDeleteDepartment: function () {
                const oTable = this.byId("departmentTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select a department first.");
                    return;
                }

                const department = oItem.getBindingContext("departments").getObject();

                MessageBox.confirm(
                    "Delete department " + department.departmentName + " ?",
                    {
                        title: "Confirm Delete",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: async (sAction) => {
                            if (sAction === MessageBox.Action.YES) {
                                const response = await fetch(
                                    `/odata/v4/asset-admin/Departments(${department.ID})`,
                                    { method: "DELETE" }
                                );

                                if (response.ok) {
                                    await this._loadDepartments();
                                    MessageToast.show("Department deleted successfully");
                                } else {
                                    MessageBox.error("Failed to delete department");
                                }
                            }
                        }
                    }
                );
            },

            onDepartmentSearch: function (oEvent) {
                const sValue = oEvent.getParameter("newValue").toLowerCase();
                const oModel = this.getView().getModel("departments");
                const aData = oModel.getData();

                const aFiltered = aData.filter(dept => {
                    return (
                        dept.departmentName?.toLowerCase().includes(sValue) ||
                        dept.costCenter?.toLowerCase().includes(sValue)
                    );
                });

                oModel.setData(aFiltered);
            },

            // ===== VENDOR SECTION =====

            _loadVendors: async function () {
                const response = await fetch(
                    "/odata/v4/asset-admin/Vendors?$count=true"
                );
                const data = await response.json();
                const oModel = new JSONModel(data.value);
                this.getView().setModel(oModel, "vendors");
            },

            onCreateVendor: function () {
                const oDialog = new Dialog({
                    title: "Create Vendor",
                    contentWidth: "500px",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Vendor Name" }),
                                new Input({ id: "vendorNameInput" }),
                                new Label({ text: "Email" }),
                                new Input({ id: "vendorEmailInput" }),
                                new Label({ text: "Phone" }),
                                new Input({ id: "vendorPhoneInput" }),
                                new Label({ text: "Address" }),
                                new Input({ id: "vendorAddressInput" })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Save",
                        press: async () => {
                            const payload = {
                                vendorName: sap.ui.getCore().byId("vendorNameInput").getValue(),
                                email: sap.ui.getCore().byId("vendorEmailInput").getValue(),
                                phone: sap.ui.getCore().byId("vendorPhoneInput").getValue(),
                                address: sap.ui.getCore().byId("vendorAddressInput").getValue()
                            };

                            const response = await fetch(
                                "/odata/v4/asset-admin/Vendors",
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload)
                                }
                            );

                            if (response.ok) {
                                await this._loadVendors();
                                MessageToast.show("Vendor created successfully");
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to create vendor");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },

            onEditVendor: function () {
                const oTable = this.byId("vendorTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select a vendor first.");
                    return;
                }

                const vendor = oItem.getBindingContext("vendors").getObject();

                const oDialog = new Dialog({
                    title: "Edit Vendor",
                    contentWidth: "500px",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Vendor Name" }),
                                new Input({ id: "editVendorName", value: vendor.vendorName }),
                                new Label({ text: "Email" }),
                                new Input({ id: "editVendorEmail", value: vendor.email }),
                                new Label({ text: "Phone" }),
                                new Input({ id: "editVendorPhone", value: vendor.phone }),
                                new Label({ text: "Address" }),
                                new Input({ id: "editVendorAddress", value: vendor.address })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Save",
                        press: async () => {
                            const payload = {
                                vendorName: sap.ui.getCore().byId("editVendorName").getValue(),
                                email: sap.ui.getCore().byId("editVendorEmail").getValue(),
                                phone: sap.ui.getCore().byId("editVendorPhone").getValue(),
                                address: sap.ui.getCore().byId("editVendorAddress").getValue()
                            };

                            const response = await fetch(
                                `/odata/v4/asset-admin/Vendors(${vendor.ID})`,
                                {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload)
                                }
                            );

                            if (response.ok) {
                                await this._loadVendors();
                                MessageToast.show("Vendor updated successfully");
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to update vendor");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },

            onDeleteVendor: function () {
                const oTable = this.byId("vendorTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select a vendor first.");
                    return;
                }

                const vendor = oItem.getBindingContext("vendors").getObject();

                MessageBox.confirm(
                    "Delete vendor " + vendor.vendorName + " ?",
                    {
                        title: "Confirm Delete",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: async (sAction) => {
                            if (sAction === MessageBox.Action.YES) {
                                const response = await fetch(
                                    `/odata/v4/asset-admin/Vendors(${vendor.ID})`,
                                    { method: "DELETE" }
                                );

                                if (response.ok) {
                                    await this._loadVendors();
                                    MessageToast.show("Vendor deleted successfully");
                                } else {
                                    MessageBox.error("Failed to delete vendor");
                                }
                            }
                        }
                    }
                );
            },

            onVendorSearch: function (oEvent) {
                const sValue = oEvent.getParameter("newValue").toLowerCase();
                const oModel = this.getView().getModel("vendors");
                const aData = oModel.getData();

                const aFiltered = aData.filter(vendor => {
                    return (
                        vendor.vendorName?.toLowerCase().includes(sValue) ||
                        vendor.email?.toLowerCase().includes(sValue) ||
                        vendor.phone?.toLowerCase().includes(sValue)
                    );
                });

                oModel.setData(aFiltered);
            },

            // ===== CATEGORY SECTION =====

            _loadCategories: async function () {
                const response = await fetch(
                    "/odata/v4/asset-admin/AssetCategories"
                );
                const data = await response.json();
                const oModel = new JSONModel(data.value);
                this.getView().setModel(oModel, "categories");
            },

            onCreateCategory: function () {
                const oDialog = new Dialog({
                    title: "Create Category",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Category Name" }),
                                new Input({ id: "categoryNameInput" }),
                                new Label({ text: "Lifespan Months" }),
                                new Input({ id: "lifespanInput" }),
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
                                categoryName: sap.ui.getCore().byId("categoryNameInput").getValue(),
                                lifespanMonths: parseInt(sap.ui.getCore().byId("lifespanInput").getValue()),
                                active: sap.ui.getCore().byId("categoryActiveInput").getSelected()
                            };

                            const response = await fetch(
                                "/odata/v4/asset-admin/AssetCategories",
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload)
                                }
                            );

                            if (response.ok) {
                                await this._loadCategories();
                                MessageToast.show("Category created successfully");
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to create category");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },

            onEditCategory: function () {
                const oTable = this.byId("categoryTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select a category first.");
                    return;
                }

                const category = oItem.getBindingContext("categories").getObject();

                const oDialog = new Dialog({
                    title: "Edit Category",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Category Name" }),
                                new Input({ id: "editCategoryName", value: category.categoryName }),
                                new Label({ text: "Lifespan Months" }),
                                new Input({ id: "editLifespanMonths", value: category.lifespanMonths }),
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
                                categoryName: sap.ui.getCore().byId("editCategoryName").getValue(),
                                lifespanMonths: parseInt(sap.ui.getCore().byId("editLifespanMonths").getValue()),
                                active: sap.ui.getCore().byId("editCategoryActive").getSelected()
                            };

                            const response = await fetch(
                                `/odata/v4/asset-admin/AssetCategories(${category.ID})`,
                                {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload)
                                }
                            );

                            if (response.ok) {
                                await this._loadCategories();
                                MessageToast.show("Category updated successfully");
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to update category");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },

            onDeleteCategory: function () {
                const oTable = this.byId("categoryTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Please select a category first.");
                    return;
                }

                const category = oItem.getBindingContext("categories").getObject();

                MessageBox.confirm(
                    "Delete category " + category.categoryName + " ?",
                    {
                        title: "Confirm Delete",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: async (sAction) => {
                            if (sAction === MessageBox.Action.YES) {
                                const response = await fetch(
                                    `/odata/v4/asset-admin/AssetCategories(${category.ID})`,
                                    { method: "DELETE" }
                                );

                                if (response.ok) {
                                    await this._loadCategories();
                                    MessageToast.show("Category deleted successfully");
                                } else {
                                    MessageBox.error("Failed to delete category");
                                }
                            }
                        }
                    }
                );
            },

            onCategorySearch: function (oEvent) {
                const sValue = oEvent.getParameter("newValue").toLowerCase();
                const oModel = this.getView().getModel("categories");
                const aData = oModel.getData();

                const aFiltered = aData.filter(category => {
                    return category.categoryName?.toLowerCase().includes(sValue);
                });

                oModel.setData(aFiltered);
            },

            // ===== REPORTS SECTION =====

            _loadAssetReport: async function () {
                const response = await fetch(
                    "/odata/v4/asset-admin/Assets"
                );
                const data = await response.json();
                this.getView().setModel(
                    new JSONModel(data.value),
                    "assetReports"
                );
            },

            _loadRequestReport: async function () {
                const response = await fetch(
                    "/odata/v4/asset-admin/AssetRequests"
                );
                const data = await response.json();
                this.getView().setModel(
                    new JSONModel(data.value),
                    "requestReports"
                );
            },

            _loadEmployeeAssetReport: async function () {
                const response = await fetch(
                    "/odata/v4/asset-admin/Employees"
                );
                const data = await response.json();
                this.getView().setModel(
                    new JSONModel(data.value),
                    "employeeReports"
                );
            },

            onAssetReport: async function () {
                await this._loadAssetReport();
                this.byId("assetReportTable").setVisible(true);
                this.byId("requestReportTable").setVisible(false);
                this.byId("employeeReportTable").setVisible(false);
            },

            onRequestReport: async function () {
                await this._loadRequestReport();
                this.byId("assetReportTable").setVisible(false);
                this.byId("requestReportTable").setVisible(true);
                this.byId("employeeReportTable").setVisible(false);
            },

            onEmployeeAssetReport: async function () {
                await this._loadEmployeeAssetReport();
                this.byId("assetReportTable").setVisible(false);
                this.byId("requestReportTable").setVisible(false);
                this.byId("employeeReportTable").setVisible(true);
            },

            onDownloadPdf: async function () {
                // FIX: Access the library properly from the global window object
                const jsPDF = window.jspdf.jsPDF;
                const doc = new jsPDF();
                
                let y = 20;

                doc.setFontSize(16);
                doc.text("Asset Lifecycle Report", 10, y);
                y += 15;

                if (this.byId("assetReportTable").getVisible()) {
                    const data = this.getView().getModel("assetReports").getData();
                    data.forEach(asset => {
                        doc.setFontSize(10);
                        doc.text("Asset Tag: " + (asset.assetTag || ""), 10, y);
                        y += 7;
                        doc.text("Model: " + (asset.model || ""), 10, y);
                        y += 7;
                        doc.text("Status: " + (asset.status || ""), 10, y);
                        y += 12;
                    });
                } else if (this.byId("requestReportTable").getVisible()) {
                    const data = this.getView().getModel("requestReports").getData();
                    data.forEach(req => {
                        doc.text("Employee: " + (req.employeeName || ""), 10, y);
                        y += 7;
                        doc.text("Category: " + (req.categoryName || ""), 10, y);
                        y += 7;
                        doc.text("Status: " + (req.status || ""), 10, y);
                        y += 12;
                    });
                } else {
                    const data = this.getView().getModel("employeeReports").getData();
                    data.forEach(emp => {
                        doc.text("Employee: " + (emp.fullName || ""), 10, y);
                        y += 7;
                        doc.text("Role: " + (emp.role || ""), 10, y);
                        y += 12;
                    });
                }

                doc.save("Report.pdf");
            },

            onSharePdf: function () {
                const oDialog = new Dialog({
                    title: "Share Report",
                    contentWidth: "400px",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Recipient Email Address" }),
                                new Input({ id: "reportEmailInput", type: "Email", placeholder: "colleague@company.com" })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Open Email & Download",
                        type: "Emphasized",
                        press: () => {
                            const email = sap.ui.getCore().byId("reportEmailInput").getValue();
                            if (!email || !email.includes("@")) {
                                this._showWarning("Please enter a valid email address.");
                                return;
                            }

                            // 1. Generate and download the PDF
                            const jsPDF = window.jspdf.jsPDF;
                            const doc = new jsPDF();
                            let y = 20;

                            doc.setFontSize(16);
                            doc.text("Asset Lifecycle Report", 10, y);
                            y += 15;

                            if (this.byId("assetReportTable").getVisible()) {
                                const data = this.getView().getModel("assetReports").getData();
                                data.forEach(asset => {
                                    doc.setFontSize(10);
                                    doc.text("Asset Tag: " + (asset.assetTag || ""), 10, y);
                                    y += 7;
                                    doc.text("Model: " + (asset.model || ""), 10, y);
                                    y += 7;
                                    doc.text("Status: " + (asset.status || ""), 10, y);
                                    y += 12;
                                });
                            } else if (this.byId("requestReportTable").getVisible()) {
                                const data = this.getView().getModel("requestReports").getData();
                                data.forEach(req => {
                                    doc.text("Employee: " + (req.employeeName || ""), 10, y);
                                    y += 7;
                                    doc.text("Category: " + (req.categoryName || ""), 10, y);
                                    y += 7;
                                    doc.text("Status: " + (req.status || ""), 10, y);
                                    y += 12;
                                });
                            } else {
                                const data = this.getView().getModel("employeeReports").getData();
                                data.forEach(emp => {
                                    doc.text("Employee: " + (emp.fullName || ""), 10, y);
                                    y += 7;
                                    doc.text("Role: " + (emp.role || ""), 10, y);
                                    y += 12;
                                });
                            }

                            // Save the file to the user's computer
                            doc.save("Report.pdf");

                            // 2. Open the user's default email client
                            const subject = encodeURIComponent("Asset Lifecycle Report");
                            const body = encodeURIComponent("Hi,\n\nPlease find the requested Asset Lifecycle Report attached.\n\nBest regards.");
                            window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

                            // 3. Close dialog and show toast
                            MessageToast.show("PDF downloaded. Please attach it to the email.");
                            oDialog.close();
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },
            // ===== REQUEST SECTION =====

            _loadRequests: async function () {
                const response = await fetch(
                    "/odata/v4/asset-admin/AssetRequests"
                );
                const data = await response.json();
                const oModel = new JSONModel(data.value);
                this.getView().setModel(oModel, "requests");
            },

            onApproveRequest: async function () {
                const oTable = this.byId("requestTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Select a request first.");
                    return;
                }

                const request = oItem.getBindingContext("requests").getObject();

                const response = await fetch(
                    `/odata/v4/asset-admin/AssetRequests(${request.ID})/AssetAdminService.ApproveAssetRequest`,
                    { method: "POST" }
                );

                if (response.ok) {
                    await this._loadRequests();
                    MessageToast.show("Request approved successfully");
                } else {
                    MessageBox.error("Failed to approve request");
                }
            },

            onRejectRequest: function () {
                const oTable = this.byId("requestTable");
                const oItem = oTable.getSelectedItem();

                if (!oItem) {
                    this._showWarning("Select a request first.");
                    return;
                }

                const request = oItem.getBindingContext("requests").getObject();

                const oDialog = new Dialog({
                    title: "Reject Request",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Remarks" }),
                                new Input({ id: "rejectRemarks" })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Reject",
                        type: "Negative",
                        press: async () => {
                            const remarks = sap.ui.getCore().byId("rejectRemarks").getValue();

                            const response = await fetch(
                                `/odata/v4/asset-admin/AssetRequests(${request.ID})/AssetAdminService.RejectAssetRequest`,
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ remarks: remarks })
                                }
                            );

                            if (response.ok) {
                                await this._loadRequests();
                                MessageToast.show("Request rejected successfully");
                                oDialog.close();
                            } else {
                                MessageBox.error("Failed to reject request");
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    })
                });
                oDialog.open();
            },

            onRefreshRequests: async function () {
                await this._loadRequests();
                MessageToast.show("Requests refreshed");
            },

            onRequestSearch: function (oEvent) {
                const sValue = oEvent.getParameter("newValue").toLowerCase();
                const oModel = this.getView().getModel("requests");
                const aData = oModel.getData();

                const filtered = aData.filter(req => {
                    return (
                        req.employeeName?.toLowerCase().includes(sValue) ||
                        req.categoryName?.toLowerCase().includes(sValue) ||
                        req.status?.toLowerCase().includes(sValue)
                    );
                });

                oModel.setData(filtered);
            },

            // ===== MENU NAVIGATION =====
            onMenuSelect: function (oEvent) {
                const sTitle = oEvent.getParameter("listItem").getTitle();

                // Hide all containers
                this.byId("dashboardContainer").setVisible(false);
                this.byId("employeesContainer").setVisible(false);
                this.byId("departmentsContainer").setVisible(false);
                this.byId("vendorsContainer").setVisible(false);
                this.byId("categoriesContainer").setVisible(false);
                this.byId("requestsContainer").setVisible(false);
                this.byId("assetsContainer").setVisible(false);
                this.byId("reportsContainer").setVisible(false);

                // Show selected container and load data
                switch (sTitle) {
                    case "Dashboard":
                        this._loadDashboard();
                        this._loadDashboardCharts();
                        this.byId("dashboardContainer").setVisible(true);
                        break;

                    case "Assets":
                        this._loadAssets();
                        this.byId("assetsContainer").setVisible(true);
                        break;

                    case "Asset Requests":
                        this._loadRequests();
                        this.byId("requestsContainer").setVisible(true);
                        break;

                    case "Employees":
                        this._loadEmployees();
                        this.byId("employeesContainer").setVisible(true);
                        break;

                    case "Departments":
                        this._loadDepartments();
                        this.byId("departmentsContainer").setVisible(true);
                        break;

                    case "Vendors":
                        this._loadVendors();
                        this.byId("vendorsContainer").setVisible(true);
                        break;

                    case "Categories":
                        this._loadCategories();
                        this.byId("categoriesContainer").setVisible(true);
                        break;

                    case "Reports":
                        this._loadAssetReport();
                        this.byId("reportsContainer").setVisible(true);
                        break;
                }
            }
        }
    );
});