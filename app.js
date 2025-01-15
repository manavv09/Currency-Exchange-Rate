const BASE_URL = "https://api.currencyapi.com/v3/latest?apikey=cur_live_SCrm0xVMKHhWeBSWBCVMvOwhh3kLF8YTBxSdbPtW&base_currency=";

const dropdown = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");


document.addEventListener("load", () =>{
    updateExchangeRate();
});

for(let select of dropdown) {
    for (currCode in countryList) {
        let newOption =document.createElement("option");
        newOption.innerText = currCode;
        newOption.value = currCode;
        if(select.name === "from" && currCode === "USD") {
            newOption.selected = "selected";
        } else if(select.name === "to" && currCode === "INR") {
            newOption.selected = "selected";
        }
        select.append(newOption);
    }
    select.addEventListener("change", (evt)=> {
        updateFlag(evt.target);
    })
}

const updateExchangeRate = async ()=> {
    let amount = document.querySelector("form input");
    let amtVal =amount.value;
    if(amtVal === "" || amtVal <1) {
        amtVal =1;
        amount.value="1";
    }

    
    const URL = 
    `${BASE_URL}/${fromCurr.value.toLowerCase()}/${toCurr.value.toLowerCase()}.json`;
    let response = await fetch(URL);
    let data = await response.json();
    let rate = data[toCurr.value.toLowerCase()];
    let finalAmt = amtVal * rate;
    msg.innerText = `${amtVal} ${fromCurr.value} = ${finalAmt} ${toCurr.value}`;
}


const updateFlag = (element) => {
    let currCode = element.value;
    let countryCode = countryList[currCode];
    let newSrc =`https://flagsapi.com/${countryCode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    img.src = newSrc;
}


btn.addEventListener("click" ,(evt) => {
    evt.preventDefault();
    let amount = document.querySelector(".amount input");
    let amtVal = amount.value;
    if (amtVal === "" || amtVal <1 ) {
        amtVal = 1;
        amount.value = "1";
    }
    updateExchangeRate();
}); 


//make exchange icon clickable;

const swapIcon = document.getElementById("swap-icon");

swapIcon.addEventListener("click", () => {
    const fromCurrency = document.querySelector(".from select");
    const toCurrency = document.querySelector(".to select");

    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;

    updateFlag(fromCurrency);
    updateFlag(toCurrency);
});


//for light to dark;

function toggleIcon() {
    const icon = document.getElementById("theme-icon");

    if (icon.classList.contains("fa-sun")) {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
    } else {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    }
}

// Event listener for the theme icon;

const themeIcon = document.getElementById('theme-icon');
const body = document.body;

themeIcon.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        themeIcon.textContent = ''; // Moon icon
    } else {
        themeIcon.textContent = ''; // Sun icon
    }
});