
// ==================================================
// KEYIAN WARD BURSARY WEBSITE
// COMPLETE ADMIN AND APPLICATION SYSTEM
// ==================================================

document.addEventListener("DOMContentLoaded", function () {

    const STORAGE_KEY = "keyianApplications";

    // ==================================================
    // 1. HELPER FUNCTIONS
    // ==================================================

    function getApplications() {
        try {
            const data = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            return Array.isArray(data) ? data : [];

        } catch (error) {
            console.error("Application loading error:", error);
            return [];
        }
    }

    function saveApplications(applications) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(applications)
            );

            return true;

        } catch (error) {
            console.error("Application saving error:", error);
            return false;
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character];
        });
    }

    function generateReference() {
        return "KWB-" + Date.now();
    }

    function getStatus(app) {
        return app.status || "Pending";
    }

    // ==================================================
    // 2. ADMIN LOGIN
    // ==================================================

    const loginForm = document.getElementById("admin-login-form");

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const usernameElement = document.getElementById("username");
            const passwordElement = document.getElementById("password");

            if (!usernameElement || !passwordElement) {
                alert("Login fields are missing.");
                return;
            }

            const username = usernameElement.value.trim();
            const password = passwordElement.value;

            if (
                username === "KEYIAN" &&
                password === "kiseriann"
            ) {

                alert("Login successful!");

                window.location.href = "admin-dashboard.html";

            } else {

                alert("Incorrect username or password.");

            }

        });

    }

    // ==================================================
    // 3. BURSARY APPLICATION SYSTEM
    // ==================================================

    const bursaryForm = document.getElementById("bursaryForm");

    if (bursaryForm) {

        bursaryForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const fileInput = document.getElementById("feefile");

            if (!fileInput || !fileInput.files.length) {

                alert("Please upload your supporting document.");

                return;

            }

            function fieldValue(id) {

                const element = document.getElementById(id);

                return element ? element.value.trim() : "";

            }

            const application = {

                reference: generateReference(),

                name: fieldValue("name"),

                idno: fieldValue("idno"),

                phone: fieldValue("phone"),

                subLocation: fieldValue("sub-location"),

                village: fieldValue("village"),

                school: fieldValue("school"),

                level: fieldValue("level"),

                admission: fieldValue("adm"),

                amount: fieldValue("amount"),

                documentName: fileInput.files[0].name,

                mpesa: fieldValue("m-pesa"),

                reason: fieldValue("reason"),

                status: "Pending",

                date: new Date().toLocaleString()

            };

            const applications = getApplications();

            applications.push(application);

            if (!saveApplications(applications)) {

                alert("Unable to save application. Please try again.");

                return;

            }

            const successMsg = document.getElementById("successMsg");

            if (successMsg) {

                successMsg.textContent =
                    "Application submitted successfully! Reference Number: " +
                    application.reference;

            }

            alert(
                "Application submitted successfully!\n" +
                "Reference Number: " +
                application.reference
            );

            bursaryForm.reset();

        });

    }

    // ==================================================
    // 4. ADMIN DASHBOARD
    // ==================================================

    const applicationsTable = document.getElementById("applicationsTable");

    if (applicationsTable) {

        const totalElement =
            document.getElementById("totalApplications");

        const pendingElement =
            document.getElementById("pendingApplications");

        const approvedElement =
            document.getElementById("approvedApplications");

        const rejectedElement =
            document.getElementById("rejectedApplications");

        const searchInput =
            document.getElementById("applicationSearch");

        // ==================================================
        // 5. APPLICATION DETAILS MODAL
        // ==================================================

        const modal = document.createElement("div");

        modal.id = "applicationDetailsModal";

        modal.style.cssText = `
            display:none;
            position:fixed;
            z-index:99999;
            inset:0;
            background:rgba(0,0,0,0.7);
            overflow-y:auto;
            padding:30px 15px;
        `;

        modal.innerHTML = `
            <div style="
                background:white;
                max-width:650px;
                margin:30px auto;
                padding:25px;
                border-radius:10px;
            ">

                <button id="closeDetailsModal" style="
                    float:right;
                    background:#b91c1c;
                    color:white;
                    border:none;
                    padding:9px 15px;
                    border-radius:5px;
                    cursor:pointer;
                ">
                    Close X
                </button>

                <h2 style="color:#123b27;">
                    Application Details
                </h2>

                <div id="applicationDetailsContent"></div>

            </div>
        `;

        document.body.appendChild(modal);

        const detailsContent =
            document.getElementById("applicationDetailsContent");

        // ==================================================
        // 6. VIEW APPLICATION DETAILS
        // ==================================================

        function viewApplication(index) {

            const applications = getApplications();

            const app = applications[index];

            if (!app) {

                alert("Application not found.");

                return;

            }

            const details = [

                ["Reference Number", app.reference],

                ["Student Name", app.name],

                ["ID Number", app.idno],

                ["Phone Number", app.phone],

                ["Sub-location", app.subLocation],

                ["Village", app.village],

                ["School / Institution", app.school],

                ["Education Level", app.level],

                ["Admission Number", app.admission],

                ["Amount Requested", app.amount],

                ["Supporting Document", app.documentName],

                ["M-Pesa Number", app.mpesa],

                ["Reason for Application", app.reason],

                ["Application Date", app.date],

                ["Application Status", getStatus(app)]

            ];

            detailsContent.innerHTML = details.map(function (detail) {

                return `
                    <div style="
                        padding:12px;
                        border-bottom:1px solid #ddd;
                        overflow-wrap:anywhere;
                    ">

                        <strong>${escapeHTML(detail[0])}:</strong>

                        ${escapeHTML(detail[1] || "Not provided")}

                    </div>
                `;

            }).join("");

            modal.style.display = "block";

        }

        // ==================================================
        // 7. DASHBOARD STATISTICS
        // ==================================================

        function updateStatistics(applications) {

            if (totalElement) {

                totalElement.textContent = applications.length;

            }

            if (pendingElement) {

                pendingElement.textContent =
                    applications.filter(app =>
                        getStatus(app) === "Pending"
                    ).length;

            }

            if (approvedElement) {

                approvedElement.textContent =
                    applications.filter(app =>
                        getStatus(app) === "Approved"
                    ).length;

            }

            if (rejectedElement) {

                rejectedElement.textContent =
                    applications.filter(app =>
                        getStatus(app) === "Rejected"
                    ).length;

            }

        }

        // ==================================================
        // 8. DISPLAY APPLICATIONS
        // ==================================================

        function displayApplications() {

            const applications = getApplications();

            updateStatistics(applications);

            const searchTerm = searchInput
                ? searchInput.value.toLowerCase().trim()
                : "";

            const filteredApplications = applications
                .map((app, index) => ({ app, index }))
                .filter(function (item) {

                    const app = item.app;

                    return [

                        app.reference,
                        app.name,
                        app.idno,
                        app.phone,
                        app.school,
                        app.village,
                        app.status

                    ].some(value =>
                        String(value || "")
                            .toLowerCase()
                            .includes(searchTerm)
                    );

                });

            if (filteredApplications.length === 0) {

                applicationsTable.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align:center;padding:20px;">
                            No applications found.
                        </td>
                    </tr>
                `;

                return;

            }

            applicationsTable.innerHTML =
                filteredApplications.map(function (item) {

                    const app = item.app;

                    return `
                        <tr>

                            <td>${item.index + 1}</td>

                            <td>${escapeHTML(app.name)}</td>

                            <td>${escapeHTML(app.idno)}</td>

                            <td>${escapeHTML(app.phone)}</td>

                            <td>${escapeHTML(app.school)}</td>

                            <td>${escapeHTML(app.amount)}</td>

                            <td>${escapeHTML(app.date || "Not available")}</td>

                            <td>${escapeHTML(getStatus(app))}</td>

                            <td>

                                <button
                                    data-action="view"
                                    data-index="${item.index}"
                                    style="background:#2563eb;color:white;border:none;padding:7px;border-radius:4px;margin:2px;cursor:pointer;">
                                    View Details
                                </button>

                                <button
                                    data-action="approve"
                                    data-index="${item.index}"
                                    style="background:#15803d;color:white;border:none;padding:7px;border-radius:4px;margin:2px;cursor:pointer;">
                                    Approve
                                </button>

                                <button
                                    data-action="reject"
                                    data-index="${item.index}"
                                    style="background:#b91c1c;color:white;border:none;padding:7px;border-radius:4px;margin:2px;cursor:pointer;">
                                    Reject
                                </button>

                            </td>

                        </tr>
                    `;

                }).join("");

        }

        // ==================================================
        // 9. VIEW, APPROVE AND REJECT
        // ==================================================

        applicationsTable.addEventListener("click", function (event) {

            const button = event.target.closest("button[data-action]");

            if (!button) return;

            const action = button.dataset.action;

            const index = Number(button.dataset.index);

            const applications = getApplications();

            if (!Number.isInteger(index) || !applications[index]) {

                alert("Application not found.");

                return;

            }

            if (action === "view") {

                viewApplication(index);

                return;

            }

            if (action === "approve") {

                if (!confirm("Are you sure you want to approve this application?")) {
                    return;
                }

                applications[index].status = "Approved";

                if (!saveApplications(applications)) {

                    alert("Unable to update application.");

                    return;

                }

                alert("Application approved successfully!");

                displayApplications();

            }

            if (action === "reject") {

                if (!confirm("Are you sure you want to reject this application?")) {
                    return;
                }

                applications[index].status = "Rejected";

                if (!saveApplications(applications)) {

                    alert("Unable to update application.");

                    return;

                }

                alert("Application rejected successfully!");

                displayApplications();

            }

        });

        // ==================================================
        // 10. SEARCH
        // ==================================================

        if (searchInput) {

            searchInput.addEventListener("input", displayApplications);

        }

        // ==================================================
        // 11. CLOSE MODAL
        // ==================================================

        document.getElementById("closeDetailsModal")
            .addEventListener("click", function () {

                modal.style.display = "none";

            });

        modal.addEventListener("click", function (event) {

            if (event.target === modal) {

                modal.style.display = "none";

            }

        });

        displayApplications();

    }

    // ==================================================
    // 12. EXCEL EXPORT
    // ==================================================

    const exportButton = document.getElementById("exportExcel");

    if (exportButton) {

        exportButton.addEventListener("click", function () {

            const applications = getApplications();

            if (applications.length === 0) {

                alert("There are no applications to export!");

                return;

            }

            if (typeof XLSX === "undefined") {

                alert("Excel library has not loaded. Check your internet connection.");

                return;

            }

            try {

                const excelRows = applications.map((app, index) => ({

                    "No.": index + 1,

                    "Reference Number": app.reference || "",

                    "Student Name": app.name || "",

                    "ID Number": app.idno || "",

                    "Phone Number": app.phone || "",

                    "Sub-location": app.subLocation || "",

                    "Village": app.village || "",

                    "School": app.school || "",

                    "Education Level": app.level || "",

                    "Admission Number": app.admission || "",

                    "Amount Requested": app.amount || "",

                    "Supporting Document": app.documentName || "",

                    "M-Pesa Number": app.mpesa || "",

                    "Reason": app.reason || "",

                    "Application Date": app.date || "",

                    "Status": getStatus(app)

                }));

                const worksheet = XLSX.utils.json_to_sheet(excelRows);

                worksheet["!cols"] = [
                    { wch: 7 },
                    { wch: 20 },
                    { wch: 25 },
                    { wch: 15 },
                    { wch: 18 },
                    { wch: 20 },
                    { wch: 20 },
                    { wch: 28 },
                    { wch: 18 },
                    { wch: 20 },
                    { wch: 18 },
                    { wch: 25 },
                    { wch: 18 },
                    { wch: 35 },
                    { wch: 23 },
                    { wch: 15 }
                ];

                const workbook = XLSX.utils.book_new();

                XLSX.utils.book_append_sheet(
                    workbook,
                    worksheet,
                    "Bursary Applications"
                );

                XLSX.writeFile(
                    workbook,
                    "Keyian_Ward_Bursary_Applications.xlsx"
                );

            } catch (error) {

                console.error("Excel export error:", error);

                alert("Excel export failed. Please try again.");

            }

        });

    }

    // ==================================================
    // 13. PDF EXPORT
    // ==================================================

    const pdfButton = document.getElementById("downloadPDF");

    if (pdfButton) {

        pdfButton.addEventListener("click", function () {

            const applications = getApplications();

            if (applications.length === 0) {

                alert("There are no applications to export!");

                return;

            }

            if (!window.jspdf || !window.jspdf.jsPDF) {

                alert("PDF library has not loaded. Check your internet connection.");

                return;

            }

            try {

                const { jsPDF } = window.jspdf;

                const doc = new jsPDF({
                    orientation: "landscape"
                });

                doc.setFontSize(18);

                doc.text("KEYIAN WARD BURSARY", 14, 18);

                doc.setFontSize(11);

                doc.text("Bursary Applications Report", 14, 27);

                doc.text(
                    "Generated: " + new Date().toLocaleString(),
                    14,
                    34
                );

                const rows = applications.map((app, index) => [

                    index + 1,

                    app.reference || "",

                    app.name || "",

                    app.idno || "",

                    app.phone || "",

                    app.school || "",

                    app.amount || "",

                    app.date || "",

                    getStatus(app)

                ]);

                const tableOptions = {

                    startY: 40,

                    head: [[
                        "No.",
                        "Reference",
                        "Student Name",
                        "ID Number",
                        "Phone",
                        "School",
                        "Amount",
                        "Application Date",
                        "Status"
                    ]],

                    body: rows,

                    styles: {
                        fontSize: 7,
                        cellPadding: 2,
                        overflow: "linebreak"
                    },

                    headStyles: {
                        fillColor: [30, 100, 60]
                    }

                };

                if (typeof doc.autoTable === "function") {

                    doc.autoTable(tableOptions);

                } else if (typeof window.jspdf.jsPDF.API.autoTable === "function") {

                    doc.autoTable(tableOptions);

                } else {

                    alert("PDF table library has not loaded. Check AutoTable.");

                    return;

                }

                doc.save("Keyian_Ward_Bursary_Report.pdf");

            } catch (error) {

                console.error("PDF export error:", error);

                alert("PDF export failed. Please try again.");

            }

        });

    }

    // ==================================================
    // 14. SYSTEM READY
    // ==================================================

    console.log("KEYIAN WARD BURSARY SYSTEM READY");

});
