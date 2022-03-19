var SSCL;
var SSP;
Cypress._.times(5, () => {
  describe("example to-do app", () => {
    beforeEach(() => {
      cy.visit("https://www.qima.com/aql-acceptable-quality-limit");
      cy.get(".button-no").click();
      if (!SSCL) {
        cy.readFile("cypress/fixtures/sscl.json").then((sscl) => {
          SSCL = sscl;
        });
      }

      if (!SSP) {
        cy.readFile("cypress/fixtures/ssp.json").then((ssp) => {
          SSP = ssp;
        });
      }
    });

    it("verify AQL Sampling Simulator ", () => {
      var quantity = getRandomQuantity();
      console.log("quantity: " + quantity);
      var inspectionLevel = getRandomInspectionLevel();
      console.log("inspectionLevel: " + inspectionLevel);
      var letter = getRandomCodeLetter(SSCL, quantity, inspectionLevel);
      console.log("letter: " + letter);
      var criticalAQL = getRandomAQL();
      console.log("criticalAQL: " + criticalAQL);
      var majorAQL = getRandomAQL();
      console.log("majorAQL: " + majorAQL);
      var minorAQL = getRandomAQL();
      console.log("minorAQL: " + minorAQL);
      var expectedCriticalAQL = getExpectedLevel(SSP, letter, criticalAQL);
      console.log("expectedCriticalAQL: " + expectedCriticalAQL);
      var expectedMajorAQL = getExpectedLevel(SSP, letter, majorAQL);
      console.log("expectedMajorAQL: " + expectedMajorAQL);
      var expectedMinorAQL = getExpectedLevel(SSP, letter, minorAQL);
      console.log("expectedMinorAQL: " + expectedMinorAQL);
      cy.get('input[name="aql-calculator-quantity"]')
        .click({ force: true })
        .type(quantity);
      cy.get('select[name="aql-calculator-inspection-level"]').select(
        inspectionLevel,
        { force: true }
      );

      selectAndCheck(
        criticalAQL,
        "critical",
        expectedCriticalAQL.size_value,
        expectedCriticalAQL.ac,
        expectedCriticalAQL.re
      );

      selectAndCheck(
        majorAQL,
        "major",
        expectedMajorAQL.size_value,
        expectedMajorAQL.ac,
        expectedMajorAQL.re
      );

      selectAndCheck(
        minorAQL,
        "minor",
        expectedMinorAQL.size_value,
        expectedMinorAQL.ac,
        expectedMinorAQL.re
      );
    });
  });
});

/** Functions */

function selectAndCheck(
  aqlSelection,
  level,
  expectedSS,
  expectedAP,
  expectedRP
) {
  cy.get('select[name="aql-calculator-' + level + '-aql"]').select(
    aqlSelection,
    { force: true }
  );
  cy.get("#" + level + "-sample-size").should("have.text", expectedSS);
  cy.get("#" + level + "-accept-point").should("have.text", expectedAP);
  cy.get("#" + level + "-reject-point").should("have.text", expectedRP);
}

function getRandomQuantity() {
  var tab = [
    2, 9, 16, 26, 51, 91, 151, 281, 501, 1201, 3201, 10001, 35001, 150001,
    500001,
  ];
  return tab[Math.floor(Math.random() * tab.length)];
}

function getRandomInspectionLevel() {
  var tab = getPossibleInstpectionLevel();
  var randomIndex = Math.floor(Math.random() * tab.length);
  return tab[randomIndex];
}

function getRandomCodeLetter(sscl, quantity, inspectionLevel) {
  var letterBloc;
  if (quantity > 500000) {
    letterBloc = sscl.lot_size[sscl.lot_size.length - 1];
  } else {
    letterBloc = sscl.lot_size.filter(
      (element) => element.from <= quantity && element.to >= quantity
    )[0];
  }
  return letterBloc ? letterBloc.inspection_level[inspectionLevel] : {};
}

function getRandomAQL() {
  var tab = getPossibleAQL();
  var randomIndex = Math.floor(Math.random() * tab.length);
  return tab[randomIndex];
}

function getExpectedLevel(ssp, letter, aql) {
  var letterBloc = ssp.single_sampling_plan.filter(
    (element) => element.letter === letter
  )[0];
  var aqlBloc = letterBloc.size_by_aql.filter(
    (element) => element.id === aql
  )[0];
  return aqlBloc ? aqlBloc.aql : {};
}

function getPossibleInstpectionLevel() {
  var obj = SSCL.lot_size[0]["inspection_level"],
    keys = [];
  if (Object.keys) {
    keys = Object.keys(obj);
  } else {
    for (var k in obj) {
      keys.push(k);
    }
  }
  return keys;
}

function getPossibleAQL() {
  var values = [];
  SSP.single_sampling_plan[0].size_by_aql.forEach((element) => {
    values.push(element.id);
  });

  return values;
}
