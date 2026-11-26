# Toolshop – Cart requirements (the oracle)

Site: https://practicesoftwaretesting.com
These requirements are the source of truth. If the app disagrees with them, it is a BUG, not a test to change.

## R1 – Product details
Clicking a product on the home page opens its page with name, price and an "Add to cart" button.

## R2 – Add to cart
Clicking "Add to cart" adds the product to the cart, and the cart badge in the header increases by the quantity added.

## R3 – Quantity
On the product page the quantity can be changed before adding. Quantity cannot be less than 1.

## R4 – Cart contents
The cart page lists each product with its name, quantity, unit price and line total (unit price × quantity).

## R5 – Cart total
The cart total equals the sum of all line totals.

## R6 – Remove item
Removing a product from the cart removes its line and updates the total and the badge.

## R7 – Empty cart
When the cart is empty, the cart page shows that it is empty, with no total to pay.

