sap.ui.define(
  ["sap/ui/core/mvc/Controller"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend("br.com.gestao.fioriappusers303.controller.Objetos", {
      onInit: function () { },

      onClicaSet: function (event) {
        // Muda o nome do Header para o desejado
        var objTitle = this.getView().byId("HeaderTitle");
        var title = prompt();
        objTitle.setText(title);
      },
      onClicaView: function (event) {
        //Muda o nome do botão para o nome escolhido do header
        var objTitle = this.getView().byId("HeaderTitle");
        var sValorText = objTitle.getText();
        var btnText = this.getView().byId("button0");
        btnText.setText(sValorText);
      },
      removeForm: function (event) {
        //remove o formulário dentro do Panel 2
        var removeForm = this.getView().byId("panel2");
        removeForm.destroyContent();
      },
      addForm: function (event) {
        // Cria objetos de formulátio - Label e Input
        var addForm = this.getView().byId("panel2");
        var formObjects = [];
        formObjects.push(
          new sap.m.Label("Label1", {
            text: "Pergunta 1",
          })
        );
        formObjects.push(
          new sap.m.Input("Input1", {
            value: "Valor da Pergunta 1",
          })
        );

        // Cria o Simple Form
        var addSimpleForm = new sap.ui.layout.form.SimpleForm("simpleForm", {
          content: formObjects,
        });

        //Adicionar o formulário dentro do panel 2
        addForm.addContent(addSimpleForm);
      },
    });
  }
);
