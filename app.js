const $ = selector => document.querySelector(selector);

const state = {
  products: [],
  selected: null,
  quantity: 1
};


function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}


function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function showToast(message) {
  const toast = $("#toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}


async function apiRequest(
  endpoint,
  data = {},
  method = "POST"
) {

  const options = {
    method,

    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    }
  };

  if (method !== "GET") {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(
    endpoint,
    options
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Response server tidak valid."
    );
  }

  return result;
}


async function loadProducts() {

  $("#loading")
    .classList
    .remove("hidden");

  $("#emptyState")
    .classList
    .add("hidden");

  try {

    const result =
      await apiRequest(
        "/api/products",
        {},
        "GET"
      );

    if (!result.success) {
      throw new Error(
        result.message ||
        "Gagal mengambil produk."
      );
    }

    state.products =
      Array.isArray(result.products)
        ? result.products
        : [];

    $("#productCount")
      .textContent =
      state.products.length;

    renderProducts();

  } catch (error) {

    $("#productsGrid")
      .innerHTML = "";

    $("#emptyState")
      .classList
      .remove("hidden");

    showToast(error.message);

  } finally {

    $("#loading")
      .classList
      .add("hidden");

  }
}


function renderProducts() {

  const query =
    $("#searchInput")
      .value
      .toLowerCase()
      .trim();

  const filter =
    $("#filterSelect")
      .value;

  const products =
    state.products.filter(product => {

      const name =
        String(product.name || "")
          .toLowerCase();

      const description =
        String(product.description || "")
          .toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        description.includes(query);

      const available =
        String(product.status)
          .toLowerCase() ===
        "available";

      const matchesFilter =
        filter === "all" ||
        available;

      return (
        matchesSearch &&
        matchesFilter
      );
    });


  $("#productsGrid").innerHTML =
    products.map(product => {

      const available =
        String(product.status)
          .toLowerCase() ===
        "available" &&
        Number(product.stock) > 0;

      const image =
        product.image
          ? `
            <img
              src="${escapeHTML(product.image)}"
              alt="${escapeHTML(product.name)}"
              loading="lazy"
              onerror="this.style.display='none'"
            >
          `
          : `
            <div class="product-placeholder">
              ${escapeHTML(
                String(product.name || "R")
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>
          `;

      return `
        <article class="product">

          <div class="product-image">
            ${image}
          </div>

          <div class="product-body">

            <h3>
              ${escapeHTML(
                product.name ||
                "Produk Premium"
              )}
            </h3>

            <div class="product-description">
              ${escapeHTML(
                product.description ||
                "Produk premium digital."
              )}
            </div>

            <div class="product-meta">

              <span class="price">
                ${rupiah(product.price)}
              </span>

              <span class="stock ${
                available ? "" : "off"
              }">
                ${
                  available
                    ? `Stok ${product.stock}`
                    : "Habis"
                }
              </span>

            </div>

            <button
              class="btn ${
                available
                  ? "btn-primary"
                  : "btn-secondary"
              }"
              ${
                available
                  ? ""
                  : "disabled"
              }
              onclick="openOrder(
                ${Number(product.id)}
              )"
            >
              ${
                available
                  ? "Beli Sekarang"
                  : "Tidak Tersedia"
              }
            </button>

          </div>

        </article>
      `;

    }).join("");


  if (!products.length) {

    $("#emptyState")
      .classList
      .remove("hidden");

  } else {

    $("#emptyState")
      .classList
      .add("hidden");

  }
}


window.openOrder = function(productId) {

  const product =
    state.products.find(
      item =>
        Number(item.id) ===
        Number(productId)
    );

  if (!product) {
    return;
  }

  state.selected = product;
  state.quantity = 1;


  $("#orderContent").innerHTML = `

    <small
      style="
        color:#7d8aa0;
        letter-spacing:2px;
      "
    >
      CHECKOUT
    </small>

    <h3>
      ${escapeHTML(product.name)}
    </h3>

    <p
      style="
        color:#788397;
        font-size:11px;
        line-height:1.7;
      "
    >
      ${escapeHTML(
        product.description ||
        "Produk premium digital."
      )}
    </p>

    <div
      style="
        display:flex;
        justify-content:space-between;
        margin-top:20px;
      "
    >
      <span>Harga</span>

      <strong>
        ${rupiah(product.price)}
      </strong>
    </div>

    <div
      style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin:20px 0;
      "
    >

      <span
        style="
          color:#788397;
          font-size:11px;
        "
      >
        Jumlah
      </span>

      <div
        style="
          display:flex;
          align-items:center;
          border:1px solid var(--border);
          border-radius:10px;
          overflow:hidden;
        "
      >

        <button
          onclick="changeQuantity(-1)"
          style="
            width:36px;
            height:36px;
            border:0;
            background:rgba(255,255,255,.04);
            color:white;
            cursor:pointer;
          "
        >
          −
        </button>

        <b
          id="quantityValue"
          style="
            width:40px;
            text-align:center;
          "
        >
          1
        </b>

        <button
          onclick="changeQuantity(1)"
          style="
            width:36px;
            height:36px;
            border:0;
            background:rgba(255,255,255,.04);
            color:white;
            cursor:pointer;
          "
        >
          +
        </button>

      </div>

    </div>


    <div class="result">

      <div
        style="
          display:flex;
          justify-content:space-between;
        "
      >

        <span>Total</span>

        <strong id="orderTotal">
          ${rupiah(product.price)}
        </strong>

      </div>

    </div>


    <button
      id="confirmOrder"
      class="btn btn-primary full"
      style="margin-top:13px"
      onclick="submitOrder()"
    >
      Konfirmasi Order →
    </button>

  `;


  $("#orderModal")
    .classList
    .remove("hidden");
};


window.changeQuantity = function(delta) {

  if (!state.selected) {
    return;
  }

  const max =
    Math.max(
      1,
      Number(state.selected.stock) || 1
    );

  state.quantity =
    Math.max(
      1,
      Math.min(
        max,
        state.quantity + delta
      )
    );

  $("#quantityValue")
    .textContent =
    state.quantity;

  $("#orderTotal")
    .textContent =
    rupiah(
      Number(state.selected.price) *
      state.quantity
    );
};


window.submitOrder = async function() {

  if (!state.selected) {
    return;
  }

  const button =
    $("#confirmOrder");

  button.disabled = true;

  button.textContent =
    "Memproses order...";


  const refId =
    `RIDZZ-${Date.now()}-${
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()
    }`;


  try {

    const result =
      await apiRequest(
        "/api/order",
        {
          product_id:
            Number(state.selected.id),

          qty:
            state.quantity,

          ref_id:
            refId
        }
      );


    if (!result.success) {
      throw new Error(
        result.message ||
        "Order gagal."
      );
    }


    $("#orderContent").innerHTML = `

      <small
        style="
          color:#55dfbd;
          letter-spacing:2px;
        "
      >
        ORDER DITERIMA
      </small>

      <h3>
        Pesanan berhasil dibuat
      </h3>

      <p
        style="
          color:#788397;
          font-size:11px;
          line-height:1.7;
        "
      >
        ${escapeHTML(
          result.message ||
          "Order masuk ke antrian."
        )}
      </p>

      <div class="result">

        <strong>Invoice</strong>

        <br>

        ${escapeHTML(
          result.invoice
        )}

        <br><br>

        Produk:
        <strong>
          ${escapeHTML(
            result.product ||
            state.selected.name
          )}
        </strong>

        <br>

        Total:
        <strong>
          ${rupiah(result.total)}
        </strong>

      </div>


      <button
        class="btn btn-primary full"
        style="margin-top:13px"
        onclick="
          checkInvoice(
            '${escapeHTML(
              result.invoice
            )}'
          )
        "
      >
        Cek Status →
      </button>

    `;


    loadProducts();


  } catch (error) {

    showToast(
      error.message
    );

    button.disabled = false;

    button.textContent =
      "Konfirmasi Order →";
  }
};


window.checkInvoice = async function(invoice) {

  $("#orderModal")
    .classList
    .add("hidden");

  $("#invoiceInput")
    .value = invoice;

  document
    .querySelector("#tracking")
    .scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  await checkOrderStatus();
};


async function checkOrderStatus() {

  const invoice =
    $("#invoiceInput")
      .value
      .trim();

  if (!invoice) {
    showToast(
      "Masukkan invoice terlebih dahulu."
    );

    return;
  }


  $("#statusResult")
    .classList
    .remove("hidden");

  $("#statusResult")
    .innerHTML =
    "Mengambil status transaksi...";


  try {

    const result =
      await apiRequest(
        "/api/status",
        {
          invoice
        }
      );


    if (!result.success) {
      throw new Error(
        result.message ||
        "Gagal mengecek status."
      );
    }


    let html = `

      <strong>
        ${escapeHTML(
          String(
            result.status ||
            "unknown"
          ).toUpperCase()
        )}
      </strong>

      <br>

      Invoice:
      ${escapeHTML(
        result.invoice ||
        invoice
      )}

      <br>

      Produk:
      ${escapeHTML(
        result.product ||
        "-"
      )}

    `;


    if (
      Array.isArray(
        result.accounts
      ) &&
      result.accounts.length
    ) {

      html += `
        <hr>
        <strong>
          Detail Akun
        </strong>
      `;


      result.accounts.forEach(account => {

        html += `

          <div class="account">

            Username:
            <code>
              ${escapeHTML(
                account.username
              )}
            </code>

            <br>

            Password:
            <code>
              ${escapeHTML(
                account.password
              )}
            </code>

          </div>

        `;

      });

    }


    $("#statusResult")
      .innerHTML = html;


  } catch (error) {

    $("#statusResult")
      .innerHTML = `

        <span
          style="
            color:#ff7084;
          "
        >
          ${escapeHTML(
            error.message
          )}
        </span>

      `;
  }
}


async function createDeposit() {

  const amount =
    Number(
      $("#depositAmount")
        .value
    );


  if (
    !Number.isInteger(amount) ||
    amount < 1
  ) {

    showToast(
      "Masukkan nominal deposit yang valid."
    );

    return;
  }


  $("#depositResult")
    .classList
    .remove("hidden");

  $("#depositResult")
    .innerHTML =
    "Membuat pembayaran QRIS...";


  try {

    const result =
      await apiRequest(
        "/api/pay",
        {
          amount
        }
      );


    if (!result.success) {
      throw new Error(
        result.message ||
        "Deposit gagal."
      );
    }


    const data =
      result.data ||
      result;


    const qr =
      data.qr_image
        ? `
          <img
            class="qr"
            src="${escapeHTML(
              data.qr_image
            )}"
            alt="QRIS"
          >
        `
        : "";


    $("#depositResult")
      .innerHTML = `

        <strong>
          QRIS Berhasil Dibuat
        </strong>

        ${qr}

        Total bayar:
        <strong>
          ${rupiah(
            data.total_bayar
          )}
        </strong>

        <br>

        Invoice:
        <strong>
          ${escapeHTML(
            data.invoice
          )}
        </strong>

        <button
          class="btn btn-secondary full"
          style="margin-top:12px"
          onclick="
            checkDeposit(
              '${escapeHTML(
                data.invoice
              )}'
            )
          "
        >
          Cek Pembayaran
        </button>

      `;


  } catch (error) {

    $("#depositResult")
      .innerHTML = `

        <span
          style="
            color:#ff7084;
          "
        >
          ${escapeHTML(
            error.message
          )}
        </span>

      `;
  }
}


window.checkDeposit = async function(invoice) {

  try {

    const result =
      await apiRequest(
        "/api/pay-status",
        {
          invoice
        }
      );


    if (!result.success) {
      throw new Error(
        result.message ||
        "Gagal mengecek deposit."
      );
    }


    const data =
      result.data ||
      result;


    showToast(
      `Status deposit: ${String(
        data.status ||
        "unknown"
      ).toUpperCase()}`
    );


    if (
      String(data.status)
        .toLowerCase() ===
      "pending"
    ) {

      $("#depositResult")
        .insertAdjacentHTML(
          "beforeend",
          `
            <div
              style="
                margin-top:10px;
                color:#8994a8;
              "
            >
              Pembayaran masih pending.
              Silakan cek kembali setelah
              melakukan pembayaran.
            </div>
          `
        );

    }

  } catch (error) {

    showToast(
      error.message
    );
  }
};


$("#searchInput")
  .addEventListener(
    "input",
    renderProducts
  );


$("#filterSelect")
  .addEventListener(
    "change",
    renderProducts
  );


$("#refreshBtn")
  .addEventListener(
    "click",
    loadProducts
  );


$("#statusButton")
  .addEventListener(
    "click",
    checkOrderStatus
  );


$("#depositButton")
  .addEventListener(
    "click",
    createDeposit
  );


document
  .querySelectorAll(
    "[data-amount]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        $("#depositAmount")
          .value =
          button.dataset.amount;

      }
    );

  });


document
  .querySelectorAll(
    "[data-close]"
  )
  .forEach(element => {

    element.addEventListener(
      "click",
      () => {

        $("#orderModal")
          .classList
          .add("hidden");

      }
    );

  });


loadProducts();