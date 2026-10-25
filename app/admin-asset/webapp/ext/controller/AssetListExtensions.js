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
    "sap/base/util/uid"
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
    uid
) {
    "use strict";

    return ControllerExtension.extend(
        "adminasset.ext.controller.AssetListExtensions",
        {
            // Override action handler globally in the page extension
            override: {
                "sap.fe.core.PageController": {
                    onInit: function() {
                        console.log("=[AssetListExtensions Override onInit]=");
                        // Get the root controller's event bus
                        const that = this;
                        
                        // Store reference to original handler if needed
                        this._originalHandlers = {};
                        
                        // Register for Fiori Elements event after the page is initialized
                        setTimeout(() => {
                            that._registerActionInterceptor();
                        }, 100);
                    },

                    _registerActionInterceptor: function() {
                        console.log("=[Registering Action Interceptor]=");
                        try {
                            const that = this;
                            const oView = this.getView();
                            
                            // Hook into the binding context to intercept actions
                            if (oView && oView.getModel && oView.getModel()) {
                                const oModel = oView.getModel();
                                
                                // Store reference to original callFunction if needed for later
                                if (!oModel.__callFunctionOriginal) {
                                    oModel.__callFunctionOriginal = oModel.callFunction;
                                    oModel.callFunction = function(path, options) {
                                        console.log("=[callFunction intercepted]= Path:", path);
                                        
                                        if (path && path.includes && path.includes("AssignAsset")) {
                                            console.log("=[AssignAsset action captured]= Intercepting...");
                                            // Intercept AssignAsset
                                            that._handleAssignAsset(options);
                                            return;
                                        }
                                        
                                        // Call original for other functions
                                        return oModel.__callFunctionOriginal.apply(oModel, arguments);
                                    };
                                }
                            }
                        } catch (e) {
                            console.error("Error registering interceptor:", e);
                        }
                    },

                    _handleAssignAsset: function(oOptions) {
                        console.log("=[_handleAssignAsset called]=");
                        this._showAssignDialog();
                    }
                }
            },

            _showAssignDialog: function() {
                console.log("_showAssignDialog called");
                try {
                    const that = this;
                    const oView = this.getView();
                    const oModel = oView.getModel();

                    // Get current asset
                    let oAssetContext = null;
                    const oObjectPage = oView.byId("ObjectPage") || 
                                       oView.byId("fe::ObjectPage") ||
                                       oView.getContent()[0];
                    
                    if (oObjectPage && oObjectPage.getBindingContext) {
                        oAssetContext = oObjectPage.getBindingContext();
                    }

                    if (!oAssetContext) {
                        MessageBox.error("No asset selected");
                        return;
                    }

                    const oAsset = oAssetContext.getObject();
                    console.log("Current asset:", oAsset);

                    // Fetch employees
                    oModel.read("/Employees", {
                        success: function(oData) {
                            console.log("Employees fetched:", oData.results.length);
                            that._createAndShowDialog(oData.results, oAsset, oModel);
                        },
                        error: function(oError) {
                            console.error("Error fetching employees:", oError);
                            MessageBox.error("Failed to load employees");
                        }
                    });

                } catch (error) {
                    console.error("Exception in _showAssignDialog:", error);
                    MessageBox.error("Error: " + error.message);
                }
            },

            _createAndShowDialog: function(aEmployees, oAsset, oModel) {
                console.log("Creating dialog with", aEmployees.length, "employees");
                const that = this;

                // Create ComboBox for employee selection
                const oComboBox = new ComboBox({
                    placeholder: "Select Employee",
                    forceSelection: true
                });

                // Add employee items
                aEmployees.forEach(emp => {
                    oComboBox.addItem(new Item({
                        key: emp.ID,
                        text: emp.employeeNumber + " - " + emp.fullName
                    }));
                });

                // Create Date Picker
                const today = new Date();
                const dateValue = today.toISOString().split('T')[0];
                const oDatePicker = new DatePicker({
                    value: dateValue
                });

                // Create Dialog
                const oDialog = new Dialog({
                    title: "Assign Asset",
                    type: "Message",
                    state: "Information",
                    contentWidth: "450px",
                    content: [
                        new VBox({
                            class: "sapUiMediumMargin",
                            items: [
                                new Label({ text: "Asset", required: true }),
                                new Label({ 
                                    text: oAsset.assetTag + " (" + oAsset.model + ")",
                                    design: "Bold"
                                }),
                                new Label({ text: " " }),
                                new Label({ text: "Employee", required: true }),
                                oComboBox,
                                new Label({ text: " " }),
                                new Label({ text: "Assigned Date", required: true }),
                                oDatePicker
                            ]
                        })
                    ],
                    buttons: [
                        new Button({
                            text: "Assign",
                            type: "Emphasized",
                            press: function() {
                                const sEmployeeID = oComboBox.getSelectedKey();
                                const sAssignDate = oDatePicker.getValue();

                                if (!sEmployeeID) {
                                    MessageBox.error("Please select an employee");
                                    return;
                                }

                                if (!sAssignDate) {
                                    MessageBox.error("Please select an assigned date");
                                    return;
                                }

                                console.log("Assigning:", {
                                    assetID: oAsset.ID,
                                    employeeID: sEmployeeID,
                                    assignedDate: sAssignDate
                                });

                                // Call the backend action
                                oModel.callFunction("/AssignAsset", {
                                    method: "POST",
                                    urlParameters: {
                                        assetID: oAsset.ID,
                                        employeeID: sEmployeeID,
                                        assignedDate: sAssignDate
                                    },
                                    success: function(oResponse) {
                                        console.log("Assignment successful:", oResponse);
                                        MessageBox.success("Asset assigned successfully!", {
                                            onClose: function() {
                                                oDialog.close();
                                                // Refresh the page
                                                oModel.refresh();
                                                // Navigate back
                                                const oRouter = sap.ui.core.UIComponent.getRouterFor(that.getView());
                                                oRouter.navTo("AssetsList");
                                            }
                                        });
                                    },
                                    error: function(oError) {
                                        console.error("Assignment error:", oError);
                                        MessageBox.error("Failed to assign asset: " + oError.message);
                                    }
                                });
                            }
                        }),
                        new Button({
                            text: "Cancel",
                            press: function() {
                                oDialog.close();
                            }
                        })
                    ],
                    afterClose: function() {
                        oDialog.destroy();
                    }
                });

                oDialog.open();
            }
        }
    );
});
