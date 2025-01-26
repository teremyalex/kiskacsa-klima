interface Cart {
    id: number
    name: string
    price: number
    qty: number
    image: string
    szerelesiCsomag:number[],
    szerelesiPrice:number
}
let cart:Cart[] = [];
let total = 0;

function addToCart(index:number, id:number, name:string, price:number, qty:number, image:string) {
    let inputs = Array.from(document.querySelectorAll<HTMLInputElement>('#termek' + index + '-szereles-mennyiseg input'))
    let szerelesiCsomag:number[] = []
    inputs.forEach(input => {
        szerelesiCsomag.push(Number(input.value))
    })
    let szerelesiPrice = Number(document.getElementById('szereles' + index + '-ar')?.dataset.total)
    cart.push({ id, name, price, qty, image, szerelesiCsomag, szerelesiPrice });
    updateCartDisplay();
    cartPopup();
}



function updateCartDisplay() {
    const cartItemsContainer = document.getElementById("kosarTermekek") as HTMLElement
    cartItemsContainer.innerHTML = cart.length == 0 ? `<div class="emptyCart"><img src="img/cart.svg"><br>A kosár üres!</div>`: ""
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
                        : ''
            }
            <button class="x-button" type="button" onclick="removeFromCart(${index})"><img src="img/circle-xmark-solid.svg"></button>
        `;
        cartItemsContainer.appendChild(newDiv);
    });
    updateTotalAmount();
}

function changeQty(index:number, change:number){
    let input = document.getElementById('termek' + index + '-qty') as HTMLInputElement
    let termekQty:number = Number(input.value)
    if (termekQty + change > 0 && termekQty + change < 6) termekQty += change;
    input.value = termekQty.toString();

    let szerelesContainer = document.getElementById("termek" + index + "-szereles-mennyiseg") as HTMLElement
    szerelesContainer.innerHTML = ""
    for(let i=0; i<termekQty; i++){
        const newDiv = document.createElement("div");
        newDiv.classList.add("szereles-qty");
        newDiv.innerHTML = `
        <div class="szereles-qty-title">${i+1}. Beltéri egység távolsága</div>
        <div class="szereles-qty-input">
            <button class="minus-btn" type="button" onclick="szerelesQty(${index}, ${i}, -1)">-</button>
            <input id="termek${index}-szereles${i}-qty" type="text" value="0" class="quantity-input" readonly>
            <button class="plus-btn" type="button" onclick="szerelesQty(${index}, ${i}, 1)">+</button>
        </div>
    `;
        szerelesContainer.appendChild(newDiv);
    }
    szerelesTotal(index)
}

function szerelesQty(termekIndex:number, index:number, change:number) {
    let input = document.getElementById('termek' + termekIndex + '-szereles' + index + '-qty') as HTMLInputElement
    let szerelesQty: number = Number(input.value)
    if (szerelesQty + change > -1) szerelesQty += change
    input.value = szerelesQty.toString()
    szerelesTotal(termekIndex)
}

function szerelesTotal(termekIndex:number){
    let inputs = Array.from(document.querySelectorAll<HTMLInputElement>('#termek' + termekIndex + '-szereles-mennyiseg .szereles-qty input'))
    let totalQty:number = inputs.reduce((sum:number, input:HTMLInputElement)=> sum + Number(input.value), 0);
    document.getElementById('szereles' + termekIndex + '-ar')!.dataset.total = String(totalQty * (termekIndex == 2 ? 7000 : 5000))
    document.querySelector(`#szereles${termekIndex}-ar span`)!.innerHTML = new Intl.NumberFormat('hu-HU', {useGrouping: true}).format(totalQty * (termekIndex == 2 ? 7000 : 5000))
    console.log(document.querySelector(`#szereles${termekIndex}-ar span`)!)
}

function removeFromCart(index:number) {
    document.getElementById('kosarTermekek')!.children[index].classList.add('remove');
    let height = document.getElementById('kosarTermekek')!.children[index].clientHeight + 50;
    setTimeout(() => {
        for (let i = index+1; i < cart.length; i++) {
            (document.getElementById('kosarTermekek')!.children[i] as HTMLElement).style.transform = 'translateY(-' + height + 'px)';
        }
    }, 200)
    setTimeout(() => {
        cart.splice(index, 1);
        updateCartDisplay();
    }, 500)
}

let totalCount = 0;
function updateTotalAmount() {
    const totalAmountElement = document.getElementById("totalAmount") as HTMLElement;
    const shippingPrice = document.querySelector<HTMLInputElement>('input[name="radio-shipping"]:checked')
    const paymentPrice = document.querySelector<HTMLInputElement>('input[name="radio-payment"]:checked')
    total = cart.reduce((sum, item) => sum + item.price * item.qty + (item.szerelesiPrice ? item.szerelesiPrice : 0), 0);
    total += Number(shippingPrice?.dataset.price || 0) + Number(paymentPrice?.dataset.price || 0)
    if(totalCount != total) {
        totalCount = 0;
        let intervalId = setInterval(() => {
            totalCount += total / 30;
            totalAmountElement.textContent = `${new Intl.NumberFormat('hu-HU', {useGrouping: true}).format(Math.round(totalCount))} Ft`;
            if (totalCount >= total) {
                clearInterval(intervalId);
                totalCount = total;
                totalAmountElement.textContent = total > 0 ? `${new Intl.NumberFormat('hu-HU', {useGrouping: true}).format(total)} Ft` : ""
            }
        }, 10)
    }
    console.log(total);
}

function cartPopup() {
    document.getElementById('succes-cart')!.classList.add('active');
    setTimeout(function () {
        document.getElementById('succes-cart')!.classList.remove('active');
    }, 3000);
}

function alertPopup(message:string) {
    document.getElementById('alert-cart')!.innerHTML = message;
    document.getElementById('alert-cart')!.classList.add('active');
    setTimeout(function () {
        document.getElementById('alert-cart')!.classList.remove('active');
    }, 3000);
}


let sendable = true
function postData(){
    if(!sendable) return;
    sendable = false

    if (cart.length === 0) {
        alertPopup('A kosár üres!');
        return;
    }

    for (let i = 0; i < document.querySelectorAll<HTMLInputElement>('#theForm input').length; i++) {
        if (!document.querySelectorAll<HTMLInputElement>('#theForm input')[i].reportValidity()) return
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


    let product_ids:number[] = [];
    let product_qtys:number[] = [];

    cart.forEach(item => {
        product_ids.push(item.id);
        product_qtys.push(item.qty);
        item.szerelesiCsomag.forEach(csomag=>{
            product_ids.push(item.id == 281 ? 284 : 282);
            product_qtys.push(csomag);
        })
    });
    product_ids.push(283);
    product_qtys.push(1);

    /*if (document.querySelector('input[name="radio-payment"]:checked').value === '1') {
        product_ids.push(244);
        product_qtys.push(1);
    }*/


    async function sendData() {
        let adat =
            {
                name: (document.getElementById("name") as HTMLInputElement).value || "",
                email: (document.getElementById("email") as HTMLInputElement).value || "",
                phone: (document.getElementById("phone") as HTMLInputElement).value || "",
                billing_zip: (document.getElementById("billing_zip") as HTMLInputElement).value || "",
                billing_city: (document.getElementById("billing_city") as HTMLInputElement).value || "",
                billing_address: (document.getElementById("billing_address") as HTMLInputElement).value || "",
                shipping_zip: (document.getElementById("shipping_zip") as HTMLInputElement).value || "",
                shipping_city: (document.getElementById("shipping_city") as HTMLInputElement).value || "",
                shipping_address: (document.getElementById("shipping_address") as HTMLInputElement).value || "",
                payment_method_id: (document.querySelector('input[name="radio-payment"]:checked') as HTMLInputElement).value || "",
                product_id: product_ids,
                product_qty: product_qtys,
                comment: (document.getElementById('message') as HTMLInputElement).value || "",
                data:
                    {
                        foxpost_automata: (document.getElementById('foxpostData') as HTMLInputElement).value || "",
                    },
                //success_return_url: 'https://rachelcare.hu/koszonjuk.html'
            };

        try {
            let response = await fetch('https://epikforge.space/api/site/3056ec36-13b3-4407-9ca7-76c7f0cb0197/order/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(adat)
            });

            if (!response.ok) {
                throw new Error('Hálózati hiba történt: ' + response.status);
            }

            let data = await response.json(); // Válasz feldolgozása JSON-ként
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
            if(data.success){
                document.getElementById('form')!.style.opacity = '0';
                setTimeout(()=>{
                    while (document.getElementById('form')!.firstChild) {
                        document.getElementById('form')!.removeChild(document.getElementById('form')!.firstChild!);
                    }
                    document.getElementById('form')!.innerHTML = `
                            <h3>Sikeres rendelés!</h3>
                            <button class="rendeles-gomb" type="button" onclick="location.reload();">Új rendelés leadása</button>
                        `;
                    document.getElementById('form')!.style.height = '500px';
                    document.getElementById('form')!.style.opacity = '1';
                }, 500)
            }

        } catch (error) {
            console.error('Hiba:', (error as Error).message);
        }
        sendable = true
    }

    sendData();
}

function myFunction() {
    if ((document.getElementById("myCheck") as HTMLInputElement).checked) document.getElementById("text")!.style.display = "block"
    else document.getElementById("text")!.style.display = "none"
}


//Foxpost
function receiveMessage(event: MessageEvent) {
    if (event.origin !== 'https://cdn.foxpost.hu') { return; }
    try {
        var apt = JSON.parse(event.data);
        (document.getElementById('foxpostData') as HTMLInputElement).value = apt.operator_id;
    } catch (error) {
        console.error('Hibás üzenet formátum:', error);
    }
}

window.addEventListener('message', receiveMessage, false);

document.querySelectorAll<HTMLInputElement>('input[name="radio-shipping"]').forEach(input=> {
    input.addEventListener('change', ()=> {
        if (input.value === 'FOXPOST') {
            document.getElementById('foxpost')!.style.display = 'block';
        } else {
            document.getElementById('foxpost')!.style.display = 'none';
            (document.getElementById('foxpostData') as HTMLInputElement).value = '';
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