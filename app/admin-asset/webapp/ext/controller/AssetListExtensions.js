sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/m/ComboBox",
    "sap/ui/core/Item",
    "sap/m/Dialog",
    "sap/m/VBox",
    "sap/m/Label",
    "sap/m/Button",
    "sap/m/DatePicker",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (
    ControllerExtension,
    ComboBox,
    Item,
    Dialog,
    VBox,
    Label,
    Button,
    DatePicker,
    MessageBox,
    JSONModel
) {
    "use strict";

    return ControllerExtension.extend(
        "sap.suite.ui.generic.template.ObjectPage.view.ObjectPage",
        {
            // Hook into action dialog - intercept AssignAsset
            onBeforeAction: function (oEvent) {
                const sActionName = oEvent.getParameter("actionName");

                if (sActionName === "AssignAsset") {
                    // Prevent default dialog
                    oEvent.preventDefault();
                    // Show custom dialog
                    this._showAssignAssetDialog();
                }
            },

            _showAssignAssetDialog: async function () {
                try {
                    const oController = this.getView().getController();
                    const oModel = oController.getView().getModel();

                    // Fetch employees
                    const employees = await this._fetchEmployees(oModel);
                    
                    if (!employees || employees.length === 0) {
                        MessageBox.error("No employees found. Cannot assign asset.");
                        return;
                    }

                    this._openCustomDialog(employees, oModel);
                } catch (error) {
                    console.error("Error showing assign dialog:", error);
                    MessageBox.error("Failed to load assign dialog: " + error.message);
                }
            },

            _fetchEmployees: function (oModel) {
                return new Promise((resolve, reject) => {
                    oModel.read("/Employees", {
                        success: function (oData) {
                            console.log("Employees loaded:", oData.results.length);
                            resolve(oData.results);
                        },
                        error: function (oError) {
                            console.error("Error loading employees:", oError);
                            reject(oError);
                        }
                    });
                });
            },

            _openCustomDialog: function (aEmployees, oModel) {
                const self = this;
                const oView = this.getView();

                // Create ComboBox with employee list
                const oComboBox = new ComboBox({
                    id: "assignEmployeeCombo",
                    placeholder: "Select Employee",
                    forceSelection: true,
                    items: aEmployees.map(emp =>
                        new Item({
                            key: emp.ID,
                            text: emp.employeeNumber + " - " + emp.fullName
                        })
                    )
                });

                // Create Date Picker
                const today = new Date();
                const dateString = today.getFullYear() + "-" + 
                                  String(today.getMonth() + 1).padStart(2, "0") + "-" + 
                                  String(today.getDate()).padStart(2, "0");

                const oDatePicker = new DatePicker({
                    id: "assignDatePicker",
                    value: dateString
                });

                // Create Dialog
                const oDialog = new Dialog({
                    title: "Assign Asset to Employee",
                    type: "Message",
                    state: "Information",
                    contentWidth: "500px",
                    content: [
                        new VBox({
                            items: [
                                new Label({
                                    text: "Employee"
                                }),
                                oComboBox,
                                new Label({
                                    text: "Assigned Date"
                                }),
                                oDatePicker
                            ]
                        }).addStyleClass("sapUiMediumMargin")
                    ],
                    buttons: [
                        new Button({
                            text: "Assign",
                            type: "Emphasized",
                            press: () => self._assignAsset(
                                oComboBox.getSelectedKey(),
                                oDatePicker.getValue(),
                                oModel,
                                oDialog
                            )
                        }),
                        new Button({
                            text: "Cancel",
                            press: () => {
                                oDialog.close();
                                oDialog.destroy();
                            }
                        })
                    ],
                    afterClose: function (oEvent) {
                        oDialog.destroy();
                    }
                });

                oDialog.open();
            },

            _assignAsset: async function (employeeID, assignedDate, oModel, oDialog) {
                if (!employeeID) {
                    MessageBox.error("Please select an employee");
                    return;
                }

                if (!assignedDate) {
                    MessageBox.error("Please select an assigned date");
                    return;
                }

                try {
                    // Get the current asset from the view context
                    const oObjectPageLayout = this.getView().byId("ObjectPageLayout");
                    if (!oObjectPageLayout) {
                        MessageBox.error("Cannot determine asset context");
                        return;
                    }

                    const oBindingContext = oObjectPageLayout.getBindingContext();
                    if (!oBindingContext) {
                        MessageBox.error("No asset selected");
                        return;
                    }

                    const assetData = oBindingContext.getObject();
                    const assetID = assetData.ID;

                    console.log("Assigning asset:", {
                        assetID: assetID,
                        employeeID: employeeID,
                        assignedDate: assignedDate
                    });

                    // Call backend action
                    await new Promise((resolve, reject) => {
                        oModel.callFunction("/AssignAsset", {
                            method: "POST",
                            urlParameters: {
                                assetID: assetID,
                                employeeID: employeeID,
                                assignedDate: assignedDate
                            },
                            success: (oData) => {
                                console.log("Assignment successful:", oData);
                                MessageBox.success("Asset assigned successfully");
                                oDialog.close();
                                oDialog.destroy();
                                // Refresh the view
                                oModel.refresh();
                                resolve(oData);
                            },
                            error: (oError) => {
                                console.error("Assignment failed:", oError);
                                const errorMsg = oError.responseText ? 
                                    JSON.parse(oError.responseText).error.message : 
                                    "Assignment failed";
                                MessageBox.error("Error: " + errorMsg);
                                reject(oError);
                            }
                        });
                    });

                } catch (error) {
                    console.error("Exception during assignment:", error);
                    MessageBox.error("Assignment error: " + error.message);
                }
            }
        }
    );
});
