sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "br/com/gestao/fioriappusers303/util/Formatter", "sap/ui/core/Fragment", "sap/ui/core/ValueState", "sap/ui/model/json/JSONModel", "br/com/gestao/fioriappusers303/util/Validator", "sap/m/MessageBox", "sap/m/BusyDialog", "sap/ui/model/odata/ODataModel", "sap/m/MessageToast"], function (BaseController, Filter, FilterOperator, Formatter, Fragment, ValueState, JSONModel, Validator, MessageBox, BusyDialog, ODataModel, MessageToast) {
  "use strict";

  return BaseController.extend("br.com.gestao.fioriappusers303.controller.Lista", {
    objFormatter: Formatter,

    onInit: function () {
      sap.ui.getCore().attachValidationError(function (oEvent) {
        oEvent.getParameter("element").setValueState(ValueState.Error);
      });
      sap.ui.getCore().attachValidationSuccess(function (oEvent) {
        // o value state só funciona se o objeto possuir uma constraint dentro do XML
        oEvent.getParameter("element").setValueState(ValueState.Success);
      });
      // Força a inicialização com dados em PT-BR
      // var oConfiguration = sap.ui.getCore().getConfiguration();
      // oConfiguration.setLanguage(navigator.language);
    },

    criarModel: function () {
      // Model Produto
      var oModel = new JSONModel();
      this.getView().setModel(oModel, "MDL_Produto");
    },
    onSearchName: function () {
      var idQuery = this.getView().byId("field0"); // Linka a variável idQuery ao elemento de ID field0
      var nameQuery = this.getView().byId("field1"); // Linka a variável nameQuery ao elemento de ID field1
      var categoryQuery = this.getView().byId("field2");

      var objFilter = { filters: [], and: true };
      objFilter.filters.push(new Filter("Productid", FilterOperator.Contains, idQuery.getValue()));
      objFilter.filters.push(new Filter("Name", FilterOperator.Contains, nameQuery.getValue()));
      objFilter.filters.push(new Filter("Category", FilterOperator.Contains, categoryQuery.getValue()));

      var oFilter = new Filter(objFilter);

      /*
      var oFilter = new Filter({
        // Lembrar de Ler na documentação sobre os fields de FilterOperator para que consiga pesquisar em lowerCase() 
        filters: [
          new Filter("Productid", FilterOperator.Contains, idQuery.getValue()), // FIltra o "Productid" com uma operação Contains (Contem o valor digitado no idQuery)
          new Filter("Name", FilterOperator.Contains, nameQuery.getValue()), // FIltra o "Productid" com uma operação Contains (Contem o valor digitado no idQuery)
        ], // Filtra o "Name" com uma operação Contains (Contem o valor digitado no nameQuery)
        and: true, // TRUE = cada filtro por si - FALSE = necessário os dois filtros para procurar
      }); */

      var oTable = this.getView().byId("table1"); // Linka a variável oTable ao elemento de ID table1, no caso, a lista de produtos
      var binding = oTable.getBinding("items"); // Linka a variável binding aos binds da propriedade "ITEMS" do elemento "table1"

      binding.filter(oFilter); // Filtra os elementos da variável binding de acordo com as propriedades da variável oFilter
    },

    onRouting: function () {
      // Button dentro da view LISTA que faz o routing para a view Detalhes
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("Detalhes");
    },

    onSelectedItem: function (event) {
      // Button dentro da view LISTA que faz o routing para a view Detalhes

      // Passo 1 - Captura do Valor do Produto
      var oProductId = event.getSource().getBindingContext().getProperty("Productid"); // event.oQueFoiClicado.EmQualLinha.PropriedadeCorrespondenteNoMetadata / getObject().Projectid
      // var oProductId = event.getSource().getBindingContext("Nome do Model (models>manifest.json)").getProperty("Productid");

      //Passo 2 - Envio para o Route de Detalhes com Parametro
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("Detalhes", { Productid: oProductId });
    },

    onCategoria: function (oEvent) {
      this._oInput = oEvent.getSource().getId(); // getSource = Origem
      var oView = this.getView();

      if (!this._CategoriaSearchHelp) {
        // se this._CategoriaSearchHelp não existe...
        this._CategoriaSearchHelp = Fragment.load({
          // Importado na função de Origem do Controller - dá load no fragment no ID do oView
          id: oView.getId(),
          name: "br.com.gestao.fioriappusers303.frags.SH_Categorias",
          controller: this,
        }).then(function (oDialog) {
          oView.addDependent(oDialog); // oDialog = conteúdo do Fragment.load({oDialog})
          return oDialog;
        });
      }

      this._CategoriaSearchHelp.then(function (oDialog) {
        oDialog.getBinding("items").filter([]); // Abre o filtro em Branco, limpando a ultima pesquisa.

        // Abre o Fragment
        oDialog.open();
      });
    },
    onNovoProduto: function (oEvent) {
      //Criar o Model Produto
      var t = this;
      t.criarModel();
      var oView = this.getView();

      if (!this._Produto) {
        // se this._CategoriaSearchHelp não existe...
        this._Produto = Fragment.load({
          // Importado na função de Origem do Controller - dá load no fragment no ID do oView
          id: oView.getId(),
          name: "br.com.gestao.fioriappusers303.frags.Insert",
          controller: this,
        }).then(function (oDialog) {
          oView.addDependent(oDialog); // oDialog = conteúdo do Fragment.load({oDialog})
          return oDialog;
        });
      }

      this._Produto.then(function (oDialog) {
        // Abre o Fragment
        oDialog.open();

        //Chamada da função para Pegar os usuários do Metadata
        t.onGetUsuarios();
      });
    },
    // Capturar a coleção de usuários de um novo serviço ODATA - Z_USERS_303 - Exatamente como fizemos com o MessageToast
    onGetUsuarios: function () {
      var t = this;
      var strEntity = "/sap/opu/odata/sap/ZSB_USERS_303";

      var oModelSend = new ODataModel(strEntity, true);
      oModelSend.read("/Usuarios", {
        // Le dentro do OData a entidade Usuarios criada através da Z_USERS_303
        success: function (oData, results) {
          if (results.statusCode === 200) {
            var oModelUsers = new JSONModel();
            oModelUsers.setData(oData.results);
            t.getView().setModel(oModelUsers, "MDL_Users");
          }
        },
        error: function (e) {
          var oReturn = JSON.parse(e.response.body);
          MessageToast.show(oReturn.error.message.value, {
            duration: 4000,
          });
        },
      });
    },
    // Aplicar um filtro na Entidade Fornecedores para que Filtre o meio da String
    onSuggest: function (event) {
      var sText = event.getParameter("suggestValue");
      var aFilters = { filters: [], and: true };

      if (sText) {
        aFilters.filters.push(new Filter("Lifnr", FilterOperator.Contains, sText));
        aFilters.filters.push(new Filter("Name1", FilterOperator.Contains, sText));
      }
      event.getSource().getBinding("suggestionItems").filter(aFilters);
    },
    //Localizar um fornecedor baseado no input do usuário
    getSupplier: function (event) {
      this._oInput = event.getSource().getId();
      var oValue = event.getSource().getValue();

      var sElement = "/Fornecedores('" + oValue + "')"; // URL DE CHAMADA DE UM FORNECEDOR

      var oModel = this.getView().getModel(); // Cria o objeto Model Default do Projeto

      var oModelProduto = this.getView().getModel("MDL_Produto"); // Model onde o usuário realiza o preenchimento das informações de Produto

      // Realizar a chamada para a SAP
      var oModelSend = new ODataModel(oModel.sServiceUrl, true);
      oModelSend.read(sElement, {
        success: function (oData, results) {
          if (results.statusCode === 200) {
            oModelProduto.setProperty("/Supplierid", oData.Lifnr);
            oModelProduto.setProperty("/Suppliername", oData.Name1);
          }
        },
        error: function (e) {
          oModelProduto.setProperty("/Supplierid", "");
          oModelProduto.setProperty("/Suppliername", "");

          var oReturn = JSON.parse(e.response.body);
          MessageToast.show(oReturn.error.message.value, {
            duration: 4000,
          });
        },
      });
    },
    onValueHelpSearch: function (oEvent) {
      var sValue = oEvent.getParameter("value"); // captura o valor digitado pelo usuário

      /* OPÇÃO 1 - Cria um único Filtro
      var oFilter = new Filter("Description", FilterOperator.Contains, sValue); // Cria um Filter que recebe o sValue e associa na Propriedade "Description"
      oEvent.getSource().getBinding("items").filter([oFilter]); */

      //OPÇÃO 2 - Cria um filtro dinâmico, adicionando várias propriedades
      var objFilter = { filters: [], and: false };
      objFilter.filters.push(new Filter("Description", FilterOperator.Contains, sValue));
      objFilter.filters.push(new Filter("Category", FilterOperator.Contains, sValue));

      var oFilter = new Filter(objFilter);
      oEvent.getSource().getBinding("items").filter(oFilter);
    },

    onValueHelpClose: function (oEvent) {
      var oSelectedItem = oEvent.getParameter("selectedItem");
      var oInput = null;

      if (this.byId(this._oInput)) {
        oInput = this.byId(this._oInput);
      } else {
        oInput = sap.ui.getCore().byId(this._oInput);
      }

      if (!oSelectedItem) {
        oInput.resetProperty("value");
        return;
      }
      oInput.setValue(oSelectedItem.getTitle());
    },
    clearFilter: function () {
      var searchFieldId = "field2"; // Replace with the actual ID of your search field

      var oInput = null;

      if (this.byId(searchFieldId)) {
        oInput = this.byId(searchFieldId);
      } else {
        oInput = sap.ui.getCore().byId(searchFieldId);
      }

      if (oInput) {
        oInput.setValue("");
      }
    },
    pressValidation: function () {
      // ↓ Cria o objeto Validator ↓
      var validator = new Validator();
      // ↓ Chama a validação ↓
      if (validator.validate(this.byId("dialog0"))) {
        this.onInsert();
      }
    },
    onInsert: function () {
      // 1 - Cria uma referência do objeto Model que está recebendo as informações do fragment
      var oModel = this.getView().getModel("MDL_Produto").getData();
      // var objNovo = oModel.getData();

      // 2 - Manipular Propriedades
      oModel.Productid = this.geraID();
      oModel.Price = oModel.Price[0].toString();
      oModel.Weightmeasure = oModel.Weightmeasure.toString();
      oModel.Width = oModel.Width.toString();
      oModel.Depth = oModel.Depth.toString();
      oModel.Height = oModel.Height.toString();
      oModel.Createdat = this.objFormatter.dateSAP(oModel.Createdat);
      oModel.Currencycode = "BRL";
      oModel.Userupdate = "";

      // 3 - Criando referências do Arquivo i18n
      var bundle = this.getView().getModel("i18n").getResourceBundle();
      var t = this; // variável contexto da View

      // 4 - Criar o Objeto Model referência do model Default (Odata)
      var oModelProduto = t.getView().getModel();
      MessageBox.confirm(
        bundle.getText("insertDialogMessage"), // Pergunta do Processo dentro do i18n
        function (action) {
          //função de disparo do insert
          debugger;
          if (MessageBox.Action.OK === action) {
            // Verifica se o usuário confirmou a operação
            t._oBusyDialog = new BusyDialog({
              text: bundle.getText("Sending"),
            });
            t._oBusyDialog.open();
            setTimeout(function () {
              //Realizar a chamada para o SAP
              var oModelSend = new ODataModel(oModelProduto.sServiceUrl, true);
              oModelSend.create(
                "Produtos",
                oModel,
                null,
                function (d, r) {
                  // Função de Sucesso
                  if (r.statusCode === 201) {
                    // 201 = sucesso na criação
                    MessageToast.show(bundle.getText("insertDialogSuccess", [oModel.Productid]), {
                      duration: 5000,
                    });
                    t.closeDialog(); // Fecha o Dialog
                    t.getView().getModel().refresh(); // Refresh no Model Default
                    t._oBusyDialog.close();
                  }
                },
                function (e) {
                  // Função de Erro
                  //Fecha o busyDialog
                  t._oBusyDialog.close();
                  var oReturn = JSON.parse(e.response.body);
                  MessageToast.show(oReturn.error.message.value, {
                    duration: 4000,
                  });
                }
              );
            }, 2000);
          }
        },
        bundle.getText("insertDialogTitle") // Exibe o title da popup
      );
    },

    // Geramos um ID de Produto Dinâmico
    geraID: function () {
      return "xxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16).toUpperCase();
      });
    },
    // Fechamento do Dialog
    closeDialog: function () {
      this._Produto.then(function (oDialog) {
        oDialog.close();
      });
    },
  });
});

//*** TESTAR SE ESSA FUNÇÃO
//****  PEGA AUTOMATICAMENTE A LINGUA   */
//************************************* */

// onInit: function () {
//   sap.ui.getCore().attachLocalizationChanged(this.onLocalizationChanged, this);
// },

// onLocalizationChanged: function () {
//   var oConfiguration = sap.ui.getCore().getConfiguration();
//   var sLanguage = oConfiguration.getLanguage();
//   // Perform language-specific initialization or logic here
//   oConfiguration.setLanguage(sLanguage);
//   console.log("Language changed to: " + sLanguage);
// }
