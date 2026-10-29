from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        # Bypass splash screen
        page.goto("http://localhost:3000")
        page.evaluate("""() => {
            sessionStorage.setItem('rf-splash-seen', '1');
            localStorage.setItem('rf-splash-seen', '1');
        }""")

        # Add cart item and visit checkout
        page.evaluate("""() => {
            sessionStorage.setItem('rf-splash-seen', '1');
            const cartItem = {
                id: 'classic-white-cotton-kaftan|Top only|White|M',
                productId: 'classic-white-cotton-kaftan',
                slug: 'classic-white-cotton-kaftan',
                name: 'Classic White Cotton Kaftan',
                image: '/products/classic-white-cotton-kaftan.webp',
                type: 'Top only',
                color: 'White',
                size: 'M',
                price: 38000,
                quantity: 1,
                sellerId: 'platform',
                sellerName: 'Rebel Fashion'
            };
            localStorage.setItem('storefront-cart-v2', JSON.stringify([cartItem]));
        }""")

        page.goto("http://localhost:3000/checkout")
        page.wait_for_selector("text=FairSurePay", timeout=10000)

        # Scroll to Payment Method section
        payment_section = page.locator("text=Payment method")
        payment_section.scroll_into_view_if_needed()
        page.screenshot(path="/home/jules/verification/checkout_fairsurepay_scrolled.png")
        print("Scrolled payment screenshot saved.")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
