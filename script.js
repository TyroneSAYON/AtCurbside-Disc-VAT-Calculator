const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const elements = {
  form: document.getElementById("calculator-form"),
  totalSales: document.getElementById("totalSales"),
  discountRate: document.getElementById("discountRate"),
  discountAmount: document.getElementById("discountAmount"),
  totalPurchase: document.getElementById("totalPurchase"),
  totalPeople: document.getElementById("totalPeople"),
  cardHolders: document.getElementById("cardHolders"),
  perPerson: document.getElementById("perPerson"),
  addedVat: document.getElementById("addedVat"),
  withholdingTax: document.getElementById("withholdingTax"),
  scenarioButtons: document.querySelectorAll(".scenario-button"),
  output: {
    vatableSales: document.querySelector("[data-field='vatableSales']"),
    vat: document.querySelector("[data-field='vat']"),
    zeroRatedSales: document.querySelector("[data-field='zeroRatedSales']"),
    vatExemptSales: document.querySelector("[data-field='vatExemptSales']"),
    totalSales: document.querySelector("[data-field='totalSales']"),
    lessVat: document.querySelector("[data-field='lessVat']"),
    amountNetOfVat: document.querySelector("[data-field='amountNetOfVat']"),
    discount: document.querySelector("[data-field='discount']"),
    addedVat: document.querySelector("[data-field='addedVat']"),
    withholdingTax: document.querySelector("[data-field='withholdingTax']"),
    totalAmountDue: document.querySelector("[data-field='totalAmountDue']"),
  },
};

let currentScenario = "regular";

const parseNumber = (value) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const setCurrency = (field, value) => {
  elements.output[field].textContent = currency.format(value);
};

const toggleConditionalFields = (scenario) => {
  const conditionals = document.querySelectorAll(".conditional");
  conditionals.forEach((element) => {
    const allowedScenarios = (element.dataset.scenario || "").split(" ");
    element.hidden = !allowedScenarios.includes(scenario);
  });
};

const calculate = () => {
  const scenario = currentScenario;
  toggleConditionalFields(scenario);

  let totalSales = 0;
  let amountNetOfVat = 0;
  let vat = 0;
  let discount = 0;
  let vatableSales = 0;
  let zeroRatedSales = 0;
  let vatExemptSales = 0;

  const addedVat = parseNumber(elements.addedVat.value);
  const withholding = parseNumber(elements.withholdingTax.value);

  if (scenario === "pwd-group") {
    // PWD-SC Group Calculator logic
    const totalPurchase = parseNumber(elements.totalPurchase.value);
    const totalPeople = Math.max(parseInt(elements.totalPeople.value, 10) || 1, 1);
    const cardHolders = Math.max(parseInt(elements.cardHolders.value, 10) || 0, 0);

    totalSales = totalPurchase;
    amountNetOfVat = totalSales / 1.12;
    vat = amountNetOfVat * 0.12;
    vatableSales = amountNetOfVat;
    zeroRatedSales = 0;
    vatExemptSales = amountNetOfVat;

    // Calculate per person
    const perPerson = totalPeople > 0 ? totalPurchase / totalPeople : 0;
    if (elements.perPerson) {
      elements.perPerson.value = perPerson.toFixed(2);
    }

    // Discount = (Per Person / 1.12) * 0.2 * Number of Card Holders
    const perPersonNetOfVat = perPerson / 1.12;
    discount = perPersonNetOfVat * 0.2 * cardHolders;
    discount = Math.min(discount, amountNetOfVat);
  } else {
    // Regular and PWD individual calculator logic
    totalSales = parseNumber(elements.totalSales.value);
    amountNetOfVat = totalSales / 1.12;
    vat = totalSales - amountNetOfVat;
    vatableSales = amountNetOfVat;
    zeroRatedSales = 0;
    vatExemptSales = scenario === "pwd" ? amountNetOfVat : 0;

    if (scenario === "pwd") {
      const rate = Math.max(parseNumber(elements.discountRate.value) / 100, 0);
      const numberOfDiscounts = 1; // Always 1 for PWD/Senior Citizen
      const singleDiscount = amountNetOfVat * rate;
      discount = singleDiscount * numberOfDiscounts;
      discount = Math.min(discount, amountNetOfVat);
    } else {
      discount = Math.max(parseNumber(elements.discountAmount.value), 0);
      discount = Math.min(discount, totalSales);
    }
  }

  const baseTotal =
    scenario === "pwd" || scenario === "pwd-group"
      ? amountNetOfVat - discount
      : totalSales - discount;
  const totalAmountDue = Math.max(baseTotal + addedVat - withholding, 0);

  setCurrency("vatableSales", vatableSales);
  setCurrency("vat", vat);
  setCurrency("zeroRatedSales", zeroRatedSales);
  setCurrency("vatExemptSales", vatExemptSales);
  setCurrency("totalSales", totalSales);
  setCurrency("lessVat", vat);
  setCurrency("amountNetOfVat", amountNetOfVat);
  setCurrency("discount", discount);
  setCurrency("addedVat", addedVat);
  setCurrency("withholdingTax", withholding);
  setCurrency("totalAmountDue", totalAmountDue);
};

const init = () => {
  elements.form.addEventListener("input", calculate);
  elements.scenarioButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.scenario;
      if (selected === currentScenario) {
        return;
      }

      currentScenario = selected;
      elements.scenarioButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.scenario === selected);
      });
      calculate();
    });
  });

  calculate();
};

document.addEventListener("DOMContentLoaded", init);

