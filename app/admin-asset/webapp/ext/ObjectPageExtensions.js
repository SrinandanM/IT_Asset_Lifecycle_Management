sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (JSONModel, Fragment, MessageBox, MessageToast) {
    "use strict";

    return {
        
        /**
         * Pre-action handler for AssignAsset action
         * Intercepts the default action and shows custom employee selection dialog
         */
        onAssignAsset: async function (oContext) {
            try {
                const oAsset = oContext.getObject();
                
                // Load employees
                const oEmployeesModel = await this._loadEmployees();
                
                // Show custom dialog
                return this._showAssignDialog(oEmployeesModel, oAsset, oContext, "Assign Asset");
            } catch (oError) {
                MessageBox.error("Failed to load employees: " + oError.message);
            }
        },

        /**
         * Pre-action handler for TransferAsset action
         */
        onTransferAsset: async function (oContext) {
            try {
                const oAsset = oContext.getObject();
                
                // Load employees
                const oEmployeesModel = await this._loadEmployees();
                
                // Show custom dialog for transfer
                return this._showTransferDialog(oEmployeesModel, oAsset, oContext, "Transfer Asset");
            } catch (oError) {
                MessageBox.error("Failed to load employees: " + oError.message);
            }
        },

        /**
         * Load employees from OData service
         */
        _loadEmployees: function () {
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                oModel.read("/Employees", {
                    success: function (oData) {
                        const aEmployees = oData.results || [];
                        resolve(new JSONModel(aEmployees));
                    },
                    error: function (oError) {
                        reject(oError);
                    }
                });
            });
        },

        /**
         * Show Assign Asset dialog with employee dropdown
         */
        _showAssignDialog: function (oEmployeesModel, oAsset, oContext, sTitle) {
            const oController = this;
            
            return Fragment.load({
                name: "adminasset.ext.AssignAssetDialog",
                controller: this
            }).then(function (oDialog) {
                oDialog.setModel(oEmployeesModel, "employees");
                oDialog.setTitle(sTitle);
                
                // Store context for submit
                oController._oCurrentAsset = oAsset;
                oController._oCurrentContext = oContext;
                oController._oCurrentDialog = oDialog;
                oController._sActionType = "assign";
                
                oDialog.open();
                
                return new Promise(function (resolve) {
                    oController._resolveAction = resolve;
                });
            });
        },

        /**
         * Show Transfer Asset dialog
         */
        _showTransferDialog: function (oEmployeesModel, oAsset, oContext, sTitle) {
            const oController = this;
            
            return Fragment.load({
                name: "adminasset.ext.AssignAssetDialog",
                controller: this
            }).then(function (oDialog) {
                oDialog.setModel(oEmployeesModel, "employees");
                oDialog.setTitle(sTitle);
                
                // Store context for submit
                oController._oCurrentAsset = oAsset;
                oController._oCurrentContext = oContext;
                oController._oCurrentDialog = oDialog;
                oController._sActionType = "transfer";
                
                oDialog.open();
                
                return new Promise(function (resolve) {
                    oController._resolveAction = resolve;
                });
            });
        },

        /**
         * Dialog submit handler
         */
        onDialogSubmit: function () {
            const oEmployeeCombo = sap.ui.core.Fragment.byId(
                "adminasset.ext.AssignAssetDialog",
                "employeeCombo"
            );
            const oDatePicker = sap.ui.core.Fragment.byId(
                "adminasset.ext.AssignAssetDialog",
                "datePicker"
            );

            const sEmployeeID = oEmployeeCombo.getSelectedKey();
            const sDate = oDatePicker.getValue();

            // Validation
            if (!sEmployeeID) {
                MessageBox.warning("Please select an employee");
                return;
            }

            if (!sDate) {
                MessageBox.warning("Please select a date");
                return;
            }

            // Get employee name for confirmation
            const oSelectedItem = oEmployeeCombo.getSelectedItem();
            const sEmployeeName = oSelectedItem ? oSelectedItem.getText() : sEmployeeID;

            // Close dialog
            this._oCurrentDialog.close();

            // Execute the action
            this._executeAction(sEmployeeID, sDate, sEmployeeName);
        },

        /**
         * Execute the action on the backend
         */
        _executeAction: function (sEmployeeID, sDate, sEmployeeName) {
            const oModel = this.getModel();
            const oAsset = this._oCurrentAsset;
            const sActionType = this._sActionType;

            let sActionName = "AssignAsset";
            let oParameters = {
                employeeID: sEmployeeID,
                assignedDate: sDate
            };

            if (sActionType === "transfer") {
                sActionName = "TransferAsset";
                oParameters = {
                    toEmployeeID: sEmployeeID,
                    transferDate: sDate
                };
            }

            // Build action path
            const sPath = oAsset.__metadata.uri + "/" + sActionName;

            // Call the action
            oModel.callFunction(sActionName, {
                method: "POST",
                urlParameters: oParameters,
                context: this._oCurrentContext,
                success: () => {
                    const sMessage = sActionType === "transfer"
                        ? "Asset transferred to " + sEmployeeName
                        : "Asset assigned to " + sEmployeeName;
                    
                    MessageToast.show(sMessage);
                    oModel.refresh(true);
                    
                    if (this._resolveAction) {
                        this._resolveAction();
                    }
                },
                error: (oError) => {
                    MessageBox.error("Action failed: " + (oError.message || "Unknown error"));
                    if (this._resolveAction) {
                        this._resolveAction();
                    }
                }
            });
        },

        /**
         * Dialog cancel handler
         */
        onDialogCancel: function () {
            this._oCurrentDialog.close();
            if (this._resolveAction) {
                this._resolveAction();
            }
        }
    };
});
