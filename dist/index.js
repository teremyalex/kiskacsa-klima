"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let cart = [];
let total = 0;
function addToCart(index, id, name, price, qty, image) {
    var _a;
    let inputs = Array.from(document.querySelectorAll('#termek' + index + '-szereles-mennyiseg input'));
    let szerelesiCsomag = [];
    inputs.forEach(input => {
        szerelesiCsomag.push(Number(input.value));
    });
    let szerelesiPrice = Number((_a = document.getElementById('szereles' + index + '-ar')) === null || _a === void 0 ? void 0 : _a.dataset.total);
    cart.push({ id, name, price, qty, image, szerelesiCsomag, szerelesiPrice });
    updateCartDisplay();
    cartPopup();
}
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById("kosarTermekek");
    cartItemsContainer.innerHTML = cart.length == 0 ? `<div class="emptyCart"><img src="img/cart.svg"><br>A kosár üres!</div>` : "";
    cart.forEach((item, index) => {
        const newDiv = document.createElement("div");
        newDiv.classList.add("kosar-termek");
        newDiv.innerHTML = `
            <div class="kosar-termekkep"><img src="img/${item.image}"></div>
            <div class="kosar-termeknev">${item.name}</div>
            <div class="kosar-termekar">${item.qty} db, ${new Intl.NumberFormat('hu-HU', { useGrouping: true }).format(item.price * item.qty)} Ft</div>
            ${item.szerelesiCsomag && item.szerelesiCsomag.length > 0
            ? `<div class="kosar-szereles-csomag">Szerelési csomag: ${item.szerelesiCsomag.map((csomag) => `<span>${csomag} méter</span>`).join(', ')}</div>
                            <div class="kosar-szerelesi-price">${new Intl.NumberFormat('hu-HU', { useGrouping: true }).format(item.szerelesiPrice)} Ft</div>`
            : ''}
            <button class="x-button" type="button" onclick="removeFromCart(${index})"><img src="img/circle-xmark-solid.svg"></button>
        `;
        cartItemsContainer.appendChild(newDiv);
    });
    updateTotalAmount();
}
function changeQty(index, change) {
    let input = document.getElementById('termek' + index + '-qty');
    let termekQty = Number(input.value);
    if (termekQty + change > 0 && termekQty + change < 6)
        termekQty += change;
    input.value = termekQty.toString();
    let szerelesContainer = document.getElementById("termek" + index + "-szereles-mennyiseg");
    szerelesContainer.innerHTML = "";
    for (let i = 0; i < termekQty; i++) {
        const newDiv = document.createElement("div");
        newDiv.classList.add("szereles-qty");
        newDiv.innerHTML = `
        <div class="szereles-qty-title">${i + 1}. Beltéri egység távolsága</div>
        <div class="szereles-qty-input">
            <button class="minus-btn" type="button" onclick="szerelesQty(${index}, ${i}, -1)">-</button>
            <input id="termek${index}-szereles${i}-qty" type="text" value="0" class="quantity-input" readonly>
            <button class="plus-btn" type="button" onclick="szerelesQty(${index}, ${i}, 1)">+</button>
        </div>
    `;
        szerelesContainer.appendChild(newDiv);
    }
    szerelesTotal(index);
}
function szerelesQty(termekIndex, index, change) {
    let input = document.getElementById('termek' + termekIndex + '-szereles' + index + '-qty');
    let szerelesQty = Number(input.value);
    if (szerelesQty + change > -1)
        szerelesQty += change;
    input.value = szerelesQty.toString();
    szerelesTotal(termekIndex);
}
function szerelesTotal(termekIndex) {
    let inputs = Array.from(document.querySelectorAll('#termek' + termekIndex + '-szereles-mennyiseg .szereles-qty input'));
    let totalQty = inputs.reduce((sum, input) => sum + Number(input.value), 0);
    document.getElementById('szereles' + termekIndex + '-ar').dataset.total = String(totalQty * (termekIndex == 2 ? 7000 : 5000));
    document.querySelector(`#szereles${termekIndex}-ar span`).innerHTML = new Intl.NumberFormat('hu-HU', { useGrouping: true }).format(totalQty * (termekIndex == 2 ? 7000 : 5000));
    console.log(document.querySelector(`#szereles${termekIndex}-ar span`));
}
function removeFromCart(index) {
    document.getElementById('kosarTermekek').children[index].classList.add('remove');
    let height = document.getElementById('kosarTermekek').children[index].clientHeight + 50;
    setTimeout(() => {
        for (let i = index + 1; i < cart.length; i++) {
            document.getElementById('kosarTermekek').children[i].style.transform = 'translateY(-' + height + 'px)';
        }
    }, 200);
    setTimeout(() => {
        cart.splice(index, 1);
        updateCartDisplay();
    }, 500);
}
let totalCount = 0;
function updateTotalAmount() {
    const totalAmountElement = document.getElementById("totalAmount");
    const shippingPrice = document.querySelector('input[name="radio-shipping"]:checked');
    const paymentPrice = document.querySelector('input[name="radio-payment"]:checked');
    total = cart.reduce((sum, item) => sum + item.price * item.qty + (item.szerelesiPrice ? item.szerelesiPrice : 0), 0);
    total += Number((shippingPrice === null || shippingPrice === void 0 ? void 0 : shippingPrice.dataset.price) || 0) + Number((paymentPrice === null || paymentPrice === void 0 ? void 0 : paymentPrice.dataset.price) || 0);
    if (totalCount != total) {
        totalCount = 0;
        let intervalId = setInterval(() => {
            totalCount += total / 30;
            totalAmountElement.textContent = `${new Intl.NumberFormat('hu-HU', { useGrouping: true }).format(Math.round(totalCount))} Ft`;
            if (totalCount >= total) {
                clearInterval(intervalId);
                totalCount = total;
                totalAmountElement.textContent = total > 0 ? `${new Intl.NumberFormat('hu-HU', { useGrouping: true }).format(total)} Ft` : "";
            }
        }, 10);
    }
    console.log(total);
}
function cartPopup() {
    document.getElementById('succes-cart').classList.add('active');
    setTimeout(function () {
        document.getElementById('succes-cart').classList.remove('active');
    }, 3000);
}
function alertPopup(message) {
    document.getElementById('alert-cart').innerHTML = message;
    document.getElementById('alert-cart').classList.add('active');
    setTimeout(function () {
        document.getElementById('alert-cart').classList.remove('active');
    }, 3000);
}
let sendable = true;
function postData() {
    if (!sendable)
        return;
    sendable = false;
    if (cart.length === 0) {
        alertPopup('A kosár üres!');
        return;
    }
    for (let i = 0; i < document.querySelectorAll('#theForm input').length; i++) {
        if (!document.querySelectorAll('#theForm input')[i].reportValidity())
            return;
    }
    if (!document.querySelector('input[name="radio-payment"]:checked')) {
        alertPopup('Kérlek válassz a fizetési módok közül!');
        return;
    }
    /*if (!document.querySelector('input[name="radio-shipping"]:checked')) {
        alertPopup('Kérlek válassz a szállítási módok közül!');
        return;
    }
    if (document.querySelector('input[name="radio-shipping"]:checked').value === 'FOXPOST' && document.getElementById('foxpostData').value === '') {
        alertPopup('Kérlek válassz ki egy automatát a listából!');
        return;
    }*/
    let product_ids = [];
    let product_qtys = [];
    cart.forEach(item => {
        product_ids.push(item.id);
        product_qtys.push(item.qty);
        item.szerelesiCsomag.forEach(csomag => {
            product_ids.push(item.id == 281 ? 284 : 282);
            product_qtys.push(csomag);
        });
    });
    product_ids.push(283);
    product_qtys.push(1);
    /*if (document.querySelector('input[name="radio-payment"]:checked').value === '1') {
        product_ids.push(244);
        product_qtys.push(1);
    }*/
    function sendData() {
        return __awaiter(this, void 0, void 0, function* () {
            let adat = {
                name: document.getElementById("name").value || "",
                email: document.getElementById("email").value || "",
                phone: document.getElementById("phone").value || "",
                billing_zip: document.getElementById("billing_zip").value || "",
                billing_city: document.getElementById("billing_city").value || "",
                billing_address: document.getElementById("billing_address").value || "",
                shipping_zip: document.getElementById("shipping_zip").value || "",
                shipping_city: document.getElementById("shipping_city").value || "",
                shipping_address: document.getElementById("shipping_address").value || "",
                payment_method_id: document.querySelector('input[name="radio-payment"]:checked').value || "",
                product_id: product_ids,
                product_qty: product_qtys,
                comment: document.getElementById('message').value || "",
                data: {
                    foxpost_automata: document.getElementById('foxpostData').value || "",
                },
                //success_return_url: 'https://rachelcare.hu/koszonjuk.html'
            };
            try {
                let response = yield fetch('https://epikforge.space/api/site/3056ec36-13b3-4407-9ca7-76c7f0cb0197/order/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(adat)
                });
                if (!response.ok) {
                    throw new Error('Hálózati hiba történt: ' + response.status);
                }
                let data = yield response.json(); // Válasz feldolgozása JSON-ként
                console.log('Sikeres válasz:', data);
                // @ts-ignore
                fbq('track', 'Purchase', {
                    value: total,
                    currency: 'HUF',
                });
                if (data.redirect && typeof data.redirect === 'string') {
                    window.location = data.redirect;
                }
                //Sikeres rendelés
                if (data.success) {
                    document.getElementById('form').style.opacity = '0';
                    setTimeout(() => {
                        while (document.getElementById('form').firstChild) {
                            document.getElementById('form').removeChild(document.getElementById('form').firstChild);
                        }
                        document.getElementById('form').innerHTML = `
                            <h3>Sikeres rendelés!</h3>
                            <button class="rendeles-gomb" type="button" onclick="location.reload();">Új rendelés leadása</button>
                        `;
                        document.getElementById('form').style.height = '500px';
                        document.getElementById('form').style.opacity = '1';
                    }, 500);
                }
            }
            catch (error) {
                console.error('Hiba:', error.message);
            }
            sendable = true;
        });
    }
    sendData();
}
function myFunction() {
    if (document.getElementById("myCheck").checked)
        document.getElementById("text").style.display = "block";
    else
        document.getElementById("text").style.display = "none";
}
//Foxpost
function receiveMessage(event) {
    if (event.origin !== 'https://cdn.foxpost.hu') {
        return;
    }
    try {
        var apt = JSON.parse(event.data);
        document.getElementById('foxpostData').value = apt.operator_id;
    }
    catch (error) {
        console.error('Hibás üzenet formátum:', error);
    }
}
window.addEventListener('message', receiveMessage, false);
document.querySelectorAll('input[name="radio-shipping"]').forEach(input => {
    input.addEventListener('change', () => {
        if (input.value === 'FOXPOST') {
            document.getElementById('foxpost').style.display = 'block';
        }
        else {
            document.getElementById('foxpost').style.display = 'none';
            document.getElementById('foxpostData').value = '';
        }
    });
});
//ANIMATIONS
/*
const anim = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add("visible")
            }, 150*index)

        }
    })
})
anim.observe(document.querySelector('.termek-hero')!)
anim.observe(document.querySelector('.biztonsag h3')!)
anim.observe(document.querySelector('.garancia h3')!)
document.querySelectorAll('.velemenyek > div > div').forEach(entry => anim.observe(entry))
document.querySelectorAll('.termek').forEach(entry => anim.observe(entry))
*/ 
