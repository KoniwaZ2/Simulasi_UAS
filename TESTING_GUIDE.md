# Testing the Seller Dashboard

## Prerequisites

1. Backend server running on `http://localhost:8000`
2. Frontend server running (typically `http://localhost:3000`)
3. Database initialized with migrations

## How to Test

### Step 1: Register as a Seller

1. Open the app in browser
2. Click "Register here"
3. Fill in the registration form:
   - Username: any username
   - Email: any valid email
   - First Name: Your name
   - Last Name: Your surname
   - Phone: Valid phone number (10-15 digits)
   - **Role: Select "Seller"**
4. Click Register
5. You'll be redirected to login

### Step 2: Login as Seller

1. Go back to login form (if not there already)
2. Enter your registered email and password
3. Click Login
4. You should see the **Seller Dashboard** with:
   - Welcome message showing your name
   - "Seller Dashboard" title
   - "Add New Product" button
   - Empty state message (if no products yet)

### Step 3: Add a Product

1. Click "Add New Product" button
2. A modal form will appear with fields:
   - Product Name \*
   - Description \*
   - Price ($) \*
   - Stock \*
3. Fill in all required fields, for example:
   - Product Name: `Laptop`
   - Description: `High-performance laptop with 16GB RAM`
   - Price: `999.99`
   - Stock: `5`
4. Click "Add Product" button
5. You should see:
   - Success message
   - Form closes
   - Product appears in the grid
   - Modal closes automatically

### Step 4: View Your Products

The seller dashboard displays all your products in a grid with:

- Product name
- Description (truncated)
- Price (formatted with $)
- Stock count (green if in stock, red if out)
- Creation date
- Edit button
- Delete button

### Step 5: Edit a Product

1. Click "Edit" button on any product card
2. Modal opens with current product data pre-filled
3. Modify any field, for example:
   - Change Price to `899.99`
   - Change Stock to `8`
4. Click "Update Product"
5. You should see:
   - Success message
   - Product list refreshes
   - Changes are reflected in the card

### Step 6: Delete a Product

1. Click "Delete" button on any product card
2. A confirmation dialog appears: "Are you sure you want to delete this product?"
3. Click "OK" to confirm or "Cancel" to abort
4. If confirmed:
   - Success message appears
   - Product is removed from the list
   - List refreshes

### Step 7: Test as Buyer

1. Open a new browser tab (or logout and register a new user)
2. Register/Login as a **Buyer**
3. You should see the **Buyer Page** with:
   - All products from all sellers (including your products)
   - Search functionality
   - Stock display
   - "Add to Cart" button

## Validation Tests

### Form Validation

Try submitting the form with invalid data:

1. **Empty Product Name**:

   - Leave "Product Name" empty
   - Try to submit → Error: "Product name is required"

2. **Empty Description**:

   - Leave "Description" empty
   - Try to submit → Error: "Description is required"

3. **Invalid Price**:

   - Enter price as `0` or negative
   - Try to submit → Error: "Price must be greater than 0"

4. **Negative Stock**:
   - Enter stock as `-5`
   - Try to submit → Error: "Stock cannot be negative"

## API Error Handling

Test error scenarios:

1. **Network Error**:

   - Turn off backend server
   - Try to add/edit/delete product
   - Should show error message: "An error occurred. Please try again."

2. **Authentication Error**:
   - Clear localStorage (DevTools)
   - Try to add product
   - Should show "Please log in to access the seller dashboard"

## Performance Testing

1. Add multiple products (10+)
2. Check that:

   - Page still responsive
   - Grid renders properly
   - Edit/Delete operations still work

3. Search products (as buyer):
   - Type in search box
   - Verify filtering works correctly
   - Check no lag in search

## Browser Compatibility

- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Limitations

- Images not yet implemented (placeholder icons shown for buyers)
- Cart integration requires backend cart endpoints
- Bulk operations (delete multiple products) not implemented

## Troubleshooting

### Products not loading

- Check backend is running on port 8000
- Verify API endpoint: `http://localhost:8000/api/products/`
- Check browser console for network errors

### Login doesn't work

- Verify user was registered as seller
- Check email is correct
- Clear localStorage if session issues

### Add Product button doesn't work

- Ensure you're logged in
- Check access_token in localStorage
- Verify seller role in user_data

### Seller ID not found

- Make sure login response includes `id` field
- Check users/serializers.py includes `id` in CustomTokenObtainPairSerializer

## Next Steps

- Add product images upload
- Implement sales history tracking
- Add bulk product operations
- Implement inventory alerts
- Add product analytics dashboard
