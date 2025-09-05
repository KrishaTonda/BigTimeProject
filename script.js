// Save form data
function saveFormData(formId) {
  const form = document.getElementById(formId);
  const formData = new FormData(form);
  const data = {};

  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  localStorage.setItem("formData_" + formId, JSON.stringify(data));
  console.log(`Form data saved for ${formId}:`, data);
}

// Load form data
function loadFormData(formId) {
  const savedData = localStorage.getItem("formData_" + formId);
  if (savedData) {
    const data = JSON.parse(savedData);
    const form = document.getElementById(formId);

    Object.keys(data).forEach((key) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = data[key];
      }
    });
    console.log(`Form data loaded for ${formId}:`, data);
    return data;
  }
  return null;
}

// Clear saved form data
function clearFormData(formId) {
  localStorage.removeItem("formData_" + formId);
  console.log(`Form data cleared for ${formId}`);
}

// Check if form data exists
function hasFormData(formId) {
  return localStorage.getItem("formData_" + formId) !== null;
}

// Auto-save form data as user types
function enableAutoSave(formId, delay = 1000) {
  const form = document.getElementById(formId);
  let timeoutId;

  if (form) {
    form.addEventListener("input", function () {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveFormData(formId);
      }, delay);
    });
  }
}

// Load and display saved data summary
function showSavedDataSummary(formId) {
  const savedData = localStorage.getItem("formData_" + formId);
  if (savedData) {
    const data = JSON.parse(savedData);
    const summary = Object.entries(data)
      .filter(([key, value]) => value && value.toString().trim() !== "")
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    console.log(`Saved data for ${formId}: ${summary}`);
    return summary;
  }
  return "No saved data";
}

// Initialize form with auto-save and load functionality
function initializeForm(formId, autoSaveDelay = 1000) {
  // Load existing data when page loads
  loadFormData(formId);

  // Enable auto-save
  enableAutoSave(formId, autoSaveDelay);

  // Clear data on successful form submission
  const form = document.getElementById(formId);
  if (form) {
    form.addEventListener("submit", function () {
      // Clear saved data after successful submission
      setTimeout(() => {
        clearFormData(formId);
      }, 1000);
    });
  }
}

// Get all saved form data across the application
function getAllSavedData() {
  const allData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("formData_")) {
      const formId = key.replace("formData_", "");
      allData[formId] = JSON.parse(localStorage.getItem(key));
    }
  }
  return allData;
}

// Export form data (useful for backup or transfer)
function exportFormData(formId) {
  const data = localStorage.getItem("formData_" + formId);
  if (data) {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formId}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Import form data from file
function importFormData(formId, file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      localStorage.setItem("formData_" + formId, JSON.stringify(data));
      loadFormData(formId);
      console.log(`Form data imported for ${formId}`);
    } catch (error) {
      console.error("Error importing form data:", error);
    }
  };
  reader.readAsText(file);
}

// Product management functions
let products = JSON.parse(localStorage.getItem("products")) || [];

// Add product to the list
function addProduct(productData) {
  const product = {
    id: Date.now(), // Simple ID generation
    name: productData.name || "",
    description: productData.description || "",
    price: parseFloat(productData.price) || 0,
    sku: productData.sku || "",
    stock: parseInt(productData.stock) || 0,
    category: productData.category || "",
    status: "Draft",
    images: productData.images || "",
    imageUrl: productData.imageUrl || "", // Store the image URL
    dateAdded: new Date().toLocaleDateString(),
  };

  products.push(product);
  localStorage.setItem("products", JSON.stringify(products));
  updateProductTable();
  console.log("Product added:", product);
}

// Update product in the list
function updateProduct(productId, productData) {
  const index = products.findIndex((p) => p.id === productId);
  if (index !== -1) {
    products[index] = {
      ...products[index],
      name: productData.name || products[index].name,
      description: productData.description || products[index].description,
      price: parseFloat(productData.price) || products[index].price,
      sku: productData.sku || products[index].sku,
      stock: parseInt(productData.stock) || products[index].stock,
      category: productData.category || products[index].category,
      images: productData.images || products[index].images,
      imageUrl: productData.imageUrl || products[index].imageUrl,
    };
    localStorage.setItem("products", JSON.stringify(products));
    updateProductTable();
    console.log("Product updated:", products[index]);
  }
}

// Delete product from the list
function deleteProduct(productId) {
  products = products.filter((p) => p.id !== productId);
  localStorage.setItem("products", JSON.stringify(products));
  updateProductTable();
  console.log("Product deleted:", productId);
}

// Update product status
function updateProductStatus(productId, status) {
  const product = products.find((p) => p.id === productId);
  if (product) {
    product.status = status;
    localStorage.setItem("products", JSON.stringify(products));
    updateProductTable();
    console.log("Product status updated:", productId, status);
  }
}

// Update the product table display
function updateProductTable() {
  const tbody = document.querySelector("#products table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (products.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; padding: 20px;">No products added yet</td></tr>';
    return;
  }

  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        ${
          product.imageUrl
            ? `<img src="${product.imageUrl}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">`
            : '<div style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; border: 1px solid #ddd;">No Image</div>'
        }
      </td>
      <td>${product.name || "Unnamed Product"}</td>
      <td>GHS ${product.price.toFixed(2)}</td>
      <td>${product.stock}</td>
      <td>
        <span style="
          padding: 4px 8px; 
          border-radius: 12px; 
          font-size: 12px; 
          background: ${getStatusColor(product.status)};
          color: white;
        ">${product.status}</span>
      </td>
      <td>
        <button type="button" onclick="editProduct(${
          product.id
        })" style="margin: 2px; padding: 4px 8px; font-size: 11px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Edit</button>
        <button type="button" onclick="deleteProduct(${
          product.id
        })" style="margin: 2px; padding: 4px 8px; font-size: 11px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Delete</button>
        <button type="button" onclick="updateProductStatus(${product.id}, '${
      product.status === "Draft" ? "Published" : "Draft"
    }')" style="margin: 2px; padding: 4px 8px; font-size: 11px; background: ${
      product.status === "Draft" ? "#28a745" : "#6c757d"
    }; color: white; border: none; border-radius: 3px; cursor: pointer;">${
      product.status === "Draft" ? "Publish" : "Unpublish"
    }</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Get status color for styling
function getStatusColor(status) {
  switch (status) {
    case "Draft":
      return "#6c757d";
    case "Published":
      return "#28a745";
    case "Out of Stock":
      return "#dc3545";
    default:
      return "#6c757d";
  }
}

// Edit product (load data into form)
function editProduct(productId) {
  const product = products.find((p) => p.id === productId);
  if (product) {
    const form = document.getElementById("productForm");
    if (form) {
      // Fill form with product data
      form.querySelector('[name="name"]').value = product.name || "";
      form.querySelector('[name="description"]').value =
        product.description || "";
      form.querySelector('[name="price"]').value = product.price || "";
      form.querySelector('[name="sku"]').value = product.sku || "";
      form.querySelector('[name="stock"]').value = product.stock || "";
      form.querySelector('[name="category"]').value = product.category || "";

      // Store the product ID for updating
      form.dataset.editingId = productId;

      // Scroll to form
      form.scrollIntoView({ behavior: "smooth" });
    }
  }
}

// Handle image preview when user selects a file
function handleImagePreview(event) {
  const file = event.target.files[0];
  const previewContainer = document.getElementById("imagePreview");

  if (file && previewContainer) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewContainer.innerHTML = `
        <div style="margin-top: 10px;">
          <p style="font-size: 12px; color: #666; margin: 5px 0;">Image Preview:</p>
          <img src="${e.target.result}" alt="Preview" style="max-width: 100px; max-height: 100px; border-radius: 4px; border: 1px solid #ddd;">
        </div>
      `;
    };
    reader.readAsDataURL(file);
  } else if (previewContainer) {
    previewContainer.innerHTML = "";
  }
}

// Handle form submission
function handleProductFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const data = {};

  // Process regular form fields
  for (let [key, value] of formData.entries()) {
    if (key !== "images") {
      // Handle images separately
      data[key] = value;
    }
  }

  // Handle image file
  const imageFile = form.querySelector('[name="images"]').files[0];
  if (imageFile) {
    // Create a URL for the image file
    data.imageUrl = URL.createObjectURL(imageFile);
    data.images = imageFile.name; // Store the filename
  }

  // Check if we're editing an existing product
  if (form.dataset.editingId) {
    updateProduct(parseInt(form.dataset.editingId), data);
    form.dataset.editingId = "";
  } else {
    addProduct(data);
  }

  // Reset form
  form.reset();

  // Clear saved form data
  clearFormData("productForm");

  // Show success message
  showMessage("Product saved successfully!", "success");
}

// Show message to user
function showMessage(message, type = "info") {
  const messageDiv = document.createElement("div");
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    background: ${
      type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#007bff"
    };
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}
