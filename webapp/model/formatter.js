sap.ui.define([], function () {
    "use strict";

    return {
        activeStatus: function(oStatus) {
            if(oStatus === false) {
                return "Inactive";
            } else if (oStatus === true) {
                return 'Active';
            }
        }        
    }

});