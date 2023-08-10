/*global QUnit*/

sap.ui.define([
	"comallocusermgmt/allocusermgmt/controller/UserMgmt.controller"
], function (Controller) {
	"use strict";

	QUnit.module("UserMgmt Controller");

	QUnit.test("I should test the UserMgmt controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
