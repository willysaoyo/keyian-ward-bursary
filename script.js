
// ======================================================
// KEYIAN WARD BURSARY
// COMPLETE SUPABASE APPLICATION AND ADMIN SYSTEM
// ======================================================

document.addEventListener("DOMContentLoaded", async function () {

    // ======================================================
    // 1. SYSTEM SETTINGS
    // ======================================================

    const ADMIN_EMAIL = "wj7495751@gmail.com";
    const ADMIN_USERNAME = "KEYIAN";
    const ADMIN_USER_ID = "a9ef7d67-61c8-40c6-b867-2331b37ba5be";

    const BUCKET_NAME = "bursary-documents";
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const supabase = window.supabaseClient;

    let applications = [];

    if (!supabase) {
        console.error("Supabase client not found.");
        alert("Supabase is not connected. Please check supabase.js.");
        return;
    }

    // ======================================================
    // 2. HELPER FUNCTIONS
    // ======================================================

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
        const randomPart = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        return "KWB-" + Date.now() + "-" + randomPart;
    }

    function getStatus(app) {
        return app.status || "Pending";
    }

    function convertApplication(row) {
        return {
            id: row.id,
            userId: row.user_id,
            reference: row.reference_number,
            name: row.student_name,
            idno: row.id_number,
            phone: row.phone,
            subLocation: row.sub_location,
            village: row.village,
            school: row.school,
            level: row.level,
            admission: row.admission_number,
            amount: row.amount_requested,
            mpesa: row.mpesa_number,
            reason: row.reason,
            status: row.application_status || "Pending",
            date: row.application_date
                ? new Date(row.application_date).toLocaleString()
                : "",
            documentName: row.document_name || "Not provided",
            documentPath: row.document_path || ""
        };
    }

    function fieldValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : "";
    }

    function showError(message) {
        alert(message);
    }

    // ======================================================
    // 3. ADMIN LOGIN
    // ======================================================

    const loginForm = document.getElementById("admin-login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const username = fieldValue("username");
            const passwordElement = document.getElementById("password");
            const password = passwordElement ? passwordElement.value : "";

            if (username.toUpperCase() !== ADMIN_USERNAME) {
                showError("Incorrect administrator username.");
                return;
            }

            if (!password) {
                showError("Please enter your password.");
                return;
            }

            const loginButton = loginForm.querySelector(
                'button[type="submit"]'
            );

            if (loginButton) {
                loginButton.disabled = true;
                loginButton.textContent = "Signing in...";
            }

            try {
                const { data, error } =
                    await supabase.auth.signInWithPassword({
                        email: ADMIN_EMAIL,
                        password: password
                    });

                if (error) throw error;

                if (
                    !data.user ||
                    data.user.email !== ADMIN_EMAIL ||
                    data.user.id !== ADMIN_USER_ID
                ) {
                    await supabase.auth.signOut();

                    throw new Error(
                        "This account is not authorized as the administrator."
                    );
                }

                alert("Administrator login successful!");

                window.location.href = "admin-dashboard.html";

            } catch (error) {
                console.error("Admin login error:", error);

                showError("Login failed: " + error.message);

                if (loginButton) {
                    loginButton.disabled = false;
                    loginButton.textContent = "Login";
                }
            }
        });
    }

    // ======================================================
    // 4. STUDENT APPLICATION SUBMISSION
    // ======================================================

    const bursaryForm = document.getElementById("bursaryForm");

    if (bursaryForm) {
        bursaryForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const submitButton = bursaryForm.querySelector(
                '[type="submit"]'
            );

            const loader = document.getElementById("loader");
            const successMsg = document.getElementById("successMsg");
            const fileInput = document.getElementById("feefile");

            if (successMsg) successMsg.innerHTML = "";

            // ------------------------------------------
            // CHECK STUDENT LOGIN - MOBILE SESSION FIX
            // ------------------------------------------

            let user;

            try {
                const { data: sessionData, error: sessionError } =
                    await supabase.auth.getSession();

                if (sessionError) {
                    throw sessionError;
                }

                const session = sessionData.session;

                if (!session || !session.user) {
                    showError(
                        "Your login session has expired. Please log in again."
                    );

                    window.location.href = "student-login.html";
                    return;
                }

                user = session.user;

            } catch (error) {
                console.error("Student authentication error:", error);

                showError(
                    "Unable to verify your login: " + error.message
                );

                return;
            }

            // ------------------------------------------
            // CHECK SUPPORTING DOCUMENT
            // ------------------------------------------

            if (!fileInput || !fileInput.files.length) {
                showError("Please upload your supporting document.");
                return;
            }

            const file = fileInput.files[0];

            const allowedTypes = [
                "application/pdf",
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!allowedTypes.includes(file.type)) {
                showError(
                    "Please upload a PDF, JPG, PNG or WEBP document."
                );
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                showError(
                    "Your document is too large. Maximum size is 5 MB."
                );
                return;
            }

            if (file.size === 0) {
                showError("The selected document is empty.");
                return;
            }

            // ------------------------------------------
            // COLLECT APPLICATION INFORMATION
            // ------------------------------------------

            const applicationData = {
                user_id: user.id,
                student_name: fieldValue("name"),
                id_number: fieldValue("idno"),
                phone: fieldValue("phone"),
                sub_location: fieldValue("sub-location"),
                village: fieldValue("village"),
                school: fieldValue("school"),
                level: fieldValue("level"),
                admission_number: fieldValue("adm"),
                amount_requested: fieldValue("amount")
                    ? Number(fieldValue("amount"))
                    : null,
                mpesa_number: fieldValue("m-pesa"),
                reason: fieldValue("reason"),
                reference_number: generateReference(),
                application_status: "Pending"
            };

            if (
                !applicationData.student_name ||
                !applicationData.id_number ||
                !applicationData.phone ||
                !applicationData.sub_location ||
                !applicationData.school ||
                !applicationData.level ||
                !applicationData.reason ||
                !applicationData.amount_requested ||
                !Number.isFinite(applicationData.amount_requested) ||
                applicationData.amount_requested <= 0
            ) {
                showError("Please complete all required fields correctly.");
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Submitting...";
            }

            if (loader) loader.style.display = "block";

            let uploadedPath = null;

            try {

                // ------------------------------------------
                // UPLOAD DOCUMENT TO STUDENT'S OWN FOLDER
                // ------------------------------------------

                const safeFileName = file.name.replace(
                    /[^a-zA-Z0-9._-]/g,
                    "_"
                );

                uploadedPath =
                    user.id +
                    "/" +
                    applicationData.reference_number +
                    "/" +
                    Date.now() +
                    "_" +
                    safeFileName;

                const { error: uploadError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(uploadedPath, file, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: file.type
                    });

                if (uploadError) throw uploadError;

                // ------------------------------------------
                // SAVE APPLICATION IN DATABASE
                // ------------------------------------------

                applicationData.document_name = file.name;
                applicationData.document_path = uploadedPath;

                const { error: insertError } = await supabase
                    .from("applications")
                    .insert([applicationData]);

                if (insertError) throw insertError;

                // ------------------------------------------
                // STUDENT SUCCESS CONFIRMATION
                // ------------------------------------------

                const reference = applicationData.reference_number;

                if (successMsg) {
                    successMsg.innerHTML = `
                        <div style="
                            background:#e8f7ed;
                            border:2px solid #15803d;
                            border-radius:12px;
                            padding:25px;
                            margin:20px 0;
                            text-align:center;
                            color:#14532d;
                        ">

                            <h2 style="color:#15803d;">
                                Application Submitted Successfully!
                            </h2>

                            <p>
                                Your bursary application has been received.
                            </p>

                            <p>
                                Please keep your reference number safe.
                                You will need it to track your application.
                            </p>

                            <div style="
                                background:white;
                                border:2px dashed #15803d;
                                padding:15px;
                                border-radius:8px;
                                margin:15px 0;
                            ">
                                <p style="margin:0;">
                                    YOUR REFERENCE NUMBER
                                </p>

                                <h2 style="
                                    color:#123b27;
                                    overflow-wrap:anywhere;
                                ">
                                    ${escapeHTML(reference)}
                                </h2>
                            </div>

                            <button
                                type="button"
                                id="copyReferenceButton"
                                style="
                                    background:#15803d;
                                    color:white;
                                    border:none;
                                    padding:12px 20px;
                                    border-radius:6px;
                                    cursor:pointer;
                                    margin:5px;
                                ">
                                Copy Reference Number
                            </button>

                            <a href="track.html"
                                style="
                                    display:inline-block;
                                    background:#123b27;
                                    color:white;
                                    padding:12px 20px;
                                    border-radius:6px;
                                    text-decoration:none;
                                    margin:5px;
                                ">
                                Track Your Application
                            </a>
                        </div>
                    `;

                    const copyButton = document.getElementById(
                        "copyReferenceButton"
                    );

                    if (copyButton) {
                        copyButton.addEventListener(
                            "click",
                            async function () {
                                try {
                                    if (
                                        navigator.clipboard &&
                                        window.isSecureContext
                                    ) {
                                        await navigator.clipboard.writeText(
                                            reference
                                        );
                                    } else {
                                        const temporaryInput =
                                            document.createElement("textarea");

                                        temporaryInput.value = reference;
                                        document.body.appendChild(temporaryInput);
                                        temporaryInput.select();

                                        const copied =
                                            document.execCommand("copy");

                                        temporaryInput.remove();

                                        if (!copied) {
                                            throw new Error(
                                                "Copy was unsuccessful."
                                            );
                                        }
                                    }

                                    copyButton.textContent =
                                        "Copied Successfully!";

                                } catch (error) {
                                    alert(
                                        "Please copy your reference number manually: " +
                                        reference
                                    );
                                }
                            }
                        );
                    }

                    successMsg.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }

                alert(
                    "Application submitted successfully!\n\n" +
                    "Your Reference Number: " + reference +
                    "\n\nPlease keep this number safe."
                );

                bursaryForm.reset();

            } catch (error) {
                console.error(
                    "Application submission error:",
                    error
                );

                // Remove the uploaded file if database saving fails.

                if (uploadedPath) {
                    try {
                        await supabase.storage
                            .from(BUCKET_NAME)
                            .remove([uploadedPath]);
                    } catch (cleanupError) {
                        console.error(
                            "Document cleanup failed:",
                            cleanupError
                        );
                    }
                }

                showError(
                    "Application could not be submitted: " +
                    error.message
                );

            } finally {
                if (loader) loader.style.display = "none";

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Submit Application";
                }
            }
        });
    }

    // ======================================================
    // 5. ADMIN DASHBOARD SECURITY
    // ======================================================

    const applicationsTable = document.getElementById(
        "applicationsTable"
    );

    if (applicationsTable) {
        try {
            const { data, error } = await supabase.auth.getUser();

            if (
                error ||
                !data.user ||
                data.user.email !== ADMIN_EMAIL ||
                data.user.id !== ADMIN_USER_ID
            ) {
                await supabase.auth.signOut();

                alert(
                    "Please log in as the authorized administrator."
                );

                window.location.href = "admin.html";
                return;
            }

        } catch (error) {
            console.error("Admin verification error:", error);
            window.location.href = "admin.html";
            return;
        }

        // ------------------------------------------
        // ADMIN LOGOUT
        // ------------------------------------------

        const logoutButton = document.getElementById("logoutBtn");

        if (logoutButton) {
            logoutButton.addEventListener("click", async function () {
                if (!confirm("Are you sure you want to log out?")) {
                    return;
                }

                logoutButton.disabled = true;
                logoutButton.textContent = "Logging out...";

                try {
                    const { error } = await supabase.auth.signOut();

                    if (error) throw error;

                    window.location.href = "admin.html";

                } catch (error) {
                    console.error("Logout error:", error);

                    showError("Unable to log out: " + error.message);

                    logoutButton.disabled = false;
                    logoutButton.textContent = "Logout";
                }
            });
        }

        const totalElement = document.getElementById(
            "totalApplications"
        );

        const pendingElement = document.getElementById(
            "pendingApplications"
        );

        const approvedElement = document.getElementById(
            "approvedApplications"
        );

        const rejectedElement = document.getElementById(
            "rejectedApplications"
        );

        const searchInput = document.getElementById(
            "applicationSearch"
        );

        // ------------------------------------------
        // LOAD APPLICATIONS
        // ------------------------------------------

        async function loadApplications() {
            applicationsTable.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;padding:20px;">
                        Loading applications...
                    </td>
                </tr>
            `;

            try {
                const { data, error } = await supabase
                    .from("applications")
                    .select("*")
                    .order("application_date", { ascending: false });

                if (error) throw error;

                applications = (data || []).map(convertApplication);

                displayApplications();

            } catch (error) {
                console.error("Loading applications error:", error);

                applicationsTable.innerHTML = `
                    <tr>
                        <td colspan="9"
                            style="text-align:center;color:red;padding:20px;">
                            Unable to load applications:
                            ${escapeHTML(error.message)}
                        </td>
                    </tr>
                `;
            }
        }

        // ------------------------------------------
        // DASHBOARD STATISTICS
        // ------------------------------------------

        function updateStatistics() {
            if (totalElement) {
                totalElement.textContent = applications.length;
            }

            if (pendingElement) {
                pendingElement.textContent =
                    applications.filter(
                        app => getStatus(app) === "Pending"
                    ).length;
            }

            if (approvedElement) {
                approvedElement.textContent =
                    applications.filter(
                        app => getStatus(app) === "Approved"
                    ).length;
            }

            if (rejectedElement) {
                rejectedElement.textContent =
                    applications.filter(
                        app => getStatus(app) === "Rejected"
                    ).length;
            }
        }

        // ------------------------------------------
        // APPLICATION DETAILS MODAL
        // ------------------------------------------

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
                ">Close X</button>

                <h2 style="color:#123b27;">
                    Application Details
                </h2>

                <div id="applicationDetailsContent"></div>
            </div>
        `;

        document.body.appendChild(modal);

        const detailsContent = document.getElementById(
            "applicationDetailsContent"
        );

        // ------------------------------------------
        // VIEW APPLICATION DETAILS
        // ------------------------------------------

        async function viewApplication(index) {
            const app = applications[index];

            if (!app) {
                showError("Application not found.");
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
                ["Amount Requested (Ksh)", app.amount],
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

            if (app.documentPath) {
                const documentRow = document.createElement("div");
                documentRow.style.padding = "12px";
                documentRow.textContent = "Supporting document: ";

                const loadingText = document.createElement("span");
                loadingText.textContent =
                    "Preparing secure document link...";

                documentRow.appendChild(loadingText);
                detailsContent.appendChild(documentRow);

                try {
                    const { data, error } = await supabase.storage
                        .from(BUCKET_NAME)
                        .createSignedUrl(app.documentPath, 60);

                    if (error) throw error;

                    const link = document.createElement("a");

                    link.href = data.signedUrl;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.textContent = "Open supporting document";

                    loadingText.replaceWith(link);

                } catch (error) {
                    console.error("Document access error:", error);

                    loadingText.textContent =
                        "Unable to open document: " + error.message;
                }
            }
        }

        document.getElementById("closeDetailsModal")
            .addEventListener("click", function () {
                modal.style.display = "none";
            });

        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });

        // ------------------------------------------
        // DISPLAY APPLICATIONS
        // ------------------------------------------

        function displayApplications() {
            updateStatistics();

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
                        app.subLocation,
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
                                    data-index="${item.index}">
                                    View Details
                                </button>

                                <button
                                    data-action="approve"
                                    data-index="${item.index}">
                                    Approve
                                </button>

                                <button
                                    data-action="reject"
                                    data-index="${item.index}">
                                    Reject
                                </button>
                            </td>
                        </tr>
                    `;
                }).join("");
        }

        // ------------------------------------------
        // VIEW, APPROVE AND REJECT APPLICATIONS
        // ------------------------------------------

        applicationsTable.addEventListener(
            "click",
            async function (event) {
                const button = event.target.closest(
                    "button[data-action]"
                );

                if (!button) return;

                const action = button.dataset.action;
                const index = Number(button.dataset.index);
                const app = applications[index];

                if (!app) {
                    showError("Application not found.");
                    return;
                }

                if (action === "view") {
                    await viewApplication(index);
                    return;
                }

                if (action !== "approve" && action !== "reject") {
                    return;
                }

                const newStatus =
                    action === "approve" ? "Approved" : "Rejected";

                if (
                    !confirm(
                        "Are you sure you want to " +
                        action +
                        " this application?"
                    )
                ) {
                    return;
                }

                button.disabled = true;

                try {
                    const { error } = await supabase
                        .from("applications")
                        .update({
                            application_status: newStatus
                        })
                        .eq("id", app.id);

                    if (error) throw error;

                    app.status = newStatus;

                    alert(
                        "Application " +
                        newStatus.toLowerCase() +
                        " successfully!"
                    );

                    displayApplications();

                } catch (error) {
                    console.error(
                        "Application update error:",
                        error
                    );

                    showError(
                        "Unable to update application: " +
                        error.message
                    );

                    button.disabled = false;
                }
            }
        );

        // ------------------------------------------
        // SEARCH APPLICATIONS
        // ------------------------------------------

        if (searchInput) {
            searchInput.addEventListener(
                "input",
                displayApplications
            );
        }

        await loadApplications();
    }

    // ======================================================
    // 6. EXCEL EXPORT
    // ======================================================

    const exportButton = document.getElementById("exportExcel");

    if (exportButton) {
        exportButton.addEventListener("click", function () {
            if (applications.length === 0) {
                showError("There are no applications to export!");
                return;
            }

            if (typeof XLSX === "undefined") {
                showError("Excel library has not loaded.");
                return;
            }

            try {
                const rows = applications.map((app, index) => ({
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

                const worksheet = XLSX.utils.json_to_sheet(rows);
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

                showError(
                    "Excel export failed: " + error.message
                );
            }
        });
    }

    // ======================================================
    // 7. PDF EXPORT
    // ======================================================

    const pdfButton = document.getElementById("downloadPDF");

    if (pdfButton) {
        pdfButton.addEventListener("click", function () {
            if (applications.length === 0) {
                showError("There are no applications to export!");
                return;
            }

            if (!window.jspdf || !window.jspdf.jsPDF) {
                showError("PDF library has not loaded.");
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

                if (typeof doc.autoTable !== "function") {
                    showError("PDF table library has not loaded.");
                    return;
                }

                doc.autoTable({
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
                });

                doc.save("Keyian_Ward_Bursary_Report.pdf");

            } catch (error) {
                console.error("PDF export error:", error);

                showError(
                    "PDF export failed: " + error.message
                );
            }
        });
    }

    console.log(
        "KEYIAN WARD BURSARY SUPABASE SYSTEM READY"
    );

});
