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

        onInit: function () {
            this._currentEmployeeId = null;

            this.getView().setModel(new JSONModel({
                pageTitle: "Employee Self-Service Portal",
                contentTitle: "Dashboard",
                contentSubtitle: "Employee Self Service Dashboard"
            }), "view");

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
        
        // Fetch the employee. 
        // In Build Work Zone, the backend CDS filter ($user.email) 
        // will automatically return ONLY the logged-in user.
        const response = await fetch(`${SERVICE_URL}/Employees`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while loading employees`);
        }
        
        const data = await response.json();
        const employee = (data.value || [])[0];

        if (!employee) {
            // If the user logs in but has no record in the database
            MessageBox.error("Your user profile is not set up in the system. Please contact IT.");
            return;
        }

        // Set the ID for the rest of the app to load Assets and Requests
        this._currentEmployeeId = employee.ID;
        
        // Populate the "profile" model (this populates your beautiful Profile view)
        this.getView().getModel("profile").setData(employee);

        // Load the KPIs, Assets, and Requests for this specific employee
        await this._loadDashboard();
        
    } catch (error) {
        console.error("Error initializing employee:", error);
        MessageBox.error("Failed to load employee data. Please check your connection.");
    } finally {
        this._setBusy(false);
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
                const [assetsRes, requestsRes] = await Promise.all([
                    fetch(`${SERVICE_URL}/Assets?$filter=currentHolder_ID eq '${employeeId}'`),
                    fetch(`${SERVICE_URL}/AssetRequests?$filter=employee_ID eq '${employeeId}'`)
                ]);

                if (!assetsRes.ok || !requestsRes.ok) throw new Error("Failed to fetch KPIs");

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
                        readyToAssign: approvedRequests.length 
                    },
                    myAssignedAssets: {
                        total: assignedAssets.length,
                        inUse: assignedAssets.length,
                        inMaintenance: maintenanceAssets.length
                    }
                });
            } catch (error) {
                console.error("Error loading dashboard KPIs:", error);
            }
        },

        _loadAssets: async function () {
            if (!this._currentEmployeeId) return;
            try {
                const response = await fetch(`${SERVICE_URL}/Assets?$filter=currentHolder_ID eq '${this._currentEmployeeId}'`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                this.getView().getModel("assets").setData(data.value || []);
            } catch (error) {
                console.error("Error loading assets:", error);
            }
        },

        _loadRequests: async function () {
            if (!this._currentEmployeeId) return;
            try {
                const response = await fetch(`${SERVICE_URL}/AssetRequests?$filter=employee_ID eq '${this._currentEmployeeId}'`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                this.getView().getModel("requests").setData(data.value || []);
            } catch (error) {
                console.error("Error loading requests:", error);
            }
        },

        _loadProfile: async function () {
            if (!this._currentEmployeeId) return;
            try {
                const response = await fetch(`${SERVICE_URL}/Employees('${this._currentEmployeeId}')`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const employee = await response.json();
                this.getView().getModel("profile").setData(employee);
            } catch (error) {
                console.error("Error loading profile:", error);
            }
        },

        onMenuSelect: function (oEvent) {
            // Strip SAPUI5's auto-generated prefix (e.g. "container-employeeportal---View1--")
            let sKey = oEvent.getParameter("listItem").getId();
            sKey = sKey.substring(sKey.lastIndexOf("--") + 2);
            
            const oMeta = this._getSectionMeta(sKey);
            if (!oMeta) return;

            // Instead of setVisible, set the selected key on the IconTabBar
            const oTabBar = this.byId("mainTabBar");
            if (oTabBar) {
                oTabBar.setSelectedKey(oMeta.key);
            }

            // Update header text
            const oView = this.getView().getModel("view");
            oView.setProperty("/contentTitle", oMeta.title);
            oView.setProperty("/contentSubtitle", oMeta.subtitle);

            // Reload data
            switch (oMeta.key) {
                case "dashboard": this._loadDashboard(); break;
                case "assets": this._loadAssets(); break;
                case "requests": this._loadRequests(); break;
                case "profile": this._loadProfile(); break;
            }
        },

        _getSectionMeta: function (sItemId) {
 const map = {
    assetsItem: {
        key: "assets",
        title: "My Assets",
        subtitle: "Your Assigned Assets"
    },
    requestsItem: {
        key: "requests",
        title: "My Requests",
        subtitle: "Your Asset Requests"
    },
    profileItem: {
        key: "profile",
        title: "My Profile",
        subtitle: "Your Employee Profile"
    }
};
            return map[sItemId];
        },

        _setBusy: function (bBusy) {
            const oPage = this.byId("employeePage");
            if (oPage) oPage.setBusy(bBusy);
        }
    });
});