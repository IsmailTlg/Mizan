function fetchinfo(currency){
    let urlAPI = "https://xaus.com/api/v1/spot"
    if(currency == "EUR"){
        urlAPI = "https://xaus.com/api/v1/spot?currency=EUR"
        localStorage.setItem("currency", "EUR")
    }
    else if(currency == "MAD"){
        urlAPI = "https://xaus.com/api/v1/spot?currency=MAD"
        localStorage.setItem("currency", "MAD")
    }
    else if(currency == "USD"){
        urlAPI = "https://xaus.com/api/v1/spot"
        localStorage.setItem("currency", "USD")
    }
    fetch(urlAPI)
        .then(response => {
            if(!response.ok){
                throw new Error(`Https error, Status; ${response.status}`)
            }
            return response.json()
        })
        .then(data => {
            const goldPrice = document.getElementById("goldPrice")
            const silverPrice = document.getElementById("silverPrice")
            const dateArea = document.getElementById('date')
            goldPrice.textContent = `Prix: ${(data['xau']['price'] / 31.1034768).toFixed(3)} ${data['xau']['currency']}`
            silverPrice.textContent = `Prix: ${(data['silver_usd_oz'] * data['fx_rate'] / 31.1034768).toFixed(3)} ${data['xau']['currency']}`
            dateArea.textContent = `Date: ${data['data_state']['as_of'].split("T")[0]}
            Time: ${data['data_state']['as_of'].split("T")[1]}`
        })
        .catch(error => {
            console.error(error);
        });    
}
setInterval(fetchinfo, 60000);
//US-02 (im gonna compare the price with yesterday's)
async function getYestdayPrice(){
    try{    
        const response = await fetch("https://xaus.com/api/v1/history")
        const response2 = await fetch("https://xaus.com/api/v1/spot")
        const data2 = await response2.json()
        if(!response.ok){
            throw new Error(`Https error, status ${response.status}`)
        }
        console.log(response);
        
        const data = await response.json()
        const yesterday = data.points[data.points.length-2]
        //countaining difference
        let diff = (data2.xau.price - yesterday.c) * 100 / data2.xau.price 
        const arrDown = document.getElementById("arrowDown")
        const arrUp = document.getElementById("arrowUp") 
        const diffLabelGold = document.getElementById("differenceGold")
        if(diff > 0){
            diffLabelGold.textContent = `+${diff.toFixed(3)}%`
            diffLabelGold.className = "greenTxt"
            arrDown.classList.add("hide")
            arrUp.classList.remove("hide")
        }
        else{
            diffLabelGold.textContent = `${diff.toFixed(3)}%`
            diffLabelGold.className = "redTxt"
            arrDown.classList.remove("hide")
            arrUp.classList.add("hide")
        }
    }
    catch(error){
        console.error("failedddd, ", error)
    }
}
getYestdayPrice()
setInterval(getYestdayPrice, 60000);
const currency = document.getElementById("currency")
currency.value = localStorage.getItem('currency') || ""
fetchinfo(currency.value)
currency.addEventListener('change', function(){
    console.log('changed');
    
    fetchinfo(currency.value)
})
