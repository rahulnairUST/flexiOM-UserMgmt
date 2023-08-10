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

            _createAcessTypeModel: function () {
                var accessTypeJSON = {
                    "results": [{
                        "text": "DISP"
                    }, {
                        "text": "CHNG"
                    }, {
                        "text": "FULL"
                    }]
                };
                var oModel = new JSONModel();
                oModel.setData(accessTypeJSON);
                this.getView().setModel(oModel, "accessTypeModel");
            },

            _createStatusModel: function() {
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
                oModel.update("/UserMngmnt(Uname='" + oDetails.Uname + "')", updateJSON, {
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
                    oModel.remove("/UserMngmnt(Uname='" + oEntry.Uname + "')", {
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
            }
        });
    });
