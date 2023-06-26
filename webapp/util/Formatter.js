sap.ui.define(["sap/ui/core/format/NumberFormat"], function (NumberFormat) {
  "use strict";

  var Formatter = {
    date: function (value) {
      var oConfiguration = sap.ui.getCore().getConfiguration();
      var oLocale = oConfiguration.getLanguage();
      var oPattern = "";

      if (oLocale === "pt-BR") {
        oPattern = "dd/MM/yyyy";
      } else {
        oPattern = "MM/dd/YYYY";
      }

      if (value) {
        var year = new Date().getFullYear();
        if (year === 9999) {
          return "";
        } else {
          var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
            pattern: oPattern,
          });

          return oDateFormat.format(new Date(value));
        }
      } else {
        return value;
      }
    },

    dateSAP: function (value) {
      if (value) {
        var dateParts = value.split("/");
        var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: "yyyy-MM-ddTHH:mm:ss",
        });
        return oDateFormat.format(new Date(dateObject));
      } else {
        return value;
      }
    },

    statusProduto: function (value) {
      var oBundle = this.getView().getModel("i18n").getResourceBundle();

      try {
        return oBundle.getText("status" + value);
      } catch (err) {
        return "";
      }
    },

    stateProduto: function (value) {
      try {
        if (value === "E") {
          return "Success";
        } else if (value === "P") {
          return "Warning";
        } else if (value === "F") {
          return "Error";
        } else {
          return "None";
        }
      } catch (err) {
        return "None";
      }
    },

    iconeProduto: function (value) {
      try {
        if (value === "E") {
          return "sap-icon://sys-enter-2";
        } else if (value === "P") {
          return "sap-icon://warning";
        } else if (value === "F") {
          return "sap-icon://error";
        } else {
          return "sap-icon://sys-cancel";
        }
      } catch (err) {
        return "sap-icon://sys-cancel";
      }
    },

    onRouting: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("Detalhes");
    },

    onSelectedItem: function (event) {
      var oProductId = event
        .getSource()
        .getBindingContext()
        .getProperty("Productid");
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("Detalhes", { Productid: oProductId });
    },
    floatNumber: function (value) {
      // APresentar os valores numéricos formatados tipo decimal
      var floatNumber = NumberFormat.getFloatInstance({
        maxFractionDigits: 2,
        minFractionDigits: 2,
        groupingEnabled: true,
        goupingSeparator: ".",
        decimalSeparator: ",",
      });

      return floatNumber.format(value);
    },
  };

  return Formatter;
});
