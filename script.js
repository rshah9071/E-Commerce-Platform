document.addEventListener('DOMContentLoaded', () => {
    // Select elements from the DOM on all pages
    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
    const cartCountElement = document.querySelector('.cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const clearCartButton = document.getElementById('clear-cart-button');
    const checkoutButton = document.getElementById('checkout-button');
    const productDetailContainer = document.getElementById('product-detail');

    // Checkout page specific elements
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutTotalPriceElement = document.getElementById('checkout-total-price');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutMessage = document.getElementById('checkout-message');

    // Load cart from local storage or initialize an empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Function to update the cart count in the header
    function updateCartCount() {
        if (cartCountElement) {
            cartCountElement.innerText = cart.length;
        }
    }

    // Display items on the cart page
    function displayCartItems() {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            if (cartTotalElement) {
                cartTotalElement.innerText = '0';
            }
            return;
        }

        cart.forEach((item, index) => {
            const itemElement = document.createElement('li');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span>${item.name} - Rs.${item.price}</span>
                <button class="remove-from-cart-button" data-index="${index}">Remove</button>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price;
        });

        if (cartTotalElement) {
            cartTotalElement.innerText = total;
        }
    }

    // Display items on the checkout summary
    function displayCheckoutSummary() {
        if (!checkoutItemsContainer) return;

        checkoutItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const itemElement = document.createElement('li');
            itemElement.innerHTML = `
                <span>${item.name}</span>
                <span>Rs.${item.price}</span>
            `;
            checkoutItemsContainer.appendChild(itemElement);
            total += item.price;
        });

        if (checkoutTotalPriceElement) {
            checkoutTotalPriceElement.innerText = total;
        }
    }

    // Function to clear the cart
    function clearCart() {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayCartItems();
    }

    // Add event listener to "Add to Cart" buttons
    if (addToCartButtons) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const productCard = event.target.closest('.product-card') || document.querySelector('.product-detail-card');
                
                const productName = productCard.querySelector('h3 a, h1').innerText;
                const priceText = productCard.querySelector('.price').innerText;
                const productPrice = parseInt(priceText.replace('Rs.', '').replace(',', '').trim());
                
                const product = {
                    name: productName,
                    price: productPrice
                };
                cart.push(product);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                alert(`${productName} has been added to your cart!`);
            });
        });
    }

    // Add event listener for "Remove" buttons inside the cart
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-from-cart-button')) {
                const indexToRemove = parseInt(event.target.getAttribute('data-index'));
                cart.splice(indexToRemove, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                displayCartItems();
            }
        });
    }
    
    // Add event listener for "Clear Cart" button
    if (clearCartButton) {
        clearCartButton.addEventListener('click', clearCart);
    }
    
    // Add event listener for the "Checkout" button
    if (checkoutButton) {
        checkoutButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = 'checkout.html';
        });
    }

    // Handle checkout form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const customerName = document.getElementById('name').value;
            const customerEmail = document.getElementById('email').value;
            const customerAddress = document.getElementById('address').value;
            const customerCity = document.getElementById('city').value;
            const customerZip = document.getElementById('zip').value;
            const total = cart.reduce((sum, item) => sum + item.price, 0);

            // Create CSV content for download (invisible to customer)
            const orderDate = new Date().toISOString().slice(0, 10);
            let csvContent = "Order Date,Customer Name,Customer Email,Product,Price\n";
            cart.forEach(item => {
                csvContent += `${orderDate},"${customerName}","${customerEmail}","${item.name}",${item.price}\n`;
            });
            csvContent += `, , ,Total,${total}\n`;

            // Create a downloadable file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `order_${Date.now()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Display success message and clear the cart
            checkoutForm.style.display = 'none';
            checkoutMessage.style.display = 'block';
            clearCart();
        });
    }

    // Handle product detail page
    if (productDetailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const name = urlParams.get('name');
        const price = urlParams.get('price');
        const image = urlParams.get('image');

        if (name && price && image) {
            productDetailContainer.innerHTML = `
                <div class="product-detail-card">
                    <img src="images/${image}" alt="${name}">
                    <div class="product-info">
                        <h1>${name.replace(/-/g, ' ')}</h1>
                        <p class="price">Rs.${price}</p>
                        <p class="description">This is a placeholder description for the ${name.replace(/-/g, ' ')}.</p>
                        <button class="add-to-cart-button">Add to Cart</button>
                    </div>
                </div>
            `;
        }
    }

    // Initial calls to update the UI
    updateCartCount();
    displayCartItems();
    displayCheckoutSummary();
});