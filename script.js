
const form = document.getElementById("expense-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const expenseList = document.getElementById("expense-list");
const filter = document.getElementById("filter");
const emptyMessage = document.getElementById("empty-message");

const today = new Date();
const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

dateInput.value = todayString;
dateInput.max = todayString;

let expenses = [];

try {
    const savedExpenses = JSON.parse(
        localStorage.getItem("myWalletExpenses") || "[]"
    );

    if (Array.isArray(savedExpenses)) {
        expenses = savedExpenses.filter(expense =>
            expense &&
            typeof expense.id === "string" &&
            typeof expense.name === "string" &&
            typeof expense.category === "string" &&
            typeof expense.date === "string" &&
            Number.isFinite(expense.amount) &&
            expense.amount > 0 &&
            ["Food", "Travel", "Shopping", "Education", "Bills", "Other"]
                .includes(expense.category) &&
            /^\d{4}-\d{2}-\d{2}$/.test(expense.date) &&
            expense.date <= todayString
        );
    }
} catch {
    expenses = [];
}

function saveExpenses() {
    try {
        localStorage.setItem(
            "myWalletExpenses",
            JSON.stringify(expenses)
        );
        return true;
    } catch {
        alert("Unable to save expenses in this browser.");
        return false;
    }
}

function updateSummary() {
    const total = expenses.reduce(
        (sum, expense) => sum + expense.amount, 0
    );

    document.getElementById("total").textContent =
        total.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR"
        });

    document.getElementById("count").textContent = expenses.length;
}

function displayExpenses() {
    expenseList.replaceChildren();

    const selectedCategory = filter.value;

    const filteredExpenses = expenses
        .filter(expense =>
            selectedCategory === "All" ||
            expense.category === selectedCategory
        )
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date));

    emptyMessage.hidden = filteredExpenses.length > 0;
    emptyMessage.textContent = expenses.length === 0
        ? "No expenses added yet."
        : "No expenses found in this category.";

    filteredExpenses.forEach(expense => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = expense.name;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = expense.category;

        const dateCell = document.createElement("td");
        dateCell.textContent = expense.date;

        const amountCell = document.createElement("td");
        amountCell.textContent = expense.amount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR"
        });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            const previousExpenses = expenses;
            expenses = expenses.filter(item => item.id !== expense.id);

            if (!saveExpenses()) {
                expenses = previousExpenses;
            }

            displayExpenses();
            updateSummary();
        });

        actionCell.appendChild(deleteButton);

        row.append(
            nameCell,
            categoryCell,
            dateCell,
            amountCell,
            actionCell
        );

        expenseList.appendChild(row);
    });
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const name = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!name || name.length > 80) {
        alert("Please enter an expense name.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0 ||
        amount > 10000000) {
        alert("Please enter a valid amount.");
        return;
    }

    if (!["Food", "Travel", "Shopping", "Education", "Bills", "Other"]
        .includes(category)) {
        alert("Please select a category.");
        return;
    }

    if (!date || date > todayString) {
        alert("Please select a valid date.");
        return;
    }

    const newExpense = {
        id: crypto.randomUUID(),
        name: name,
        amount: Math.round(amount * 100) / 100,
        category: category,
        date: date
    };

    expenses.push(newExpense);

    if (!saveExpenses()) {
        expenses.pop();
        return;
    }

    form.reset();
    dateInput.value = todayString;

    displayExpenses();
    updateSummary();
});

filter.addEventListener("change", displayExpenses);

displayExpenses();
updateSummary();
