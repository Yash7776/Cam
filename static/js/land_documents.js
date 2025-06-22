$(document).ready(function () {
  let addDocumentModal = null;

  try {
    const docModalElement = document.getElementById("addDocumentModal");
    if (docModalElement) {
      addDocumentModal = new bootstrap.Modal(docModalElement);
    } else {
      console.warn("Document modal element not found");
    }
  } catch (e) {
    console.error("Error initializing document modal:", e);
  }

  window.openAddDocumentModal = function () {
    try {
      const documentForm = $("#documentForm");
      if (!documentForm.length) {
        console.error("Document form not found");
        alert("Error: Form configuration issue.");
        return;
      }

      if (!addDocumentModal) {
        console.error("Document modal not initialized");
        alert("Error: Modal not initialized.");
        return;
      }

      const projectId = $('input[name="project_id"]').val();
      if (!projectId) {
        alert("Please select a project first.");
        return;
      }

      documentForm[0].reset();
      addDocumentModal.show();
    } catch (e) {
      console.error("Error opening document modal:", e);
      alert("Error opening modal: " + e.message);
    }
  };

  $("#documentForm").on("submit", function (e) {
    e.preventDefault();
    const form = $(this);
    const projectId = $('input[name="project_id"]').val();

    if (!projectId) {
      alert("Please select a project first.");
      return;
    }

    console.log("Form data:", form.serialize());

    $.ajax({
      type: "POST",
      url: "/add_land_document/",
      data: form.serialize(),
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          "X-CSRFToken",
          $("input[name=csrfmiddlewaretoken]").val()
        );
      },
      success: function (response) {
        console.log("Add document response:", response);
        if (response.success) {
          if (addDocumentModal) {
            addDocumentModal.hide();
          }
          form[0].reset();

          // Dynamically append the new document to the table
          const docData = response.document;
          const tableBody = $("#land-documents-table tbody");
          const noDataRow = $("#no-data-row");

          if (noDataRow.length) {
            noDataRow.remove(); // Remove "No data" row if it exists
          }

          const newRow = `
                        <tr data-document-id="${docData.id}">
                            <td>${docData.sr_no}</td>
                            <td>${docData.doc_name}</td>
                            <td>${docData.upload_type}</td>
                            <td>${docData.compulsory}</td>
                            <td>
                                <select class="form-select status-select" name="status">
                                    <option value="In List" ${
                                      docData.status === "In List"
                                        ? "selected"
                                        : ""
                                    }>In List</option>
                                    <option value="Pending" ${
                                      docData.status === "Pending"
                                        ? "selected"
                                        : ""
                                    }>Pending</option>
                                    <option value="Completed" ${
                                      docData.status === "Completed"
                                        ? "selected"
                                        : ""
                                    }>Completed</option>
                                </select>
                            </td>
                        </tr>
                    `;
          tableBody.append(newRow);
        } else {
          alert("Error: " + (response.message || "Failed to add document"));
        }
      },
      error: function (xhr) {
        alert(
          "Error adding document: " +
            (xhr.responseJSON?.message || xhr.responseText)
        );
      },
    });
  });

  function saveChanges() {
    const updates = [];

    // Collect all rows with updated status
    $("#land-documents-table tbody tr").each(function () {
      const row = $(this);
      const documentId = row.data("document-id");
      const status = row.find(".status-select").val();

      if (documentId) {
        updates.push({
          document_id: documentId,
          status: status,
        });
      }
    });

    if (updates.length === 0) {
      alert("No changes to save.");
      return;
    }

    // Send the updates to the server
    $.ajax({
      type: "POST",
      url: "/update_land_documents/",
      data: {
        updates: JSON.stringify(updates),
        csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(),
      },
      success: function (response) {
        if (response.success) {
          alert("Changes saved successfully!");
          const projectId = $('input[name="project_id"]').val();
          if (projectId) {
            window.location.href = `/required_land_documents/?project_id=${projectId}`;
          } else {
            window.location.href = "/required_land_documents/";
          }
        } else {
          alert("Error: " + (response.message || "Failed to save changes"));
        }
      },
      error: function (xhr) {
        alert(
          "Error saving changes: " +
            (xhr.responseJSON?.message || xhr.responseText)
        );
      },
    });
  }
});