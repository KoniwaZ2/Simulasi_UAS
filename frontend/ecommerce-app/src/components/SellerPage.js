import React from "react";

function SellerPage() {
  return (
    <div className="seller-page">
      <h1>Seller Dashboard</h1>
      <div className="seller-actions">
        <button onClick={() => (window.location.href = "/product-form")}>
          Upload Produk Baru
        </button>
        <button onClick={() => (window.location.href = "/sales-history")}>
          Lihat Riwayat Penjualan
        </button>
      </div>
    </div>
  );
}

export default SellerPage;
