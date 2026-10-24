sap.ui.define(
    ["sap/fe/core/AppComponent"],
    function (AppComponent) {
        "use strict";

        return AppComponent.extend("adminasset.Component", {
            metadata: {
                manifest: "json"
            },

            init: function () {
                AppComponent.prototype.init.apply(this, arguments);
                
                // Hook into OData request to intercept action parameter dialogs
                this._patchActionDialogs();
            },

            /**
             * Patch Fiori Elements action dialogs to show employee dropdown
             */
            _patchActionDialogs: function () {
                const self = this;
                const oModel = this.getModel();

                // Intercept parameter dialog creation
                if (sap.ui.getCore().getMessageManager) {
                    setTimeout(() => {
                        self._setupActionDialogHandlers();
                    }, 100);
                }
            },

            /**
             * Setup handlers for action dialogs
             */
            _setupActionDialogHandlers: function () {
                const self = this;

                // Listen for dialog creation
                sap.ui.core.BusyIndicator.attachOpen(() => {
                    setTimeout(() => {
                        self._customizeActionDialog();
                    }, 200);
                });
            },

            /**
             * Customize action dialogs to use employee dropdown
             */
            _customizeActionDialog: function () {
                // Find all input fields with UUID pattern
                const aInputs = document.querySelectorAll(
                    'input[placeholder*="id"], input[placeholder*="ID"]'
                );

                aInputs.forEach(oInput => {
                    const sName = oInput.getAttribute('name');
                    const sId = oInput.getAttribute('id');

                    // If it's an employee ID field
                    if (
                        sName?.includes('employeeID') ||
                        sName?.includes('toEmployeeID') ||
                        sId?.includes('employee')
                    ) {
                        // Replace with combobox functionality
                        this._convertToEmployeeDropdown(oInput);
                    }
                });
            },

            /**
             * Convert textbox to employee dropdown
             */
            _convertToEmployeeDropdown: function (oInput) {
                const oModel = this.getModel();
                const self = this;

                // Read employees
                oModel.read('/Employees', {
                    success: (oData) => {
                        const aEmployees = oData.results || [];

                        // Create datalist
                        const oDataList = document.createElement('datalist');
                        oDataList.id = 'employeeList-' + Date.now();

                        aEmployees.forEach((emp) => {
                            const oOption = document.createElement('option');
                            oOption.value = emp.ID;
                            oOption.textContent = `${emp.employeeNumber} - ${emp.fullName}`;
                            oDataList.appendChild(oOption);
                        });

                        // Attach datalist to input
                        document.body.appendChild(oDataList);
                        oInput.setAttribute('list', oDataList.id);
                        oInput.setAttribute('placeholder', 
                            'Start typing employee name or number...');
                        oInput.style.width = '100%';

                        // Auto-complete: when user selects from list, 
                        // extract UUID
                        oInput.addEventListener('change', () => {
                            const sSelected = oInput.value;
                            const oSelected = aEmployees.find(
                                emp => emp.ID === sSelected ||
                                `${emp.employeeNumber} - ${emp.fullName}` === sSelected
                            );
                            if (oSelected) {
                                oInput.value = oSelected.ID;
                            }
                        });

                        // Also handle blur for better UX
                        oInput.addEventListener('blur', () => {
                            const sValue = oInput.value;
                            // If not a UUID, try to find matching employee
                            if (!sValue.includes('-') && sValue.length < 36) {
                                const oMatch = aEmployees.find(
                                    emp => emp.employeeNumber === sValue ||
                                    emp.fullName.includes(sValue)
                                );
                                if (oMatch) {
                                    oInput.value = oMatch.ID;
                                }
                            }
                        });
                    },
                    error: () => {
                        // Fallback: just show placeholder
                        oInput.setAttribute('placeholder', 
                            'Type employee UUID or number...');
                    }
                });
            }
        });
    }
);
