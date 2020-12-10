//create variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cartbtn');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-item');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
// console.log(btns)
// create cart array

let cart  = [];
let buttonsDOM  =[];

//getting the product

class Products{
    async getProducts(){
        try {
            let result = await fetch ('products.json');
            let data = await result.json();
            
            let products =data.items;
            products = products.map(items=>{
                const {title,price} = items.fields;
                const {id} = items.sys;
                const image = items.fields.image.fields.file.url;
                return {title, price, id, image}
            })

            return products;
        } catch (error) {
            console.log(error)
        }
    }
};

//display product
class UI{
    displayProducts(products){
        // console.log(products);
        let result = '';
        products.forEach(product=>{
            result += `
            <article class="product">
            <div class="img-container">
                <img src=${product.image}  alt="" class="product-img" >
                <button class="bag-btn" data-id=${product.id}><i class="fas fa-shopping-cart"></i>Add to Bg</button>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </div>
            
        </article>
            
            
            `
        });
        productsDOM.innerHTML = result;


    }
    getBagButtons(){
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach(button=>{
            let id = button.dataset.id;
            let inCart = cart.find(item =>item.id === id);
            if(inCart){
                button.innerText = "In Cart";
                button.disabled = true;
            }
            
                button.addEventListener('click', (event)=>{
                    event.target.innerText= "In Cart";
                    event.target.disabled= true;
                    //get product form localStorage
                    let cartItems = {...Storage.getProduct( id), amount:1};

                    //add product to the cart
                    cart =[...cart, cartItems];
                    // console.log(cart);
                    //save cart in local storage
                    Storage.saveCart(cart);
                    //set cart values
                    this.setCartValues(cart);

                    //display cart item

                    this.addCartItem(cartItems);
                    //show the cart
                    this.showCart()
                })
            
        })

    }

    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;itemsTotal += item.amount
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemsTotal;

        // console.log(cartTotal, cartItems);
    }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('carts-item');
        div.innerHTML =` <img src=${item.image} alt="">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>
                remove item
            </span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
        cartContent.appendChild(div)
        // console.log(cartContent);
        
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDom.classList.add('showCart');


    }

    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart)
    }

    populateCart(cart){
        cart.forEach(item=>this.addCartItem(item))

    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDom.classList.remove('showCart');
    }

    cartLogic(){
       clearCartBtn.addEventListener('click', ()=>{
           this.clearCart();
       });

       cartContent.addEventListener('click', event =>{
            // console.log(event.target);
            if (event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                console.log(removeItem);
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if (event.target.classList.contains('fa-chevron-down')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item=>item.id === id);
                tempItem.amount = tempItem.amount-1;
                if(tempItem.amount>0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText= tempItem.amount;
                }else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement)
                    this.removeItem(id);
                }
            }
       })
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children);
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();

    }

    removeItem(id){
        cart = cart.filter(item => item.id !==id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled =false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`

    }
    getSingleButton(id)
{
    return buttonsDOM.find(button => button.dataset.id === id);
}   
    
};

//local storage

class Storage{
    static saveProducts(products){
        localStorage.setItem('products', JSON.stringify(products));
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id ===id);
    }
    static saveCart(){
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    const ui = new UI();
    const products = new Products();

    // setup application
    ui.setupAPP();

    //get product
    products.getProducts().then(products=>{ui.displayProducts(products);
        Storage.saveProducts(products);
    

    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    });
})