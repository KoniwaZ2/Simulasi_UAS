import React from "react";
import 

function CartDetails({ cartItems }) {
  return (
    <div className="cart-details">
      <h2>Cart Details</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cartItems.map((item, index) => (
            <li key={index}>
              {item.name} - Quantity: {item.quantity} - Price: ${item.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CartDetails;
