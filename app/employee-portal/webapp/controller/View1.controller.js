sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (
    Controller,
    JSONModel,
    MessageBox
) {
    "use strict";

    return Controller.extend(
        "employeeportal.controller.View1",
        {
            _currentEmployeeId: null,

            onInit: function () {
                this._initializeEmployee();
            },

            _initializeEmployee: async function () {
                try {
                    const response = await fetch(
                        "/odata/v4/asset-employee/Employees"
                    );
                    const data = await response.json();

                    if (data.value && data.value.length > 0) {
                        const employee = data.value[0];
                        this._currentEmployeeId = employee.ID;

                        console.log("LOGGED EMPLOYEE");
                        console.log(employee);

                        const oProfileModel = new JSONModel(employee);
                        this.getView().setModel(oProfileModel, "profile");

                        await this._loadDashboard();
                    }
                } catch (error) {
                    console.error("Error initializing employee:", error);
                    MessageBox.error("Failed to load employee data");
                }
            },

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

const assetsResponse = await fetch(
    `/odata/v4/asset-employee/Assets?$filter=currentHolder_ID eq '${employeeId}'`
);
                    const assetsData = await assetsResponse.json();
                    const assets = assetsData.value || [];

                    const requestsResponse = await fetch(
                        `/odata/v4/asset-employee/AssetRequests?$filter=employee_ID eq '${employeeId}'`
                    );
                    const requestsData = await requestsResponse.json();
                    const requests = requestsData.value || [];

                    const kpiData = {
                        myAssets: {
                            total: assets.length,
                            assigned: assets.filter(a => a.status === "ASSIGNED").length,
                            maintenance: assets.filter(a => a.status === "MAINTENANCE").length,
                            available: assets.filter(a => a.status === "AVAILABLE").length
                        },
                        myPendingRequests: {
                            total: requests.filter(r => r.status === "PENDING").length,
                            recentRequests: requests
                                .filter(r => r.status === "PENDING")
                                .slice(0, 2)
                        },
                        myApprovedRequests: {
                            total: requests.filter(r => r.status === "APPROVED").length,
readyToAssign: requests.filter(
    r => r.status === "APPROVED"
).length
                        },
                        myAssignedAssets: {
                            total: assets.filter(a => a.status === "ASSIGNED").length,
                            inUse: assets.filter(
                                a => a.status === "ASSIGNED"
                            ).length,
                            inMaintenance: assets.filter(
                                a => a.status === "MAINTENANCE"
                            ).length
                        }
                    };

                    const oDashboardModel = new JSONModel(kpiData);
                    this.getView().setModel(oDashboardModel, "dashboard");

                } catch (error) {
                    console.error("Error loading dashboard KPIs:", error);
                }
            },

            _loadAssets: async function () {
                if (!this._currentEmployeeId) return;

                try {
const employeeId = this._currentEmployeeId;

const response = await fetch(
    `/odata/v4/asset-employee/Assets?$filter=currentHolder_ID eq '${employeeId}'`
);

const data = await response.json();
console.log("CURRENT EMPLOYEE");
console.log(employeeId);

console.log("ASSETS");
console.log(data);
                    const oModel = new JSONModel(data.value || []);
                    this.getView().setModel(oModel, "assets");
                } catch (error) {
                    console.error("Error loading assets:", error);
                    MessageBox.error("Failed to load assets");
                }
            },

            _loadRequests: async function () {
                if (!this._currentEmployeeId) return;

                try {
                    const employeeId = this._currentEmployeeId;
                    const response = await fetch(
                        `/odata/v4/asset-employee/AssetRequests?$filter=employee_ID eq '${employeeId}'`
                    );
                    const data = await response.json();
                    const oModel = new JSONModel(data.value || []);
                    this.getView().setModel(oModel, "requests");
                } catch (error) {
                    console.error("Error loading requests:", error);
                    MessageBox.error("Failed to load requests");
                }
            },

            _loadProfile: async function () {
                if (!this._currentEmployeeId) return;

                try {
                    const response = await fetch(
                        "/odata/v4/asset-employee/Employees"
                    );
                    const data = await response.json();

                    if (data.value && data.value.length > 0) {
                        const oModel = new JSONModel(data.value[0]);
                        this.getView().setModel(oModel, "profile");
                    }
                } catch (error) {
                    console.error("Error loading profile:", error);
                    MessageBox.error("Failed to load profile");
                }
            },

            onMenuSelect: function (oEvent) {
                const sTitle = oEvent.getParameter("listItem").getTitle();

                this.byId("dashboardContainer").setVisible(false);
                this.byId("assetsContainer").setVisible(false);
                this.byId("requestsContainer").setVisible(false);
                this.byId("profileContainer").setVisible(false);

                this.byId("contentTitle").setText(sTitle);

                switch (sTitle) {
                    case "Dashboard":
                        this.byId("contentText").setText(
                            "Employee Self Service Dashboard"
                        );
                        this._loadDashboard();
                        this.byId("dashboardContainer").setVisible(true);
                        break;

                    case "My Assets":
                        this.byId("contentText").setText("Your Assigned Assets");
                        this._loadAssets();
                        this.byId("assetsContainer").setVisible(true);
                        break;

                    case "My Requests":
                        this.byId("contentText").setText("Your Asset Requests");
                        this._loadRequests();
                        this.byId("requestsContainer").setVisible(true);
                        break;

                    case "My Profile":
                        this.byId("contentText").setText("Your Employee Profile");
                        this._loadProfile();
                        this.byId("profileContainer").setVisible(true);
                        break;
                }
            },

            onMyAssetsPress: function () {
                this.byId("navigationMenu").setSelectedItem(
                    this.byId("assetsItem")
                );
                this.onMenuSelect({
                    getParameter: () => ({
                        listItem: { getTitle: () => "My Assets" }
                    })
                });
            },

            onPendingRequestsPress: function () {
                this.byId("navigationMenu").setSelectedItem(
                    this.byId("requestsItem")
                );
                this.onMenuSelect({
                    getParameter: () => ({
                        listItem: { getTitle: () => "My Requests" }
                    })
                });
            }
        }
    );
});