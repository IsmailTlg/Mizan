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


async function fetchHistory(periode, metal, currency, measure) {
    let urlAPI2;
    let realMetal;
    if(metal == "xau"){
        realMetal = "Or"
    }
    else{
        realMetal = "Argent"
    }
    if(periode == "7"){
        urlAPI2 = "https://xaus.com/api/v1/chart?symbol="+metal+"&range=5d&interval=1d"
    }
    else if(periode == "30"){
        urlAPI2 = "https://xaus.com/api/v1/chart?symbol="+metal+"&range=1mo&interval=1d"
    }
    let response = await fetch(urlAPI2)
    if(!response.ok){
        throw new Error("HTTP error, ", response.status)
    }
    let data = await response.json()
    let history = data.points.map(points => points.c)
    console.log(history);
    const canvas = document.getElementById('Graph')
    const ctx = canvas.getContext("2d")
    let minPrice = Math.min(...history)
    let maxPrice = Math.max(...history)
    const margin = 70;
    const graphWidth = canvas.width - margin * 2;
    const graphHeight = canvas.height - margin * 2;
    //this part is to draw the graph
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    history.forEach((value, i) => {
        const x = margin + i * (graphWidth/(history.length - 1))
        const y = margin + (maxPrice - value) / (maxPrice - minPrice) * graphHeight
        if(i === 0){
            ctx.moveTo(x, y)
        }
        else{
            ctx.lineTo(x, y)
        }
    })
    
    ctx.strokeStyle = "green"
    ctx.lineWidth = 2;
    ctx.stroke()
    history.forEach((value, i) => {
        const x = margin + i * (graphWidth/(history.length - 1))
        const y = margin + (maxPrice - value) / (maxPrice - minPrice) * graphHeight
        ctx.beginPath();
        ctx.arc(x,y,4,0, Math.PI * 2);
        ctx.fill();
    })
    //now draw the X and Y axis
    ctx.beginPath();
    ctx.moveTo(margin, canvas.height-margin)
    ctx.lineTo(canvas.width - margin+15, canvas.height - margin)
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(margin, canvas.height-margin)
    ctx.lineTo(margin, margin-15)
    ctx.strokeStyle = "black"
    ctx.lineWidth = 1;
    ctx.stroke()
    //graph's Title
    ctx.font = "bold 16px Arial"
    ctx.fillStyle = "black"
    ctx.textAlign = "center"
    ctx.fillText(`${realMetal} Histoire Pendant Dernier ${periode} Jours En ${currency}/${measure}`,
        canvas.width / 2 , 18
    )
    //labeling the Y axe
    for(let i = 0; i<=4; i++){
        let price = minPrice + (maxPrice - minPrice) * (i/4)
        let y = canvas.height - margin - (i/4) * graphHeight
        ctx.font = "12px Arial";
        ctx.textAlign = "right"
        ctx.fillText(price.toFixed(2), margin-5, y+4)
    }
    //labeling the X axe
    let dates = data.points.map(point => { 
        return new Date(point.t * 1000).toLocaleDateString();
    })
    ctx.textAlign = "center"
    ctx.font = "12px Arial"
    dates.forEach((date, i) => {
        let x = margin + i * (graphWidth/(dates.length - 1))
        ctx.save();
        ctx.translate(x, canvas.height - margin + 10);
        ctx.rotate(-Math.PI / 3)
        ctx.textAlign = "right"
        ctx.fillText(date, 0, 0);
        ctx.restore()
    })
    console.log(dates);
}
const graphBtnGenerate = document.getElementById("generateBtn")
const graphMetalOption = document.getElementById("metal")
const graphCurrencyOption = document.getElementById("currencyGraph")
const graphPeriodeOption = document.getElementById("periode")
const graphMeasureOption = document.getElementById("measure")
graphBtnGenerate.addEventListener('click', function(){
    fetchHistory(graphPeriodeOption.value, graphMetalOption.value, graphCurrencyOption.value, graphMeasureOption.value)
})

