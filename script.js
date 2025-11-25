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
    element.hidden = element.dataset.scenario !== scenario;
  });
};

const calculate = () => {
  const scenario = currentScenario;
  toggleConditionalFields(scenario);

  const totalSales = parseNumber(elements.totalSales.value);
  const addedVat = parseNumber(elements.addedVat.value);
  const withholding = parseNumber(elements.withholdingTax.value);

  const amountNetOfVat = totalSales / 1.12;
  const vat = totalSales - amountNetOfVat;
  const vatableSales = amountNetOfVat;
  const zeroRatedSales = 0;
  const vatExemptSales = scenario === "pwd" ? amountNetOfVat : 0;

  let discount = 0;
  if (scenario === "pwd") {
    const rate = Math.max(parseNumber(elements.discountRate.value) / 100, 0);
    discount = amountNetOfVat * rate;
    discount = Math.min(discount, amountNetOfVat);
  } else {
    discount = Math.max(parseNumber(elements.discountAmount.value), 0);
    discount = Math.min(discount, totalSales);
  }

  const baseTotal =
    scenario === "pwd" ? amountNetOfVat - discount : totalSales - discount;
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

