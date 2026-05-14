// Global State
let billItems = [];
const GST_RATE = 0.18; // 18%

// DOM Elements
const customerNameInput = document.getElementById('customerName');
const medicineNameInput = document.getElementById('medicineName');
const medicinePriceInput = document.getElementById('medicinePrice');
const medicineQtyInput = document.getElementById('medicineQty');
const addBtn = document.getElementById('addBtn');
const tableBody = document.getElementById('tableBody');
const subtotalDisplay = document.getElementById('subtotalDisplay');
const gstDisplay = document.getElementById('gstDisplay');
const discountInput = document.getElementById('discountInput');
const grandTotalDisplay = document.getElementById('grandTotalDisplay');
const printDiscountDisplay = document.getElementById('printDiscountDisplay');

const billNoDisplay = document.getElementById('billNoDisplay');
const customerDisplay = document.getElementById('customerDisplay');
const dateDisplay = document.getElementById('date-display');
const timeDisplay = document.getElementById('time-display');
const printDateTime = document.getElementById('printDateTime');

const clearBtn = document.getElementById('clearBtn');
const printBtn = document.getElementById('printBtn');
const themeToggle = document.getElementById('themeToggle');

// Initialize Application
function init() {
    updateDateTime();
    setInterval(updateDateTime, 1000); // Update time every second
    generateBillNumber();
    
    // Check local storage for theme
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = "<i class='bx bx-sun'></i>";
    }
}

// Update Date and Time
function updateDateTime() {
    const now = new Date();
    
    const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    
    const dateStr = now.toLocaleDateString('en-IN', dateOptions);
    const timeStr = now.toLocaleTimeString('en-IN', timeOptions);
    
    dateDisplay.textContent = `Date: ${dateStr}`;
    timeDisplay.textContent = `Time: ${timeStr}`;
    printDateTime.textContent = `${dateStr} ${timeStr}`;
}

// Generate Bill Number
function generateBillNumber() {
    // Just increment a base number or generate random for realism
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
    const currentBillNo = `AMB-${randomSuffix}`;
    billNoDisplay.textContent = currentBillNo;
}

// Auto-fill price based on search/datalist selection
medicineNameInput.addEventListener('input', function(e) {
    const val = e.target.value;
    const list = document.getElementById('medicine-list').options;
    
    for (let i = 0; i < list.length; i++) {
        if (list[i].value === val) {
            medicinePriceInput.value = list[i].getAttribute('data-price');
            break;
        }
    }
});

// Sync Customer Name to Invoice instantly
customerNameInput.addEventListener('input', function(e) {
    customerDisplay.textContent = e.target.value || "Walk-in Customer";
});

// Add Item to Bill
function addItem() {
    const name = medicineNameInput.value.trim();
    const price = parseFloat(medicinePriceInput.value);
    const qty = parseInt(medicineQtyInput.value);

    // Validation
    if (!name) {
        alert("Please enter a medicine name.");
        return;
    }
    if (isNaN(price) || price <= 0) {
        alert("Please enter a valid price.");
        return;
    }
    if (isNaN(qty) || qty <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    // Create item object
    const total = price * qty;
    const item = {
        id: Date.now(),
        name: name,
        price: price,
        qty: qty,
        total: total
    };

    // Add to array
    billItems.push(item);
    
    // Update UI
    renderTable();
    calculateTotals();
    
    // Clear inputs
    medicineNameInput.value = '';
    medicinePriceInput.value = '';
    medicineQtyInput.value = '1';
    medicineNameInput.focus();
}

// Render Table Rows
function renderTable() {
    // Clear existing table
    tableBody.innerHTML = '';
    
    if (billItems.length === 0) {
        tableBody.innerHTML = `
            <tr id="emptyRow">
                <td colspan="5" class="text-center empty-message">No medicines added yet.</td>
            </tr>
        `;
        return;
    }

    // Render items
    billItems.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td class="text-right">₹${item.price.toFixed(2)}</td>
            <td class="text-center">${item.qty}</td>
            <td class="text-right font-weight-bold">₹${item.total.toFixed(2)}</td>
            <td class="text-center no-print">
                <button class="remove-btn" onclick="removeItem(${item.id})" title="Remove Item">
                    <i class='bx bx-x-circle'></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Remove Item from Bill
function removeItem(id) {
    billItems = billItems.filter(item => item.id !== id);
    renderTable();
    calculateTotals();
}

// Calculate Subtotal, GST, Discount and Grand Total
function calculateTotals() {
    // Subtotal
    const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
    
    // GST
    const gstAmount = subtotal * GST_RATE;
    
    // Discount
    let discountPercent = parseFloat(discountInput.value) || 0;
    if (discountPercent > 100) discountPercent = 100;
    if (discountPercent < 0) discountPercent = 0;
    
    const discountAmount = subtotal * (discountPercent / 100);
    
    // Grand Total (Subtotal - Discount + GST)
    const grandTotal = subtotal - discountAmount + gstAmount;

    // Update UI Displays
    subtotalDisplay.textContent = `₹${subtotal.toFixed(2)}`;
    gstDisplay.textContent = `₹${gstAmount.toFixed(2)}`;
    grandTotalDisplay.textContent = `₹${grandTotal.toFixed(2)}`;
    
    // Update print view discount
    printDiscountDisplay.textContent = `${discountPercent}% (₹${discountAmount.toFixed(2)})`;
}

// Re-calculate when discount changes
discountInput.addEventListener('input', calculateTotals);

// Clear Entire Bill
function clearBill() {
    if (billItems.length === 0) return;
    
    if(confirm("Are you sure you want to clear the current bill?")) {
        billItems = [];
        customerNameInput.value = '';
        customerDisplay.textContent = 'Walk-in Customer';
        discountInput.value = '0';
        generateBillNumber();
        renderTable();
        calculateTotals();
    }
}

// Print Bill
function printBill() {
    if (billItems.length === 0) {
        alert("Cannot print an empty bill. Please add some medicines first.");
        return;
    }
    
    // Prepare for print
    customerDisplay.textContent = customerNameInput.value || "Walk-in Customer";
    
    // Trigger browser print dialog
    window.print();
}

// Toggle Dark Mode
function toggleDarkMode() {
    const root = document.documentElement;
    if (root.getAttribute('data-theme') === 'dark') {
        root.removeAttribute('data-theme');
        themeToggle.innerHTML = "<i class='bx bx-moon'></i>";
        localStorage.setItem('theme', 'light');
    } else {
        root.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = "<i class='bx bx-sun'></i>";
        localStorage.setItem('theme', 'dark');
    }
}

// Event Listeners
addBtn.addEventListener('click', addItem);
clearBtn.addEventListener('click', clearBill);
printBtn.addEventListener('click', printBill);
themeToggle.addEventListener('click', toggleDarkMode);

// Allow pressing 'Enter' on quantity field to add item
medicineQtyInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addItem();
    }
});

// Run Init on load
init();
