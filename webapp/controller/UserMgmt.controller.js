sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "../model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Fragment, MessageBox, formatter) {
        "use strict";

        return Controller.extend("com.alloc.user.mgmt.allocusermgmt.controller.UserMgmt", {
            formatter: formatter,

            onInit: function () {
                this._populateTable();
                this._createAcessTypeModel();
                this._createStatusModel();
            },

            onAfterRendering: function () {
                this._resourceBundle = this.getView().getModel("i18n").getResourceBundle();
            },

            _createAcessTypeModel: function () {
                var accessTypeJSON = {
                    "results": [{
                        "text": "DISP"
                    }, {
                        "text": "CHNG"
                    }, {
                        "text": "FULL"
                    }, {
                        "text": "ADMN"
                    }]
                };
                var oModel = new JSONModel();
                oModel.setData(accessTypeJSON);
                this.getView().setModel(oModel, "accessTypeModel");
            },

            _createStatusModel: function () {
                var statusJSON = {
                    "results": [{
                        "key": true,
                        "text": "Active"
                    }, {
                        "key": false,
                        "text": "Inactive"
                    }]
                };
                var oModel = new JSONModel();
                oModel.setData(statusJSON);
                this.getView().setModel(oModel, "status");
            },

            _populateTable: function () {
                var oTable = this.getView().byId("idUserMgmtTable");
                var oModel = this.getOwnerComponent().getModel();
                var oView = this.getView();
                oTable.setBusy(true);
                oModel.read('/UserMngmnt', {
                    success: function (oData, response) {
                        var oUserModel = new JSONModel();
                        oUserModel.setData(oData);
                        oView.setModel(oUserModel, "tableData");
                        oTable.setBusy(false);
                    }, error: function (err) {
                        oTable.setBusy(false);
                    }
                });
            },

            onAddPress: function () {
                this._openUserCreateFragment();
            },

            _openUserCreateFragment: function () {
                var oView = this.getView();
                var that = this;
                // create dialog lazily
                if (!this._sDialog) {
                    // load asynchronous XML fragment
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.alloc.user.mgmt.allocusermgmt.fragments.AddUser",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        that._createUserModel();
                        oDialog.open();
                    });
                } else {
                    this._createUserModel();
                    this._sDialog.open();
                }
            },

            _createUserModel: function () {
                var oModel = new JSONModel();
                this.getView().setModel(oModel, "createData");
            },

            onUserDetailsSubmit: function () {
                var that = this;
                var oDetails = this.getView().getModel("createData").getData();
                var oAccessType = this.getView().byId("idAddSelectAccessType").getSelectedKey();
                var oStatus = this.getView().byId("idAddSelectStatus").getSelectedKey();
                oStatus = oStatus === "true"
                var createJSON = {
                    "Uname": oDetails.Uname,
                    "Company": oDetails.Company,
                    "PlanningScreen": oDetails.PlanningScreen,
                    "AcessType": oAccessType,
                    "Status": oStatus,
                    "CBUser": oDetails.CBUser
                };
                var oModel = this.getOwnerComponent().getModel();
                oModel.create('/UserMngmnt', createJSON, {
                    success: function (oData, response) {
                        var msg = 'User ' + oData.Uname + ' added successfully';
                        sap.m.MessageToast.show(msg);
                        that.onUserDetailsCancel();
                        that._populateTable();
                    }, error: function (err) {

                    }
                });
            },

            onUserDetailsCancel: function () {
                var oCreateDialog = this.getView().byId("idAddUserDialog");
                oCreateDialog.close();
                oCreateDialog.destroy();
            },

            onEditPress: function () {
                var that = this;
                var oTable = this.getView().byId("idUserMgmtTable");
                var oItem = oTable.getSelectedItem();
                if (oItem) {
                    var oEntry = oItem.getBindingContext("tableData").getObject();
                    this._openUserEditFragment(oEntry);
                } else {
                    var oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
                    MessageBox.error(oResourceBundle.getText("editError"), {
                        title: oResourceBundle.getText("error"),
                        actions: sap.m.MessageBox.Action.CLOSE,
                        textDirection: sap.ui.core.TextDirection.Inherit
                    });
                }

            },

            _openUserEditFragment: function (data) {
                var oView = this.getView();
                var that = this;
                // create dialog lazily
                if (!this._sDialog) {
                    // load asynchronous XML fragment
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.alloc.user.mgmt.allocusermgmt.fragments.EditUser",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        that._editUserModel(data);
                        oDialog.open();
                    });
                } else {
                    this._sDialog.open();
                }
            },

            _editUserModel: function (data) {
                var oModel = new JSONModel();
                oModel.setData(data);
                this.getView().setModel(oModel, "editUserData");
                this.getView().byId("idEditSelectAccessType").setSelectedKey(data.AcessType);
                var oStatus = this.getView().byId("idEditSelectStatus").setSelectedKey(data.Status);
            },

            onUserEditConfirm: function () {
                var that = this;
                var oDetails = this.getView().getModel("editUserData").getData();
                var oAccessType = this.getView().byId("idEditSelectAccessType").getSelectedKey();
                var oStatus = this.getView().byId("idEditSelectStatus").getSelectedKey();
                oStatus = oStatus === "true"
                var updateJSON = {
                    "Uname": oDetails.Uname,
                    "Company": oDetails.Company,
                    "PlanningScreen": oDetails.PlanningScreen,
                    "AcessType": oAccessType,
                    "Status": oStatus,
                    "CBUser": oDetails.CBUser
                };
                var oModel = this.getOwnerComponent().getModel();
                oModel.update("/UserMngmnt(Uname='" + oDetails.Uname + "',PlanningScreen='" + oDetails.PlanningScreen + "')", updateJSON, {
                    success: function (oData, response) {
                        var msg = 'User ' + oDetails.Uname + ' modified successfully';
                        sap.m.MessageToast.show(msg);
                        that.onUserEditCancel();
                        that._populateTable();
                    }, error: function (err) {

                    }
                });
            },

            onUserEditCancel: function () {
                var oEditDialog = this.getView().byId("idEditUserDialog");
                oEditDialog.close();
                oEditDialog.destroy();
            },

            onDeletePress: function () {
                var that = this;
                var oTable = this.getView().byId("idUserMgmtTable");
                var oItem = oTable.getSelectedItem();
                if (oItem) {
                    var oEntry = oItem.getBindingContext("tableData").getObject();
                    var oModel = this.getOwnerComponent().getModel();
                    oModel.remove("/UserMngmnt(Uname='" + oEntry.Uname + "',PlanningScreen='" + oEntry.PlanningScreen + "')", {
                        success: function (oData, response) {
                            var msg = 'User ' + oEntry.Uname + ' deleted successfully';
                            sap.m.MessageToast.show(msg);
                            that._populateTable();
                        }, error: function (err) {
                            var msg = 'Could not delete User ' + oEntry.Uname;
                            sap.m.MessageToast.show(msg);
                        }
                    });
                } else {
                    var oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
                    MessageBox.error(oResourceBundle.getText("deleteError"), {
                        title: oResourceBundle.getText("error"),
                        actions: sap.m.MessageBox.Action.CLOSE,
                        textDirection: sap.ui.core.TextDirection.Inherit
                    });
                }
            },

            onValueHelpUserName: function () {
                var that = this;
                var oView = this.getView();
                var oInput = oView.byId("idUserNameFilterInput");
                var sValueHelpID = "idUserNameValueHelp";
                if (!this._oUserNameValueHelpDialog) {
                    this._oUserNameValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog(sValueHelpID, {
                        key: "Uname",
                        supportMultiselect: true,
                        descriptionKey: "Uname",
                        ok: function (oEvent) {
                            var oInputVal = oEvent.getParameter("tokens");
                            oInput.setTokens(oInputVal);
                            this.close();
                        },
                        cancel: function () {
                            this.close();
                        }
                    });
                }
                var oDialog = this._oUserNameValueHelpDialog;
                oDialog.setTitle(this._resourceBundle.getText("usernameSelect"));
                // // Add a search field to the dialog
                var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                    advancedMode: true
                });
                var oSearchField = new sap.m.SearchField({
                    width: "auto",
                    placeholder: "Search...",
                    showMagnifier: true,
                    search: function (oEvent) {
                        var aFilter = [];
                        var sValue = oEvent.getParameter("query");
                        var oFilter = new sap.ui.model.Filter("Uname", sap.ui.model.FilterOperator.Contains, sValue);
                        aFilter.push(oFilter);
                        that._loadUsers(oDialog, aFilter);
                    }
                });

                var oFilterGroupItem1 = new sap.ui.comp.filterbar.FilterGroupItem({
                    name: "SearchField", // Unique name for the filter group item
                    groupName: "Group 1", // Name of the filter group,
                    label: "Search User Name",
                    control: oSearchField, // Replace with your filter control
                });

                oFilterBar.addFilterGroupItem(oFilterGroupItem1);

                oDialog.setFilterBar(oFilterBar);
                oDialog.setTokens([]);
                oDialog.setTokens(oInput.getTokens());     

                //Bind the columns for table
                var oColModel = new sap.ui.model.json.JSONModel();
                oColModel.setData({
                    cols: [
                        { label: "User Name", template: "Uname" }
                    ]
                });

                var oTable = oDialog.getTable();
                oTable.setModel(oColModel, "columns");
                this._loadUsers(oDialog);
            },

            _loadUsers: function (oDialog, aFilter) {
                var oTable = oDialog.getTable();
                var oModel = this.getOwnerComponent().getModel();
                if (aFilter) {
                    oModel.read("/UserMngmnt", {
                        filters: aFilter,
                        urlParameters: { "$select": "Uname", "$orderby": "Uname" },
                        success: function (oData, response) {
                            var oRowModel = new JSONModel();
                            var aData = { "results": [] };
                            for (var i = 0; i < oData.results.length; i++) {
                                if (i === 0) {
                                    var sUserName = oData.results[i].Uname;
                                    aData.results.push({ "Uname": sUserName });
                                } else {
                                    if (oData.results[i].Uname === sUserName) {
                                        continue;
                                    } else {
                                        aData.results.push({ "Uname": oData.results[i].Uname });
                                        sUserName = oData.results[i].Uname;
                                    }
                                }
                            }
                            oRowModel.setData(aData);
                            oTable.setModel(oRowModel);
                            oTable.bindRows("/results");
                            oDialog.update();
                        }, error: function (err) {

                        }
                    });
                } else {
                    oModel.read("/UserMngmnt", {
                        urlParameters: { "$select": "Uname", "$orderby": "Uname" },
                        success: function (oData, response) {
                            var oRowModel = new JSONModel();
                            var aData = { "results": [] };
                            for (var i = 0; i < oData.results.length; i++) {
                                if (i === 0) {
                                    var sUserName = oData.results[i].Uname;
                                    aData.results.push({ "Uname": sUserName });
                                } else {
                                    if (oData.results[i].Uname === sUserName) {
                                        continue;
                                    } else {
                                        aData.results.push({ "Uname": oData.results[i].Uname });
                                        sUserName = oData.results[i].Uname;
                                    }
                                }
                            }
                            oRowModel.setData(aData);
                            oTable.setModel(oRowModel);
                            oTable.bindRows("/results");
                            oDialog.update();
                            oDialog.open();
                        }, error: function (err) {

                        }
                    });
                }
            },

            onValueHelpCBUser: function () {
                var that = this;
                var oView = this.getView();
                var oInput = oView.byId("idCBUserIDFilterInput");
                var sValueHelpID = "idCBUserIDValueHelp";
                if (!this._oCBUserValueHelpDialog) {
                    this._oCBUserValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog(sValueHelpID, {
                        key: "CBUser",
                        supportMultiselect: true,
                        descriptionKey: "Uname",
                        ok: function (oEvent) {
                            var oInputVal = oEvent.getParameter("tokens");
                            oInput.setTokens(oInputVal);
                            this.close();
                        },
                        cancel: function () {
                            this.close();
                        }
                    });
                }
                var oDialog = this._oCBUserValueHelpDialog;
                oDialog.setTitle(this._resourceBundle.getText("cbUserIDSelect"));
                // // Add a search field to the dialog
                var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                    advancedMode: true
                });
                var oSearchField = new sap.m.SearchField({
                    width: "auto",
                    placeholder: "Search...",
                    showMagnifier: true,
                    search: function (oEvent) {
                        var aFilter = [];
                        var sValue = oEvent.getParameter("query");
                        var oFilter = new sap.ui.model.Filter("CBUser", sap.ui.model.FilterOperator.Contains, sValue);
                        aFilter.push(oFilter);
                        that._loadCBUser(oDialog, aFilter);
                    }
                });

                var oFilterGroupItem1 = new sap.ui.comp.filterbar.FilterGroupItem({
                    name: "SearchField", // Unique name for the filter group item
                    groupName: "Group 1", // Name of the filter group,
                    label: "Search CB User ID",
                    control: oSearchField, // Replace with your filter control
                });

                oFilterBar.addFilterGroupItem(oFilterGroupItem1);

                oDialog.setFilterBar(oFilterBar);
                oDialog.setTokens([]);
                oDialog.setTokens(oInput.getTokens());     

                //Bind the columns for table
                var oColModel = new sap.ui.model.json.JSONModel();
                oColModel.setData({
                    cols: [
                        { label: "CB User ID", template: "CBUser" },
                        { label: "User Name", template: "Uname" }
                    ]
                });

                var oTable = oDialog.getTable();
                oTable.setModel(oColModel, "columns");
                this._loadCBUser(oDialog);
            },

            _loadCBUser: function (oDialog, aFilter) {
                var oTable = oDialog.getTable();
                var oModel = this.getOwnerComponent().getModel();
                if (aFilter) {
                    oModel.read("/UserMngmnt", {
                        filters: aFilter,
                        urlParameters: { "$select": "CBUser, Uname", "$orderby": "CBUser" },
                        success: function (oData, response) {
                            var oRowModel = new JSONModel();
                            var aData = { "results": [] };
                            for (var i = 0; i < oData.results.length; i++) {
                                if (i === 0) {
                                    var sUserName = oData.results[i].CBUser;
                                    aData.results.push({ "CBUser": sUserName, "Uname": oData.results[i].Uname });
                                } else {
                                    if (oData.results[i].CBUser === sUserName) {
                                        continue;
                                    } else {
                                        aData.results.push({ "CBUser": oData.results[i].CBUser, "Uname": oData.results[i].Uname });
                                        sUserName = oData.results[i].CBUser;
                                    }
                                }
                            }
                            oRowModel.setData(aData);
                            oTable.setModel(oRowModel);
                            oTable.bindRows("/results");
                            oDialog.update();
                        }, error: function (err) {

                        }
                    });
                } else {
                    oModel.read("/UserMngmnt", {
                        urlParameters: { "$select": "CBUser, Uname", "$orderby": "CBUser" },
                        success: function (oData, response) {
                            var oRowModel = new JSONModel();
                            var aData = { "results": [] };
                            for (var i = 0; i < oData.results.length; i++) {
                                if (i === 0) {
                                    var sUserName = oData.results[i].CBUser;
                                    aData.results.push({ "CBUser": sUserName, "Uname": oData.results[i].Uname });
                                } else {
                                    if (oData.results[i].CBUser === sUserName) {
                                        continue;
                                    } else {
                                        aData.results.push({ "CBUser": oData.results[i].CBUser, "Uname": oData.results[i].Uname });
                                        sUserName = oData.results[i].CBUser;
                                    }
                                }
                            }
                            oRowModel.setData(aData);
                            oTable.setModel(oRowModel);
                            oTable.bindRows("/results");
                            oDialog.update();
                            oDialog.open();
                        }, error: function (err) {

                        }
                    });
                }
            },

            onValueHelpCompany: function () {
                var that = this;
                var oView = this.getView();
                var oInput = oView.byId("idCompanyFilterInput");
                var sValueHelpID = "idCompanyValueHelp";
                if (!this._oCompanyValueHelpDialog) {
                    this._oCompanyValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog(sValueHelpID, {
                        key: "Company",
                        supportMultiselect: true,
                        descriptionKey: "Company",
                        ok: function (oEvent) {
                            var oInputVal = oEvent.getParameter("tokens");
                            oInput.setTokens(oInputVal);
                            this.close();
                        },
                        cancel: function () {
                            this.close();
                        }
                    });
                }
                var oDialog = this._oCompanyValueHelpDialog;
                oDialog.setTitle(this._resourceBundle.getText("companySelect"));
                // // Add a search field to the dialog
                var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                    advancedMode: true
                });
                var oSearchField = new sap.m.SearchField({
                    width: "auto",
                    placeholder: "Search...",
                    showMagnifier: true,
                    search: function (oEvent) {
                        var aFilter = [];
                        var sValue = oEvent.getParameter("query");
                        var oFilter = new sap.ui.model.Filter("Company", sap.ui.model.FilterOperator.Contains, sValue);
                        aFilter.push(oFilter);
                        that._loadCompany(oDialog, aFilter)
                    }
                });

                var oFilterGroupItem1 = new sap.ui.comp.filterbar.FilterGroupItem({
                    name: "SearchField", // Unique name for the filter group item
                    groupName: "Group 1", // Name of the filter group,
                    label: "Search Company",
                    control: oSearchField, // Replace with your filter control
                });

                oFilterBar.addFilterGroupItem(oFilterGroupItem1);

                oDialog.setFilterBar(oFilterBar);
                oDialog.setTokens([]);
                oDialog.setTokens(oInput.getTokens());     

                //Bind the columns for table
                var oColModel = new sap.ui.model.json.JSONModel();
                oColModel.setData({
                    cols: [
                        { label: "Company", template: "Company" }
                    ]
                });
                var oTable = oDialog.getTable();
                oTable.setModel(oColModel, "columns");
                this._loadCompany(oDialog);
            },

            _loadCompany: function (oDialog, aFilter) {
                var oTable = oDialog.getTable();
                var oModel = this.getOwnerComponent().getModel();
                if (aFilter) {
                    oModel.read("/UserMngmnt", {
                        filters: aFilter,
                        urlParameters: { "$select": "Company", "$orderby": "Company" },
                        success: function (oData, response) {
                            var oRowModel = new JSONModel();
                            var aData = { "results": [] };
                            for (var i = 0; i < oData.results.length; i++) {
                                if (i === 0) {
                                    var sCompany = oData.results[i].Company;
                                    aData.results.push({ "Company": sCompany });
                                } else {
                                    if (oData.results[i].Company === sCompany) {
                                        continue;
                                    } else {
                                        aData.results.push({ "Company": oData.results[i].Company });
                                        sCompany = oData.results[i].Company;
                                    }
                                }
                            }
                            oRowModel.setData(aData);
                            oTable.setModel(oRowModel);
                            oTable.bindRows("/results");
                            oDialog.update();
                        }, error: function (err) {

                        }
                    });
                } else {
                    oModel.read("/UserMngmnt", {
                        urlParameters: { "$select": "Company", "$orderby": "Company" },
                        success: function (oData, response) {
                            var oRowModel = new JSONModel();
                            var aData = { "results": [] };
                            for (var i = 0; i < oData.results.length; i++) {
                                if (i === 0) {
                                    var sCompany = oData.results[i].Company;
                                    aData.results.push({ "Company": sCompany });
                                } else {
                                    if (oData.results[i].Company === sCompany) {
                                        continue;
                                    } else {
                                        aData.results.push({ "Company": oData.results[i].Company });
                                        sCompany = oData.results[i].Company;
                                    }
                                }
                            }
                            oRowModel.setData(aData);
                            oTable.setModel(oRowModel);
                            oTable.bindRows("/results");
                            oDialog.update();
                            oDialog.open();
                        }, error: function (err) {

                        }
                    });
                }
            },

            onValueHelpPlanningScreen: function () {
                var that = this;
                var oView = this.getView();
                var oInput = oView.byId("idPlanningScreenFilterInput");
                var sValueHelpID = "idPlanningScreenValueHelp";
                if (!this._oPlanScrValueHelpDialog) {
                    this._oPlanScrValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog(sValueHelpID, {
                        key: "PlanningScreen",
                        supportMultiselect: true,
                        descriptionKey: "PlanningScreen",
                        ok: function (oEvent) {
                            var oInputVal = oEvent.getParameter("tokens");
                            oInput.setTokens(oInputVal);
                            this.close();
                        },
                        cancel: function () {
                            this.close();
                        }
                    });
                }
                var oDialog = this._oPlanScrValueHelpDialog;
                oDialog.setTitle(this._resourceBundle.getText("planningScreenSelect"));
                // // Add a search field to the dialog
                var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                    advancedMode: true
                });
                var oSearchField = new sap.m.SearchField({
                    width: "auto",
                    placeholder: "Search...",
                    showMagnifier: true,
                    search: function (oEvent) {
                        var aFilter = [];
                        var sValue = oEvent.getParameter("query");
                        var oFilter = new sap.ui.model.Filter("PlanningScreen", sap.ui.model.FilterOperator.Contains, sValue);
                        aFilter.push(oFilter);
                        that._loadPlanningScreen(oDialog, aFilter)
                    }
                });

                var oFilterGroupItem1 = new sap.ui.comp.filterbar.FilterGroupItem({
                    name: "SearchField", // Unique name for the filter group item
                    groupName: "Group 1", // Name of the filter group,
                    label: "Search Planning Screen",
                    control: oSearchField, // Replace with your filter control
                });

                oFilterBar.addFilterGroupItem(oFilterGroupItem1);

                oDialog.setFilterBar(oFilterBar);
                oDialog.setTokens([]);
                oDialog.setTokens(oInput.getTokens());     

                //Bind the columns for table
                var oColModel = new sap.ui.model.json.JSONModel();
                oColModel.setData({
                    cols: [
                        { label: "Planning Screen", template: "PlanningScreen" }
                    ]
                });
                var oTable = oDialog.getTable();
                oTable.setModel(oColModel, "columns");
                this._loadPlanningScreen(oDialog);
            },

            _loadPlanningScreen: function (oDialog, aFilter) {
                var oTable = oDialog.getTable();
                var oModel = this.getOwnerComponent().getModel();
                if (aFilter) {
                    oModel.read("/UserMngmnt", {
                        filters: aFilter,
                        urlParameters: { "$select": "PlanningScreen", "$orderby": "PlanningScreen" },
                        success: function (oData, response) {
                            var oRowModel = new JSONModel();
                            var aData = { "results": [] };
                            for (var i = 0; i < oData.results.length; i++) {
                                if (i === 0) {
                                    var sPlanningScreen = oData.results[i].PlanningScreen;
                                    aData.results.push({ "PlanningScreen": sPlanningScreen });
                                } else {
                                    if (oData.results[i].PlanningScreen === sPlanningScreen) {
                                        continue;
                                    } else {
                                        aData.results.push({ "PlanningScreen": oData.results[i].PlanningScreen });
                                        sPlanningScreen = oData.results[i].PlanningScreen;
                                    }
                                }
                            }
                            oRowModel.setData(aData);
                            oTable.setModel(oRowModel);
                            oTable.bindRows("/results");
                            oDialog.update();
                        }, error: function (err) {

                        }
                    });
                } else {
                    oModel.read("/UserMngmnt", {
                        urlParameters: { "$select": "PlanningScreen", "$orderby": "PlanningScreen" },
                        success: function (oData, response) {
                            var oRowModel = new JSONModel();
                            var aData = { "results": [] };
                            for (var i = 0; i < oData.results.length; i++) {
                                if (i === 0) {
                                    var sPlanningScreen = oData.results[i].PlanningScreen;
                                    aData.results.push({ "PlanningScreen": sPlanningScreen });
                                } else {
                                    if (oData.results[i].PlanningScreen === sPlanningScreen) {
                                        continue;
                                    } else {
                                        aData.results.push({ "PlanningScreen": oData.results[i].PlanningScreen });
                                        sPlanningScreen = oData.results[i].PlanningScreen;
                                    }
                                }
                            }
                            oRowModel.setData(aData);
                            oTable.setModel(oRowModel);
                            oTable.bindRows("/results");
                            oDialog.update();
                            oDialog.open();
                        }, error: function (err) {

                        }
                    });
                }
            },

            onSearch: function() {
                debugger;
                var oView = this.getView();
                var oTable = oView.byId("idUserMgmtTable");
                var aUsers = oView.byId("idUserNameFilterInput").getTokens();
                var aCBUsers = oView.byId("idCBUserIDFilterInput").getTokens();
                var aCompany = oView.byId("idCompanyFilterInput").getTokens();
                var aPlanningScr = oView.byId("idPlanningScreenFilterInput").getTokens();
                var aFilter = [];

                for(let i=0;i<aUsers.length;i++) {
                    let ofilter = new sap.ui.model.Filter("Uname", sap.ui.model.FilterOperator.EQ, aUsers[i].getProperty("key"));
                    aFilter.push(ofilter);
                }

                for (let i = 0; i < aCBUsers.length; i++) {
                    let ofilter = new sap.ui.model.Filter("CBUser", sap.ui.model.FilterOperator.EQ, aCBUsers[i].getProperty("key"));
                    aFilter.push(ofilter);
                }

                for (let i = 0; i < aCompany.length; i++) {
                    let ofilter = new sap.ui.model.Filter("Company", sap.ui.model.FilterOperator.EQ, aCompany[i].getProperty("key"));
                    aFilter.push(ofilter);
                }

                for (let i = 0; i < aPlanningScr.length; i++) {
                    let ofilter = new sap.ui.model.Filter("PlanningScreen", sap.ui.model.FilterOperator.EQ, aPlanningScr[i].getProperty("key"));
                    aFilter.push(ofilter);
                }

                oTable.setBusy(true);
                var oModel = this.getOwnerComponent().getModel();
                oModel.read("/UserMngmnt", {
                    filters: aFilter,
                    success: function(oData, response) {
                        var oUserModel = new JSONModel();
                        oUserModel.setData(oData);
                        oView.setModel(oUserModel, "tableData");
                        oTable.setBusy(false);
                    }, error: function(err) {
                        oTable.setBusy(false);
                    }
                });
            }
        });
    });
