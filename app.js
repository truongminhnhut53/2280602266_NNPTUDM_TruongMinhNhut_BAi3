const API = "https://api.escuelajs.co/api/v1/products";

let products = [];
let filtered = [];
let page = 1;
let pageSize = 10;
let sortField = "";
let sortAsc = true;

// Load data
fetch(API)
    .then(res => res.json())
    .then(data => {
        products = data;
        applyFilters();
    });

// Search
function applyFilters() {
    const keyword = searchInput.value.toLowerCase();
    filtered = products.filter(p =>
        p.title.toLowerCase().includes(keyword)
    );
    page = 1;
    render();
}

// Render table
function render() {
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    tableBody.innerHTML = data.map(p => `
        <tr title="${p.description}" onclick="openDetail(${p.id})">
            <td>${p.id}</td>
            <td>${p.title}</td>
            <td>$${p.price}</td>
            <td>${p.category?.name || ""}</td>
            <td>
                <img 
                    src="${p.images && p.images.length ? p.images[0] : 'https://via.placeholder.com/50'}"
                    class="product-img"
                    onerror="this.src='https://via.placeholder.com/50'"
                >
            </td>
        </tr>
    `).join("");

    renderPagination();
}

// Pagination
function renderPagination() {
    const totalPages = Math.ceil(filtered.length / pageSize);
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === page ? "active" : ""}">
                <button class="page-link" onclick="page=${i};render()">${i}</button>
            </li>
        `;
    }
}

function changePageSize() {
    pageSize = +pageSizeSelect.value;
    page = 1;
    render();
}

// Sort
function sortBy(field) {
    sortAsc = sortField === field ? !sortAsc : true;
    sortField = field;

    filtered.sort((a, b) => {
        if (a[field] > b[field]) return sortAsc ? 1 : -1;
        if (a[field] < b[field]) return sortAsc ? -1 : 1;
        return 0;
    });
    render();
}

// Export CSV
function exportCSV() {
    let csv = "id,title,price,category\n";
    filtered
        .slice((page - 1) * pageSize, page * pageSize)
        .forEach(p => {
            csv += `${p.id},"${p.title}",${p.price},"${p.category?.name || ""}"\n`;
        });

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "products.csv";
    a.click();
}

// Detail modal
function openDetail(id) {
    const p = products.find(x => x.id === id);
    detailId.value = p.id;
    detailTitle.value = p.title;
    detailPrice.value = p.price;
    detailDesc.value = p.description;
    new bootstrap.Modal(detailModal).show();
}

// Update
function updateProduct() {
    fetch(`${API}/${detailId.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: detailTitle.value,
            price: +detailPrice.value,
            description: detailDesc.value
        })
    }).then(() => location.reload());
}

// Create
function createProduct() {
    fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: createTitle.value,
            price: +createPrice.value,
            description: createDesc.value,
            images: [createImage.value],
            categoryId: +createCategory.value
        })
    }).then(() => location.reload());
}
