sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    const SERVICE_URL = "/odata/v4/asset-employee";
    const SECTION_KEYS = {
        DASHBOARD: "dashboard",
        ASSETS: "assets",
        REQUESTS: "requests",
        PROFILE: "profile"
    };

    return Controller.extend("employeeportal.controller.View1", {

        // ------------------------------------------------------------------
        // Lifecycle
        // ------------------------------------------------------------------
        onInit: function () {
            this._currentEmployeeId = null;

            // Initialize view model for header title/subtitle bindings
            this.getView().setModel(new JSONModel({
                pageTitle: "Employee Self-Service Portal",
                contentTitle: "Dashboard",
                contentSubtitle: "Employee Self Service Dashboard"
            }), "view");

            // Initialize empty data models to prevent binding errors
            this.getView().setModel(new JSONModel({}), "profile");
            this.getView().setModel(new JSONModel({}), "dashboard");
            this.getView().setModel(new JSONModel([]), "assets");
            this.getView().setModel(new JSONModel([]), "requests");

            this._initializeEmployee();
        },

        // ------------------------------------------------------------------
        // Bootstrap
        // ------------------------------------------------------------------
        _initializeEmployee: async function () {
            try {
                this._setBusy(true);
                const response = await fetch(`${SERVICE_URL}/Employees`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} while loading employees`);
                }
                const data = await response.json();
                const employee = (data.value || [])[0];

                if (!employee) {
                    MessageBox.warning("No employee record found for the current user.");
                    return;
                }

                this._currentEmployeeId = employee.ID;
                this.getView().getModel("profile").setData(employee);

                await this._loadDashboard();
            } catch (error) {
                console.error("Error initializing employee:", error);
                MessageBox.error("Failed to load employee data. Please refresh the page.");
            } finally {
                this._setBusy(false);
            }
        },

        // ------------------------------------------------------------------
        // Data Loaders
        // ------------------------------------------------------------------
        _loadDashboard: async function () {
            if (!this._currentEmployeeId) return;
            try {
                await Promise.all([
                    this._loadDashboardKPIs(),
                    this._loadAssets(),
                    this._loadRequests()
                ]);
            } catch (error) {
                console.error("Error loading dashboard:", error);
            }
        },

        _loadDashboardKPIs: async function () {
            if (!this._currentEmployeeId) return;
            try {
                const employeeId = this._currentEmployeeId;
                const [assetsRes, requestsRes] = await Promise.all([
                    fetch(`${SERVICE_URL}/Assets?$filter=currentHolder_ID eq '${employeeId}'`),
                    fetch(`${SERVICE_URL}/AssetRequests?$filter=employee_ID eq '${employeeId}'`)
                ]);

                if (!assetsRes.ok || !requestsRes.ok) {
                    throw new Error("Failed to fetch KPI source data");
                }

                const assets = (await assetsRes.json()).value || [];
                const requests = (await requestsRes.json()).value || [];

                const pendingRequests = requests.filter(r => r.status === "PENDING");
                const approvedRequests = requests.filter(r => r.status === "APPROVED");
                const assignedAssets = assets.filter(a => a.status === "ASSIGNED");
                const maintenanceAssets = assets.filter(a => a.status === "MAINTENANCE");
                const availableAssets = assets.filter(a => a.status === "AVAILABLE");

                this.getView().getModel("dashboard").setData({
                    myAssets: {
                        total: assets.length,
                        assigned: assignedAssets.length,
                        maintenance: maintenanceAssets.length,
                        available: availableAssets.length
                    },
                    myPendingRequests: {
                        total: pendingRequests.length,
                        recentRequests: pendingRequests.slice(0, 2)
                    },
                    myApprovedRequests: {
                        total: approvedRequests.length,
                        readyToAssign: approvedRequests.length // adjust if you have a flag
                    },
                    myAssignedAssets: {
                        total: assignedAssets.length,
                        inUse: assignedAssets.length,
                        inMaintenance: maintenanceAssets.length
                    }
                });
            } catch (error) {
                console.error("Error loading dashboard KPIs:", error);
                MessageBox.error("Failed to load dashboard statistics.");
            }
        },

        _loadAssets: async function () {
            if (!this._currentEmployeeId) return;
            try {
                const response = await fetch(
                    `${SERVICE_URL}/Assets?$filter=currentHolder_ID eq '${this._currentEmployeeId}'`
                );
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const data = await response.json();
                this.getView().getModel("assets").setData(data.value || []);
            } catch (error) {
                console.error("Error loading assets:", error);
                MessageBox.error("Failed to load assets.");
            }
        },

        _loadRequests: async function () {
            if (!this._currentEmployeeId) return;
            try {
                const response = await fetch(
                    `${SERVICE_URL}/AssetRequests?$filter=employee_ID eq '${this._currentEmployeeId}'`
                );
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const data = await response.json();
                this.getView().getModel("requests").setData(data.value || []);
            } catch (error) {
                console.error("Error loading requests:", error);
                MessageBox.error("Failed to load requests.");
            }
        },

        _loadProfile: async function () {
            if (!this._currentEmployeeId) return;
            try {
                const response = await fetch(
                    `${SERVICE_URL}/Employees('${this._currentEmployeeId}')`
                );
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const employee = await response.json();
                this.getView().getModel("profile").setData(employee);
            } catch (error) {
                console.error("Error loading profile:", error);
                MessageBox.error("Failed to load profile.");
            }
        },

        // ------------------------------------------------------------------
        // Navigation
        // ------------------------------------------------------------------
        onMenuSelect: function (oEvent) {
            const sKey = oEvent.getParameter("listItem").getId();
            const oMeta = this._getSectionMeta(sKey);
            if (!oMeta) {
                return;
            }

            // Hide all sections, then show only the selected one
            Object.values(SECTION_KEYS).forEach(section => {
                const containerId = `${section}Container`;
                const oContainer = this.byId(containerId);
                if (oContainer) {
                    oContainer.setVisible(section === oMeta.key);
                }
            });

            // Update header via view model (cleaner than setText calls)
            const oView = this.getView().getModel("view");
            oView.setProperty("/contentTitle", oMeta.title);
            oView.setProperty("/contentSubtitle", oMeta.subtitle);

            // Reload data for the active section
            switch (oMeta.key) {
                case SECTION_KEYS.DASHBOARD:
                    this._loadDashboard();
                    break;
                case SECTION_KEYS.ASSETS:
                    this._loadAssets();
                    break;
                case SECTION_KEYS.REQUESTS:
                    this._loadRequests();
                    break;
                case SECTION_KEYS.PROFILE:
                    this._loadProfile();
                    break;
            }
        },

        // ------------------------------------------------------------------
        // KPI card link handlers
        // ------------------------------------------------------------------
        onMyAssetsPress: function () {
            this._navigateTo("assetsItem");
        },

        onPendingRequestsPress: function () {
            this._navigateTo("requestsItem");
        },

        // ------------------------------------------------------------------
        // Helpers
        // ------------------------------------------------------------------
        _getSectionMeta: function (sItemId) {
            const map = {
                dashboardItem: {
                    key: SECTION_KEYS.DASHBOARD,
                    title: "Dashboard",
                    subtitle: "Employee Self Service Dashboard"
                },
                assetsItem: {
                    key: SECTION_KEYS.ASSETS,
                    title: "My Assets",
                    subtitle: "Your Assigned Assets"
                },
                requestsItem: {
                    key: SECTION_KEYS.REQUESTS,
                    title: "My Requests",
                    subtitle: "Your Asset Requests"
                },
                profileItem: {
                    key: SECTION_KEYS.PROFILE,
                    title: "My Profile",
                    subtitle: "Your Employee Profile"
                }
            };
            return map[sItemId];
        },

        _navigateTo: function (sItemId) {
            const oList = this.byId("navigationMenu");
            const oItem = this.byId(sItemId);
            if (!oList || !oItem) {
                return;
            }
            oList.setSelectedItem(oItem);
            // Fire the real selectionChange handler
            this.onMenuSelect({ getParameter: () => ({ listItem: oItem }) });
        },

        _setBusy: function (bBusy) {
            const oPage = this.byId("employeePage");
            if (oPage) {
                oPage.setBusy(bBusy);
            }
        }
    });
});