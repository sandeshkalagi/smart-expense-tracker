const API = "http://localhost:8081/expenses";

let pieChart;
let monthlyChart;
let toastTimer;

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
});

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function categoryBadgeClass(category) {
    const key = String(category || "other").toLowerCase();

    if (key === "food") return "badge-food";
    if (key === "travel") return "badge-travel";
    if (key === "shopping") return "badge-shopping";
    if (key === "education") return "badge-education";
    if (key === "hospital") return "badge-hospital";

    return "badge-other";
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function getExpenses() {
    return fetch(API).then(res => res.json());
}

function setTableLoading() {
    const table = document.getElementById("expenseTable");
    table.innerHTML = `
        <tr class="loading-row">
            <td colspan="6">Loading expenses...</td>
        </tr>
    `;
}

function setTableEmpty() {
    const table = document.getElementById("expenseTable");
    table.innerHTML = `
        <tr class="empty-row">
            <td colspan="6">No expenses found. Add your first entry above.</td>
        </tr>
    `;
}

function renderTable(data) {
    const table = document.getElementById("expenseTable");

    if (!Array.isArray(data) || data.length === 0) {
        setTableEmpty();
        return;
    }

    table.innerHTML = data.map((exp, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(exp.title)}</td>
            <td><span class="category-badge ${categoryBadgeClass(exp.category)}">${escapeHtml(exp.category)}</span></td>
            <td>${currencyFormatter.format(exp.amount || 0)}</td>
            <td>${escapeHtml(exp.date)}</td>
            <td><button class="btn-delete" onclick="deleteExpense(${exp.id})">Delete</button></td>
        </tr>
    `).join("");
}

function loadExpenses() {
    setTableLoading();

    getExpenses()
        .then(data => {
            renderTable(data);
            filterExpenses();
        })
        .catch(() => {
            setTableEmpty();
            showToast("Could not load expenses");
        });
}

function loadTotal() {
    fetch(API + "/total")
        .then(res => res.json())
        .then(total => {
            document.getElementById("totalAmount").innerText = currencyFormatter.format(total || 0);
        })
        .catch(() => {
            document.getElementById("totalAmount").innerText = currencyFormatter.format(0);
        });
}

function loadStats() {
    getExpenses()
        .then(data => {
            const currentMonth = new Date().getMonth();
            let monthTotal = 0;
            const categories = {};

            data.forEach(exp => {
                const expDate = new Date(exp.date);
                if (!Number.isNaN(expDate.getTime()) && expDate.getMonth() === currentMonth) {
                    monthTotal += Number(exp.amount) || 0;
                }

                const key = exp.category || "Other";
                categories[key] = (categories[key] || 0) + (Number(exp.amount) || 0);
            });

            let topCategory = "-";
            let max = 0;

            for (const cat in categories) {
                if (categories[cat] > max) {
                    max = categories[cat];
                    topCategory = cat;
                }
            }

            document.getElementById("monthTotal").innerText = currencyFormatter.format(monthTotal);
            document.getElementById("topCategory").innerText = topCategory;
        })
        .catch(() => {
            document.getElementById("monthTotal").innerText = currencyFormatter.format(0);
            document.getElementById("topCategory").innerText = "-";
        });
}

function loadChart() {
    getExpenses()
        .then(data => {
            const categories = {};

            data.forEach(exp => {
                const key = exp.category || "Other";
                categories[key] = (categories[key] || 0) + (Number(exp.amount) || 0);
            });

            const labels = Object.keys(categories);
            const values = Object.values(categories);

            if (pieChart) {
                pieChart.destroy();
            }

            const ctx = document.getElementById("expenseChart");

            pieChart = new Chart(ctx, {
                type: "pie",
                data: {
                    labels,
                    datasets: [{
                        data: values,
                        backgroundColor: ["#0ea5a4", "#f59e0b", "#3b82f6", "#ef4444", "#22c55e", "#f97316"]
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: "#e8f1ff" } }
                    }
                }
            });
        })
        .catch(() => {
            showToast("Could not draw expense chart");
        });
}

function loadMonthlyChart() {
    getExpenses()
        .then(data => {
            const months = {};

            data.forEach(exp => {
                const date = new Date(exp.date);
                if (Number.isNaN(date.getTime())) return;

                const month = date.getMonth();
                months[month] = (months[month] || 0) + (Number(exp.amount) || 0);
            });

            const sortedMonthIndexes = Object.keys(months)
                .map(Number)
                .sort((a, b) => a - b);

            const currentYear = new Date().getFullYear();
            const labels = sortedMonthIndexes.map(index =>
                new Date(currentYear, index, 1).toLocaleString("en-IN", { month: "short" })
            );
            const values = sortedMonthIndexes.map(index => months[index]);

            if (monthlyChart) {
                monthlyChart.destroy();
            }

            const ctx = document.getElementById("monthlyChart");

            monthlyChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels,
                    datasets: [{
                        label: "Monthly Spending",
                        data: values,
                        backgroundColor: "#0ea5a4",
                        borderRadius: 8
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    scales: {
                        x: { ticks: { color: "#d3e7ff" }, grid: { color: "rgba(255,255,255,0.08)" } },
                        y: { ticks: { color: "#d3e7ff" }, grid: { color: "rgba(255,255,255,0.08)" } }
                    },
                    plugins: {
                        legend: { labels: { color: "#e8f1ff" } }
                    }
                }
            });
        })
        .catch(() => {
            showToast("Could not draw monthly chart");
        });
}

function refreshDashboard() {
    loadExpenses();
    loadTotal();
    loadStats();
    loadChart();
    loadMonthlyChart();
}

function addExpense() {
    const title = document.getElementById("expense").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (!title || Number.isNaN(amount) || amount <= 0 || !date) {
        showToast("Please fill valid expense details");
        return;
    }

    const expense = { title, amount, category, date };

    fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense)
    })
        .then(() => {
            document.getElementById("expense").value = "";
            document.getElementById("amount").value = "";
            document.getElementById("date").value = "";
            showToast("Expense added");
            refreshDashboard();
        })
        .catch(() => {
            showToast("Could not add expense");
        });
}

function deleteExpense(id) {
    fetch(API + "/" + id, {
        method: "DELETE"
    })
        .then(() => {
            showToast("Expense deleted");
            refreshDashboard();
        })
        .catch(() => {
            showToast("Could not delete expense");
        });
}

function filterExpenses() {
    const searchInput = document.getElementById("searchBox");
    const input = searchInput ? searchInput.value.toLowerCase() : "";
    const rows = document.querySelectorAll("#expenseTable tr");

    rows.forEach(row => {
        if (row.classList.contains("empty-row") || row.classList.contains("loading-row")) {
            row.style.display = "";
            return;
        }

        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? "" : "none";
    });
}

function exportCSV() {
    getExpenses()
        .then(data => {
            let csv = "Title,Amount,Category,Date\n";

            data.forEach(exp => {
                csv += `${exp.title},${exp.amount},${exp.category},${exp.date}\n`;
            });

            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = "expenses.csv";
            a.click();

            URL.revokeObjectURL(url);
            showToast("CSV downloaded");
        })
        .catch(() => {
            showToast("Could not export CSV");
        });
}

refreshDashboard();
