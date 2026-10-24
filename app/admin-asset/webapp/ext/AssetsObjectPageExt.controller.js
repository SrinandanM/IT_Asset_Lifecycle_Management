sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/syncStyleClass"
], function (
    ControllerExtension,
    JSONModel,
    Fragment,
    MessageBox,
    MessageToast,
    syncStyleClass
) {
    "use strict";

    return ControllerExtension.extend("adminasset.ext.AssetsObjectPageExt", {
        // Use the standard extension lifecycle hooks from ControllerExtension
        override: {
            /**
             * Called when the extension is initialized
             */
            onInit: function () {
                // This hook is called when the view is initialized
            }
        },

        /**
         * Pre-action handler for AssignAsset
         * Triggered before Fiori Elements executes the action
         */
        _onAssignAsset: function (oContext, aUnboundActions) {
            return this._handleEmployeeSelection(oContext, "assign");
        },

        /**
         * Pre-action handler for TransferAsset
         */
        _onTransferAsset: function (oContext, aUnboundActions) {
            return this._handleEmployeeSelection(oContext, "transfer");
        },

        /**
         * Pre-action handler for ReturnAsset (no employee selection needed)
         */
        _onReturnAsset: function (oContext, aUnboundActions) {
            // ReturnAsset only needs date, allow normal flow
            return Promise.resolve(true);
        },

        /**
         * Main handler for employee selection
         */
        _handleEmployeeSelection: function (oContext, sActionType) {
            const oView = this.getView();
            const oModel = oView.getModel();

            return new Promise((resolve) => {
                // Load employees
                oModel.read("/Employees", {
                    success: (oData) => {
                        const aEmployees = oData.results || [];
                        
                        // Show dialog
                        this._showEmployeeDialog(aEmployees, sActionType, oContext, oModel, resolve);
                    },
                    error: () => {
                        MessageBox.error("Failed to load employees list");
                        resolve(false);
                    }
                });
            });
        },

        /**
         * Show employee selection dialog
         */
        _showEmployeeDialog: function (aEmployees, sActionType, oContext, oModel, resolve) {
            const oView = this.getView();
            const oController = this;

            Fragment.load({
                id: oView.getId(),
                name: "adminasset.ext.EmployeeSelectionDialog",
                controller: this
            }).then(function (oDialog) {
                // Set employee data
                const oEmployeeModel = new JSONModel(aEmployees);
                oDialog.setModel(oEmployeeModel, "employees");

                // Store action context
                oController._currentAction = {
                    type: sActionType,
                    context: oContext,
                    resolve: resolve
                };

                // Set dialog title
                const sTitle = sActionType === "transfer" ? "Transfer Asset" : "Assign Asset";
                oDialog.setTitle(sTitle);

                // Sync styling
                syncStyleClass("sapUiSizeCompact", oView, oDialog);

                oDialog.open();
            }).catch((oError) => {
                MessageBox.error("Failed to load dialog: " + oError.message);
                resolve(false);
            });
        },

        /**
         * Dialog: Submit button pressed
         */
        onEmployeeDialogSubmit: function () {
            const oDialog = sap.ui.getCore().byId(this.getView().getId() + "--employeeSelectionDialog");
            const oEmployeeCombo = sap.ui.getCore().byId(this.getView().getId() + "--employeeCombo");
            const oDatePicker = sap.ui.getCore().byId(this.getView().getId() + "--assignDatePicker");

            // Validate selection
            if (!oEmployeeCombo.getSelectedKey()) {
                MessageBox.warning("Please select an employee");
                return;
            }

            if (!oDatePicker.getValue()) {
                MessageBox.warning("Please select a date");
                return;
            }

            // Get values
            const sEmployeeID = oEmployeeCombo.getSelectedKey();
            const sDate = oDatePicker.getValue();
            const sEmployeeName = oEmployeeCombo.getSelectedItem().getText();

            // Close dialog
            oDialog.close();

            // Execute action with parameters
            this._executeAction(sEmployeeID, sDate, sEmployeeName);
        },

        /**
         * Dialog: Cancel button pressed
         */
        onEmployeeDialogCancel: function () {
            const oDialog = sap.ui.getCore().byId(this.getView().getId() + "--employeeSelectionDialog");
            oDialog.close();

            if (this._currentAction) {
                this._currentAction.resolve(false);
            }
        },

        /**
         * Execute the action with employee and date parameters
         */
        _executeAction: function (sEmployeeID, sDate, sEmployeeName) {
            const oModel = this.getView().getModel();
            const sActionType = this._currentAction.type;

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

            // Execute the action through OData
            oModel.callFunction(sActionName, {
                method: "POST",
                urlParameters: oParameters,
                success: () => {
                    const sMessage = sActionType === "transfer"
                        ? `Asset transferred to ${sEmployeeName}`
                        : `Asset assigned to ${sEmployeeName}`;

                    MessageToast.show(sMessage);
                    oModel.refresh(true);

                    if (this._currentAction) {
                        this._currentAction.resolve(true);
                    }
                },
                error: (oError) => {
                    let sErrorMsg = "Action failed";
                    if (oError.responseText) {
                        try {
                            const oErrorData = JSON.parse(oError.responseText);
                            sErrorMsg = oErrorData.error?.message || sErrorMsg;
                        } catch (e) {
                            sErrorMsg = oError.responseText;
                        }
                    }
                    MessageBox.error(sErrorMsg);

                    if (this._currentAction) {
                        this._currentAction.resolve(false);
                    }
                }
            });
        }
    });
});
