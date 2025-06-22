document.addEventListener("DOMContentLoaded", function () {
  const projectsSection = document.getElementById("projects-section");
  const packagesSection = document.getElementById("packages-section");
  const contractorsSection = document.getElementById("contractors-section");

  // Initialize section visibility
  if (window.is_contractor) {
    // For Contractors, show only contractors section
    if (projectsSection) projectsSection.style.display = "none";
    if (packagesSection) packagesSection.style.display = "none";
    if (contractorsSection) contractorsSection.style.display = "block";
    // Filter contractor rows
    filterContractorRows();
  } else {
    // For Platform Owners and Department Owners, show only department section initially
    if (projectsSection) projectsSection.style.display = "none";
    if (packagesSection) packagesSection.style.display = "none";
    if (contractorsSection) contractorsSection.style.display = "none";
  }

  // Initialize table event listeners
  initializeProjectTableListeners();
  initializePackageTableListeners();
  initializeViewDocumentsListeners();

  // Initialize no data modal
  let noDataModal = null;
  const noDataModalElement = document.getElementById("noDataModal");
  if (noDataModalElement) {
    noDataModal = new bootstrap.Modal(noDataModalElement);
    noDataModalElement.addEventListener("hidden.bs.modal", function () {
      document
        .querySelectorAll(".modal-backdrop")
        .forEach((backdrop) => backdrop.remove());
      document.body.classList.remove("modal-open");
      document.body.style.paddingRight = "";
    });
  } else {
    console.warn("No Data modal element not found");
  }

  // Fix modal backdrop issue for other modals
  const modals = [
    "addDepartmentModal",
    "addProjectModal",
    "addPackageModal",
    "addContractorModal",
    "viewDocumentsModal",
  ];
  modals.forEach((modalId) => {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.addEventListener("hidden.bs.modal", function () {
        document
          .querySelectorAll(".modal-backdrop")
          .forEach((backdrop) => backdrop.remove());
        document.body.classList.remove("modal-open");
        document.body.style.paddingRight = "";
      });
    }
  });

  // Expose noDataModal to window for use in toggle functions
  window.noDataModal = noDataModal;
});

// Filter contractor rows for Contractors
function filterContractorRows() {
  if (window.is_contractor && window.user_contractor_id) {
    document.querySelectorAll(".contractor-row").forEach((row) => {
      if (row.dataset.contractorId === window.user_contractor_id) {
        row.classList.add("visible");
      } else {
        row.classList.remove("visible");
      }
    });
  }
}

// Section 1: Department, Project, Package, and Contractor Selection
function toggleProjects(checkbox, deptId) {
  document.querySelectorAll('input[name="dept-checkbox"]').forEach((cb) => {
    if (cb !== checkbox) cb.checked = false;
  });

  document.querySelectorAll("table.table-primary tbody tr").forEach((row) => {
    row.classList.remove("selected-row");
  });

  const projectsSection = document.getElementById("projects-section");
  const packagesSection = document.getElementById("packages-section");
  const contractorsSection = document.getElementById("contractors-section");

  if (checkbox.checked) {
    checkbox.closest("tr").classList.add("selected-row");
    if (projectsSection) projectsSection.style.display = "block";

    let visibleProjects = 0;
    document.querySelectorAll(".project-row").forEach((row) => {
      if (row.dataset.dept === deptId) {
        row.classList.add("visible");
        visibleProjects++;
      } else {
        row.classList.remove("visible");
      }
    });

    if (visibleProjects === 0 && window.noDataModal) {
      document.getElementById("noDataMessage").textContent =
        "No projects available for the selected department.";
      window.noDataModal.show();
    }

    // Hide subsequent sections
    if (packagesSection) packagesSection.style.display = "none";
    if (contractorsSection) contractorsSection.style.display = "none";

    document
      .querySelectorAll('input[name="project-checkbox"]')
      .forEach((cb) => {
        cb.checked = false;
      });
    document
      .querySelectorAll('input[name="package-checkbox"]')
      .forEach((cb) => {
        cb.checked = false;
      });

    window.selectedDepartmentId = deptId;
    window.selectedProjectId = null;
    window.selectedPackageId = null;
  } else {
    if (projectsSection) projectsSection.style.display = "none";
    if (packagesSection) packagesSection.style.display = "none";
    if (contractorsSection) contractorsSection.style.display = "none";
    window.selectedDepartmentId = null;
    window.selectedProjectId = null;
    window.selectedPackageId = null;
  }
}

function togglePackages(checkbox, projectId) {
  document.querySelectorAll('input[name="project-checkbox"]').forEach((cb) => {
    if (cb !== checkbox) cb.checked = false;
  });

  document.querySelectorAll("table.table-secondary tbody tr").forEach((row) => {
    row.classList.remove("selected-row");
  });

  const packagesSection = document.getElementById("packages-section");
  const contractorsSection = document.getElementById("contractors-section");

  if (checkbox.checked) {
    checkbox.closest("tr").classList.add("selected-row");
    if (packagesSection) packagesSection.style.display = "block";

    let visiblePackages = 0;
    document.querySelectorAll(".package-row").forEach((row) => {
      if (row.dataset.project === projectId) {
        row.classList.add("visible");
        visiblePackages++;
      } else {
        row.classList.remove("visible");
      }
    });

    if (visiblePackages === 0 && window.noDataModal) {
      document.getElementById("noDataMessage").textContent =
        "No packages available for the selected project.";
      window.noDataModal.show();
    }

    // Hide subsequent section
    if (contractorsSection) contractorsSection.style.display = "none";

    document
      .querySelectorAll('input[name="package-checkbox"]')
      .forEach((cb) => {
        cb.checked = false;
      });

    window.selectedProjectId = projectId;
    window.selectedPackageId = null;
  } else {
    if (packagesSection) packagesSection.style.display = "none";
    if (contractorsSection) contractorsSection.style.display = "none";
    window.selectedProjectId = null;
    window.selectedPackageId = null;
  }
}

// Section 1: Department, Project, Package, and Contractor Selection
function toggleContractors(checkbox, pacId) {
  // Changed packageId to pacId
  document.querySelectorAll('input[name="package-checkbox"]').forEach((cb) => {
    if (cb !== checkbox) cb.checked = false;
  });

  document.querySelectorAll("table.table-secondary tbody tr").forEach((row) => {
    row.classList.remove("selected-row");
  });

  const contractorsSection = document.getElementById("contractors-section");

  if (checkbox.checked) {
    checkbox.closest("tr").classList.add("selected-row");
    if (contractorsSection) contractorsSection.style.display = "block";

    let visibleContractors = 0;
    document.querySelectorAll(".contractor-row").forEach((row) => {
      if (row.dataset.package === pacId) {
        // Changed to pacId
        if (window.is_contractor && window.user_contractor_id) {
          if (row.dataset.contractorId === window.user_contractor_id) {
            row.classList.add("visible");
            visibleContractors++;
          } else {
            row.classList.remove("visible");
          }
        } else {
          row.classList.add("visible");
          visibleContractors++;
        }
      } else {
        row.classList.remove("visible");
      }
    });

    if (visibleContractors === 0 && window.noDataModal) {
      document.getElementById("noDataMessage").textContent =
        "No contractors available for the selected package.";
      window.noDataModal.show();
    }

    window.selectedPackageId = pacId; // Still using selectedPackageId for consistency
  } else {
    if (contractorsSection) contractorsSection.style.display = "none";
    window.selectedPackageId = null;
  }
}

// Initialize project table event listeners
function initializeProjectTableListeners() {
  const projectRows = document.querySelectorAll(".project-row");
  projectRows.forEach((row) => {
    row.removeEventListener("click", handleProjectRowClick);
    const checkbox = row.querySelector('input[name="project-checkbox"]');
    if (checkbox) {
      checkbox.removeEventListener("change", handleProjectCheckboxChange);
    }

    row.addEventListener("click", handleProjectRowClick);
    if (checkbox) {
      checkbox.addEventListener("change", handleProjectCheckboxChange);
    }
  });
}

function handleProjectRowClick(e) {
  if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") return;

  const row = e.currentTarget;
  const projectId = row.dataset.projectId;
  if (projectId) {
    window.selectedProjectId = projectId;
    const checkbox = row.querySelector('input[name="project-checkbox"]');
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      togglePackages(checkbox, projectId);
    }
  }
}

function handleProjectCheckboxChange(e) {
  togglePackages(e.target, e.target.value);
}

// Initialize package table event listeners
function initializePackageTableListeners() {
  const packageRows = document.querySelectorAll(".package-row");
  packageRows.forEach((row) => {
    row.removeEventListener("click", handlePackageRowClick);
    const checkbox = row.querySelector('input[name="package-checkbox"]');
    if (checkbox) {
      checkbox.removeEventListener("change", handlePackageCheckboxChange);
      checkbox.addEventListener("change", handlePackageCheckboxChange);
    }
  });
}

function handlePackageRowClick(e) {
  if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") return;

  const row = e.currentTarget;
  const pacId = row.dataset.pacId; // Changed to pacId
  if (pacId) {
    window.selectedPackageId = pacId;
    const checkbox = row.querySelector('input[name="package-checkbox"]');
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      toggleContractors(checkbox, pacId);
    }
  }
}

function handlePackageCheckboxChange(e) {
  toggleContractors(e.target, e.target.value);
}

// Initialize view documents button listeners
function initializeViewDocumentsListeners() {
  document.removeEventListener("click", handleViewDocumentsClick);
  document.addEventListener("click", handleViewDocumentsClick);
}

function handleViewDocumentsClick(e) {
  if (e.target && e.target.classList.contains("view-documents-btn")) {
    const btn = e.target;
    const row = btn.closest("tr");
    const baseUrl = window.location.origin;

    const documents = {
      performance_guarantee:
        row.dataset.performanceGuarantee !== "''"
          ? row.dataset.performanceGuarantee
          : "",
      bank_guarantee:
        row.dataset.bankGuarantee !== "''" ? row.dataset.bankGuarantee : "",
      performance_bank_guarantee:
        row.dataset.performanceBankGuarantee !== "''"
          ? row.dataset.performanceBankGuarantee
          : "",
      contract_document:
        row.dataset.contractDocument !== "''"
          ? row.dataset.contractDocument
          : "",
    };

    console.log("Document URLs:", documents);
    updateDocumentModalContent(documents);

    const modal = new bootstrap.Modal(
      document.getElementById("viewDocumentsModal")
    );
    modal.show();
  }
}

function updateDocumentModalContent(documents) {
  const pgStatus = document.getElementById("pg-status");
  const bgStatus = document.getElementById("bg-status");
  const performanceBgStatus = document.getElementById("performance-bg-status");
  const contractStatus = document.getElementById("contract-status");
  const pgAction = document.getElementById("pg-action");
  const bgAction = document.getElementById("bg-action");
  const performanceBgAction = document.getElementById("performance-bg-action");
  const contractAction = document.getElementById("contract-action");
  const documentViewer = document.getElementById("document-viewer");
  const documentIframe = document.getElementById("document-iframe");
  const iframeError = document.getElementById("iframe-error");

  documentViewer.style.display = "none";
  documentIframe.src = "";
  if (iframeError) iframeError.style.display = "none";

  const createStatusHtml = (available) =>
    available
      ? '<i class="fas fa-check-circle text-success"></i> Available'
      : '<i class="fas fa-times-circle text-danger"></i> Not Available';

  const createActionHtml = (url) =>
    url
      ? `<a href="${url}" target="_blank" class="view-document-link btn btn-sm btn-primary">View</a>`
      : "";

  pgStatus.innerHTML = createStatusHtml(documents.performance_guarantee);
  bgStatus.innerHTML = createStatusHtml(documents.bank_guarantee);
  performanceBgStatus.innerHTML = createStatusHtml(
    documents.performance_bank_guarantee
  );
  contractStatus.innerHTML = createStatusHtml(documents.contract_document);

  pgAction.innerHTML = createActionHtml(documents.performance_guarantee);
  bgAction.innerHTML = createActionHtml(documents.bank_guarantee);
  performanceBgAction.innerHTML = createActionHtml(
    documents.performance_bank_guarantee
  );
  contractAction.innerHTML = createActionHtml(documents.contract_document);
}

// Section 2: Navigation Functions
function navigateToRequiredLandDocuments() {
  if (!window.selectedProjectId) {
    alert("Please select a project first.");
    return;
  }
  window.location.href = `/required_land_documents/?project_id=${window.selectedProjectId}`;
}

function navigateToProjectData() {
  if (!window.selectedProjectId) {
    alert("Please select a project first.");
    return;
  }
  window.location.href = `/project_data/?project_id=${window.selectedProjectId}`;
}

function navigateToContractDocuments() {
  if (!window.selectedProjectId) {
    alert("Please select a project first.");
    return;
  }
  window.location.href = `/contract_documents/?project_id=${window.selectedProjectId}`;
}

// Section 3: Modal and Form Handling
$(document).ready(function () {
  let addDeptModal = null;
  let addProjectModal = null;
  let addPackageModal = null;
  let addContractorModal = null;
  let viewDocumentsModal = null;

  try {
    const deptModalElement = document.getElementById("addDepartmentModal");
    const projectModalElement = document.getElementById("addProjectModal");
    const packageModalElement = document.getElementById("addPackageModal");
    const contractorModalElement =
      document.getElementById("addContractorModal");
    const viewDocumentsModalElement =
      document.getElementById("viewDocumentsModal");

    if (deptModalElement) addDeptModal = new bootstrap.Modal(deptModalElement);
    else console.warn("Department modal element not found");

    if (projectModalElement)
      addProjectModal = new bootstrap.Modal(projectModalElement);
    else console.warn("Project modal element not found");

    if (packageModalElement)
      addPackageModal = new bootstrap.Modal(packageModalElement);
    else console.warn("Package modal element not found");

    if (contractorModalElement)
      addContractorModal = new bootstrap.Modal(contractorModalElement);
    else console.warn("Contractor modal element not found");

    if (viewDocumentsModalElement)
      viewDocumentsModal = new bootstrap.Modal(viewDocumentsModalElement);
    else console.warn("View Documents modal element not found");
  } catch (e) {
    console.error("Error initializing modals:", e);
  }

  window.openAddProjectModal = function () {
    console.log("is_contractor:", window.is_contractor);
    console.log("user_dept_id:", window.user_dept_id);
    console.log("selectedDepartmentId:", window.selectedDepartmentId);

    let deptId = null;

    // For contractors, no department ID is needed as they can't add projects
    if (window.is_contractor) {
      console.warn("Contractors cannot add projects");
      alert("You do not have permission to add projects.");
      return;
    }

    // Use selectedDepartmentId if available, else fall back to user_dept_id
    if (window.selectedDepartmentId) {
      deptId = window.selectedDepartmentId;
      console.log("Using selectedDepartmentId:", deptId);
    } else if (window.user_dept_id) {
      deptId = window.user_dept_id;
      console.log("Using user_dept_id:", deptId);
    }

    if (!deptId) {
      console.warn("No department ID available");
      alert("Please select a department first.");
      return;
    }

    try {
      const departmentInput = $("#department_id");
      const projectForm = $("#projectForm");

      if (!departmentInput.length || !projectForm.length) {
        console.error("Form elements not found");
        alert("Error: Form configuration issue.");
        return;
      }

      if (!addProjectModal) {
        console.error("Project modal not initialized");
        alert("Error: Modal not initialized.");
        return;
      }

      departmentInput.val(deptId);
      projectForm[0].reset();
      addProjectModal.show();
      console.log("Project modal opened with department_id:", deptId);
    } catch (e) {
      console.error("Error opening project modal:", e);
      alert("Error opening modal: " + e.message);
    }
  };

  window.openAddPackageModal = function () {
    console.log(
      "Opening modal with selectedProjectId:",
      window.selectedProjectId
    );
    if (!window.selectedProjectId) {
      alert("Please select a project first.");
      return;
    }

    try {
      const packageForm = $("#packageForm");
      if (!packageForm.length) {
        console.error("Form elements not found");
        alert("Error: Form configuration issue.");
        return;
      }

      if (!addPackageModal) {
        console.error("Package modal not initialized");
        alert("Error: Modal not initialized.");
        return;
      }

      packageForm[0].reset();
      $("#package_id").val("");
      $("#project_id").val(window.selectedProjectId);
      $("#addPackageModalLabel").text("Add New Package"); // Added
      packageForm.attr("action", "/add_package/"); // Added
      addPackageModal.show();
    } catch (e) {
      console.error("Error opening package modal:", e);
      alert("Error opening modal: " + e.message);
    }
  };

  window.openEditPackageModal = function (pacId) {
    console.log("Opening edit modal for pacId:", pacId);
    try {
      const packageForm = $("#packageForm");
      if (!packageForm.length) {
        console.error("Package form not found");
        alert("Error: Form configuration issue.");
        return;
      }

      if (!addPackageModal) {
        console.error("Package modal not initialized");
        alert("Error: Modal not initialized.");
        return;
      }

      packageForm
        .find('button[type="submit"]')
        .prop("disabled", true)
        .text("Loading...");

      $.ajax({
        type: "GET",
        url: `/get_package/${pacId}/`,
        success: function (response) {
          console.log("Get package response:", response);
          if (response.success) {
            const packageData = response.package;
            $("#package_id").val(packageData.pac_id || "");
            $("#project_id").val(
              packageData.project_id || window.selectedProjectId || ""
            );
            $("#pac_name").val(packageData.pac_name || "");
            $("#pac_no").val(packageData.pac_no || "");
            $("#pac_type").val(packageData.pac_type || "1"); // Default to Construction
            $("#pac_status").val((packageData.pac_status || "1").toString()); // Default to Active
            $("#addPackageModalLabel").text("Edit Package");
            packageForm.attr("action", `/edit_package/${pacId}/`);
            packageForm
              .find('button[type="submit"]')
              .prop("disabled", false)
              .text("Save Package");
            addPackageModal.show();
          } else {
            alert("Error: " + (response.message || "Failed to fetch package"));
            packageForm
              .find('button[type="submit"]')
              .prop("disabled", false)
              .text("Save Package");
          }
        },
        error: function (xhr) {
          console.error("Error fetching package:", xhr.responseText);
          alert(
            "Error fetching package: " +
              (xhr.responseJSON?.message || xhr.responseText || "Unknown error")
          );
          packageForm
            .find('button[type="submit"]')
            .prop("disabled", false)
            .text("Save Package");
        },
      });
    } catch (e) {
      console.error("Error opening edit package modal:", e);
      alert("Error opening modal: " + e.message);
      packageForm
        .find('button[type="submit"]')
        .prop("disabled", false)
        .text("Save Package");
    }
  };

  window.deletePackage = function (pacId) {
    if (!confirm("Are you sure you want to delete this package?")) return;

    console.log("Deleting package with pacId:", pacId);
    $.ajax({
      type: "POST",
      url: `/delete_package/${pacId}/`,
      data: {
        csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(),
      },
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          "X-CSRFToken",
          $("input[name=csrfmiddlewaretoken]").val()
        );
      },
      success: function (response) {
        console.log("Delete package response:", response);
        if (response.success) {
          const row = document.querySelector(`tr[data-pac-id="${pacId}"]`);
          if (row) {
            row.remove();
            console.log("Package row removed from table");
          } else {
            console.warn("Package row not found in table for pacId:", pacId);
          }

          // Check remaining visible packages
          const visiblePackages = document.querySelectorAll(
            ".package-row.visible"
          ).length;
          console.log("Remaining visible packages:", visiblePackages);
          if (visiblePackages === 0) {
            const packagesTable = document.querySelector(
              "#packages-table-body"
            );
            if (packagesTable) {
              const noDataRow = document.createElement("tr");
              noDataRow.innerHTML =
                '<td colspan="6">No packages available.</td>';
              packagesTable.appendChild(noDataRow);
            }
            if (window.noDataModal) {
              document.getElementById("noDataMessage").textContent =
                "No packages available for the selected project.";
              window.noDataModal.show();
            }
          }
          const contractorsSection = document.getElementById(
            "contractors-section"
          );
          if (contractorsSection) contractorsSection.style.display = "none";
          window.selectedPackageId = null;
          alert("Package deleted successfully!");
        } else {
          alert("Error: " + (response.message || "Failed to delete package"));
        }
      },
      error: function (xhr) {
        console.error("Error deleting package:", xhr.responseText);
        alert(
          "Error deleting package: " +
            (xhr.responseJSON?.message || xhr.responseText || "Unknown error")
        );
      },
    });
  };

  window.openAddContractorModal = function () {
    if (!window.selectedPackageId) {
      alert("Please select a package first.");
      return;
    }

    try {
      const packageInput = $("#package_id_contractor");
      const contractorForm = $("#contractorForm");

      if (!packageInput.length || !contractorForm.length) {
        console.error("Form elements not found");
        alert("Error: Form configuration issue.");
        return;
      }

      if (!addContractorModal) {
        console.error("Contractor modal not initialized");
        alert("Error: Modal not initialized.");
        return;
      }

      packageInput.val(window.selectedPackageId);
      contractorForm[0].reset();
      addContractorModal.show();
    } catch (e) {
      console.error("Error opening contractor modal:", e);
      alert("Error opening modal: " + e.message);
    }
  };

  $("#departmentForm").on("submit", function (e) {
    e.preventDefault();
    const form = $(this);
    const formData = new FormData(this);
    console.log("Form data (serialized for logging):", form.serialize());

    $.ajax({
      type: "POST",
      url: "/add_department/",
      data: formData,
      processData: false,
      contentType: false,
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          "X-CSRFToken",
          $("input[name=csrfmiddlewaretoken]").val()
        );
      },
      success: function (response) {
        console.log("Add department response:", response);
        if (response.success) {
          if (addDeptModal) addDeptModal.hide();
          form[0].reset();

          try {
            const departmentsTable = document.querySelector(
              "table.table-primary tbody"
            );
            if (!departmentsTable) {
              console.error("Department table body not found");
              location.reload();
              return;
            }

            const deptData = response.department || {};
            if (!deptData || !deptData.dept_name) {
              console.error("Invalid department data:", deptData);
              location.reload();
              return;
            }

            // Remove "No data" row if present
            const noDataRow =
              departmentsTable.querySelector("tr td[colspan='8']");
            if (noDataRow) noDataRow.parentElement.remove();

            const row = document.createElement("tr");
            row.innerHTML = `
  <td>
    <input type="checkbox" name="dept-checkbox" value="${
      deptData.id
    }" onclick="toggleProjects(this, '${deptData.id}')">
  </td>
  <td>${deptData.dept_name || "N/A"}</td>
  <td><img height="50" width="50" src="${
    deptData.dept_logo ? deptData.dept_logo : ""
  }"></td>
  <td>${
    deptData.dept_no_of_projects !== undefined
      ? deptData.dept_no_of_projects
      : 0
  }</td>
  <td>${
    deptData.dept_reg_contractors !== undefined
      ? deptData.dept_reg_contractors
      : 0
  }</td>
  <td>${deptData.dept_status === 1 ? "Active" : "Suspend"}</td>
  <td>${
    deptData.dept_admins_users !== undefined ? deptData.dept_admins_users : 0
  }</td>
  <td><button class="btn btn-sm btn-warning">Suspend</button></td>
`;

            departmentsTable.appendChild(row);
          } catch (e) {
            console.error("Error updating departments table:", e);
            location.reload();
          }
        } else {
          alert("Error: " + (response.message || "Failed to add department"));
        }
      },
      error: function (xhr) {
        alert(
          "Error adding department: " +
            (xhr.responseJSON?.message || xhr.responseText)
        );
      },
    });
  });

    $("#projectForm").on("submit", function (e) {
    e.preventDefault();
    const form = $(this);

    // Client-side validation (unchanged)
    const deptId = $("#department_id").val()?.trim();
    const projectName = $("#project_name").val()?.trim();
    const projectAdminName = $("#project_admin_name").val()?.trim();
    const projectDescription = $("#project_description").val()?.trim();
    const projectDetailsKm = $("#project_details_km").val()?.trim();

    if (
      !deptId ||
      !projectName ||
      !projectAdminName ||
      !projectDescription ||
      !projectDetailsKm
    ) {
      const missingFields = [];
      if (!deptId) missingFields.push("Department ID");
      if (!projectName) missingFields.push("Project Name");
      if (!projectAdminName) missingFields.push("Admin Name");
      if (!projectDescription) missingFields.push("Description");
      if (!projectDetailsKm) missingFields.push("Total KM");
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    // Validate project_details_km as a number (unchanged)
    if (projectDetailsKm && isNaN(parseFloat(projectDetailsKm))) {
      alert("Total KM must be a valid number");
      return;
    }

    const formData = new FormData(this);
    formData.append("dept_id", deptId);
    formData.append("project_name", projectName);
    formData.append("project_admin_name", projectAdminName);
    formData.append("project_description", projectDescription);
    formData.append("project_details_km", projectDetailsKm);

    console.log("Form data (serialized for logging):", form.serialize());
    form.find('button[type="submit"]').prop("disabled", true).text("Saving...");

    $.ajax({
      type: "POST",
      url: "/add_project/",
      data: formData,
      processData: false,
      contentType: false,
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          "X-CSRFToken",
          $("input[name=csrfmiddlewaretoken]").val()
        );
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      },
      success: function (response) {
        console.log("Add project response:", response);
        if (response.success) {
          if (addProjectModal) addProjectModal.hide();
          form[0].reset();

          try {
            const projectsTable = document.querySelector(
              "#projects-table-body"
            );
            if (!projectsTable) {
              console.error("Projects table body not found");
              location.reload();
              return;
            }

            const projectData = response.project || {};
            if (!projectData || !projectData.project_name) {
              console.error("Invalid project data:", projectData);
              location.reload();
              return;
            }

            // Remove "No data" row if present (unchanged)
            const noDataRow = projectsTable.querySelector("tr td[colspan='7']");
            if (noDataRow) noDataRow.parentElement.remove();

            // Use requestAnimationFrame for smooth table update
            requestAnimationFrame(() => {
              const row = document.createElement("tr");
              // Determine visibility based on selected department and user role
              const isVisible = window.selectedDepartmentId === projectData.department_id;
              const isPlatformOwner = window.is_platform_owner || false;
              row.className = `project-row ${isVisible && !isPlatformOwner ? "visible" : isPlatformOwner ? "nested-section" : ""}`;
              row.dataset.dept = projectData.department_id || deptId;
              row.dataset.projectId = projectData.project_id;
              row.innerHTML = `
                <td>
                    <input type="checkbox" name="project-checkbox" value="${projectData.project_id}" onclick="togglePackages(this, '${projectData.project_id}')">
                </td>
                <td>${projectData.project_name || "N/A"}</td>
                <td>${projectData.project_admin_name || "N/A"}</td>
                <td>${projectData.project_details_km || "N/A"}</td>
                <td>${projectData.project_type || "N/A"}</td>
                <td>${projectData.from_km !== null || projectData.to_km !== null ? `${projectData.from_km || "N/A"} - ${projectData.to_km || "N/A"}` : "N/A"}</td>
                <td><button type="button" class="btn btn-sm btn-success" onclick="navigateToProjectData()">Edit</button></td>
              `;

              projectsTable.appendChild(row);
              initializeProjectTableListeners();

              // Ensure projects section is visible if the project matches the selected department
              const projectsSection = document.getElementById("projects-section");
              if (projectsSection && isVisible) {
                projectsSection.style.display = "block";
              }

              // Update visibility of all project rows based on selected department
              document.querySelectorAll(".project-row").forEach((projectRow) => {
                if (projectRow.dataset.dept === window.selectedDepartmentId) {
                  projectRow.classList.add("visible");
                  if (isPlatformOwner) projectRow.classList.remove("nested-section");
                } else {
                  projectRow.classList.remove("visible");
                  if (isPlatformOwner) projectRow.classList.add("nested-section");
                }
              });

              alert("Project added successfully!");
            });
          } catch (e) {
            console.error("Error updating projects table:", e);
            location.reload();
          }
        } else {
          alert("Error: " + (response.message || "Failed to add project"));
        }
      },
      error: function (xhr) {
        alert(
          "Error adding project: " +
            (xhr.responseJSON?.message || xhr.responseText)
        );
      },
      complete: function () {
        form
          .find('button[type="submit"]')
          .prop("disabled", false)
          .text("Save Project");
        if (addProjectModal) {
          addProjectModal.hide();
          document
            .querySelectorAll(".modal-backdrop")
            .forEach((backdrop) => backdrop.remove());
          document.body.classList.remove("modal-open");
          document.body.style.paddingRight = "";
        }
      },
    });
  });

  $("#packageForm").on("submit", function (e) {
    e.preventDefault();
    const form = $(this);
    const pacId = $("#package_id").val();
    const projectId = $("#project_id").val() || window.selectedProjectId;
    if (!projectId) {
      alert("Error: No project selected. Please select a project first.");
      return;
    }

    const formData = new FormData(this);
    formData.append("project_id", projectId);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    console.log("Form data (serialized for logging):", form.serialize());

    const url =
      form.attr("action") ||
      (pacId ? `/edit_package/${pacId}/` : "/add_package/");

    form.find('button[type="submit"]').prop("disabled", true).text("Saving...");

    $.ajax({
      type: "POST",
      url: url,
      data: formData,
      processData: false,
      contentType: false,
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          "X-CSRFToken",
          $("input[name=csrfmiddlewaretoken]").val()
        );
      },
      success: function (response) {
        console.log("Package response:", response);
        if (response.success) {
          if (addPackageModal) addPackageModal.hide();
          form[0].reset();
          $("#package_id").val("");

          try {
            const packagesTable = document.querySelector(
              "#packages-table-body"
            );
            if (!packagesTable) {
              console.error("Packages table body not found");
              location.reload();
              return;
            }

            const packageData = response.package || {};
            if (!packageData || !packageData.pac_name) {
              console.error("Invalid package data:", packageData);
              location.reload();
              return;
            }

            // Remove "No data" row if present
            const noDataRow = packagesTable.querySelector("tr td[colspan='6']");
            if (noDataRow) noDataRow.parentElement.remove();

            requestAnimationFrame(() => {
              const row = document.createElement("tr");
              row.className = `package-row ${
                window.selectedProjectId === packageData.project_id
                  ? "visible"
                  : ""
              }`;
              row.dataset.project = packageData.project_id;
              row.dataset.pacId = packageData.pac_id;
              row.innerHTML = `
                            <td><input type="checkbox" name="package-checkbox" value="${
                              packageData.pac_id
                            }" onclick="toggleContractors(this, '${
                packageData.pac_id
              }')"></td>
                            <td>${packageData.pac_name || "N/A"}</td>
                            <td>${packageData.pac_no || "N/A"}</td>
                            <td>${
                              packageData.pac_type == 1
                                ? "Construction"
                                : "Maintenance"
                            }</td>
                            <td>${
                              packageData.pac_status == 1
                                ? "Active"
                                : "Inactive"
                            }</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="openEditPackageModal('${
                                  packageData.pac_id
                                }')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deletePackage('${
                                  packageData.pac_id
                                }')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        `;

              if (pacId) {
                console.log("Editing package with pacId:", pacId);
                const existingRow = document.querySelector(
                  `tr[data-pac-id="${pacId}"]`
                );
                if (existingRow) {
                  existingRow.replaceWith(row);
                  console.log("Package row updated in table");
                } else {
                  console.warn(
                    "Existing package row not found for pacId:",
                    pacId
                  );
                  packagesTable.appendChild(row);
                }
              } else {
                console.log(
                  "Adding new package with pacId:",
                  packageData.pac_id
                );
                packagesTable.appendChild(row);
                window.selectedPackageId = packageData.pac_id;
              }

              initializePackageTableListeners();
              alert(
                pacId
                  ? "Package updated successfully!"
                  : "Package added successfully!"
              );
            });
          } catch (e) {
            console.error("Error updating packages table:", e);
            location.reload();
          }
        } else {
          alert("Error: " + (response.message || "Failed to save package"));
        }
      },
      error: function (xhr) {
        console.error("Error saving package:", xhr.responseText);
        alert(
          "Error saving package: " +
            (xhr.responseJSON?.message || xhr.responseText || "Unknown error")
        );
      },
      complete: function () {
        form
          .find('button[type="submit"]')
          .prop("disabled", false)
          .text("Save Package");
        if (addPackageModal) {
          addPackageModal.hide();
          document
            .querySelectorAll(".modal-backdrop")
            .forEach((backdrop) => backdrop.remove());
          document.body.classList.remove("modal-open");
          document.body.style.paddingRight = "";
        }
      },
    });
  });

  $("#contractorForm").on("submit", function (e) {
    e.preventDefault();
    const form = $(this);
    const packageId = $("#package_id_contractor").val();
    if (!packageId) {
      alert("Error: No package selected. Please select a package first.");
      return;
    }

    const formData = new FormData(this);
    console.log("Form data (serialized for logging):", form.serialize());

    form.find('button[type="submit"]').prop("disabled", true).text("Saving...");

    $.ajax({
      type: "POST",
      url: "/add_contractor/",
      data: formData,
      processData: false,
      contentType: false,
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          "X-CSRFToken",
          $("input[name=csrfmiddlewaretoken]").val()
        );
      },
      success: function (response) {
        console.log("Add contractor response:", response);
        if (response.success) {
          if (addContractorModal) addContractorModal.hide();
          form[0].reset();

          try {
            const contractorsTable = document.querySelector(
              "#contractors-table-body"
            );
            if (!contractorsTable) {
              console.error("Contractors table body not found");
              location.reload();
              return;
            }

            const contractorData = response.contractor || {};
            if (!contractorData || !contractorData.agency_name) {
              console.error("Invalid contractor data:", contractorData);
              location.reload();
              return;
            }

            // Remove "No data" row if present
            const noDataRow =
              contractorsTable.querySelector("tr td[colspan='9']");
            if (noDataRow) noDataRow.parentElement.remove();

            const row = document.createElement("tr");
            row.className = `contractor-row ${
              window.selectedPackageId === packageId ? "visible" : ""
            }`;
            row.dataset.package = packageId;
            row.dataset.contractorId = contractorData.contractor_id || "";
            row.dataset.performanceGuarantee =
              contractorData.performance_guarantee || "";
            row.dataset.bankGuarantee = contractorData.bank_guarantee || "";
            row.dataset.performanceBankGuarantee =
              contractorData.performance_bank_guarantee || "";
            row.dataset.contractDocument =
              contractorData.contract_document || "";
            row.innerHTML = `
              <td><input type="checkbox"></td>
              <td>${contractorData.agency_name || "N/A"}</td>
              <td>${
                contractorData.user_count !== undefined
                  ? contractorData.user_count
                  : 1
              }</td>
              <td>${contractorData.allocated_work || "N/A"}</td>
              <td>${contractorData.work_category || "N/A"}</td>
              <td>${contractorData.status || "N/A"}</td>
              <td>${
                contractorData.project_status !== undefined
                  ? contractorData.project_status
                  : 0
              }</td>
              <td>
                <button class="btn btn-sm btn-outline-success px-2 py-2 view-documents-btn" data-bs-toggle="modal" data-bs-target="#viewDocumentsModal">
                  <i class="fas fa-file-alt me-1"></i> Docs
                </button>
              </td>
              <td>
                <button class="btn btn-sm btn-success">Active</button>
              </td>
            `;

            contractorsTable.appendChild(row);
            initializeViewDocumentsListeners();
            alert("Contractor added successfully!");
          } catch (e) {
            console.error("Error updating contractors table:", e);
            location.reload();
          }
        } else {
          alert("Error: " + (response.message || "Failed to add contractor"));
        }
      },
      error: function (xhr) {
        alert(
          "Error adding contractor: " +
            (xhr.responseJSON?.message || xhr.responseText)
        );
      },
      complete: function () {
        form
          .find('button[type="submit"]')
          .prop("disabled", false)
          .text("Save Contractor");
      },
    });
  });

  $("#configureAreaForm").on("submit", function (e) {
    e.preventDefault();
    const form = $(this);
    const errorDiv = $("#form-error");
    errorDiv.hide();

    const inputs = [
      "state",
      "district",
      "taluka",
      "village",
      "km_start_whole",
      "km_start_fraction",
      "km_end_whole",
      "km_end_fraction",
      "contractor",
    ];
    let isValid = true;
    inputs.forEach((inputName) => {
      const input = form.find(`[name="${inputName}"]`);
      if (!input.val().trim()) {
        isValid = false;
        errorDiv.text("All fields are required.").show();
      }
    });

    if (!isValid) return;

    console.log("Form data:", form.serialize());
    $.ajax({
      type: "POST",
      url: "/add_configured_area/",
      data: form.serialize(),
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          "X-CSRFToken",
          $("input[name=csrfmiddlewaretoken]").val()
        );
      },
      success: function (response) {
        console.log("Add configured area response:", response);
        if (response.success) {
          form[0].reset();
          const area = response.area;
          const tableBody = $("#configuredAreasTableBody");
          if (tableBody.length) {
            const noData = $("#no-data-message");
            if (noData.length) noData.remove();

            const row = $("<tr>").attr("data-area-id", area.id);
            row.html(`
              <td><input type="checkbox"></td>
              <td>${area.state || "N/A"}</td>
              <td>${area.district || "N/A"}</td>
              <td>${area.taluka || "N/A"}</td>
              <td>${area.village || "N/A"}</td>
              <td>${area.km_start} - ${area.km_end}</td>
              <td>${area.contractor || "N/A"}</td>
              <td>
                <button class="btn btn-sm btn-warning suspend-btn" data-area-id="${
                  area.id
                }" data-status="${area.status}">
                  ${area.status === "Active" ? "Suspend" : "Activate"}
                </button>
              </td>
            `);
            tableBody.append(row);
          }
        } else {
          errorDiv
            .text(response.message || "Failed to add configured area")
            .show();
        }
      },
      error: function (xhr) {
        errorDiv.text(xhr.responseJSON?.message || "Server error").show();
        console.error("AJAX error:", xhr.responseText);
      },
    });
  });
});


function checkContractorSelection(event) {
    const selectedContractors = document.querySelectorAll('#contractors-table-body .contractor-row input[type="checkbox"]:checked');
    const addTenderBtn = document.getElementById('add-tender-btn');

    if (selectedContractors.length === 0) {
        event.preventDefault();
        alert('Please select a contractor to add tender documents.');
        return false;
    }

    // If a contractor is selected, allow navigation
    return true;
}

// Function to update the Add Tender Documents button state based on contractor selection
function updateTenderButtonState() {
    const selectedContractors = document.querySelectorAll('#contractors-table-body .contractor-row input[type="checkbox"]:checked');
    const addTenderBtn = document.getElementById('add-tender-btn');

    if (selectedContractors.length > 0) {
        addTenderBtn.removeAttribute('disabled');
    } else {
        addTenderBtn.setAttribute('disabled', 'disabled');
    }
}

// Add event listeners to contractor checkboxes to update button state
document.addEventListener('DOMContentLoaded', function() {
    const contractorCheckboxes = document.querySelectorAll('#contractors-table-body .contractor-row input[type="checkbox"]');
    contractorCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateTenderButtonState);
    });

    // Initial state check
    updateTenderButtonState();
});


