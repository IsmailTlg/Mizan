function fetchinfo(){
    fetch("https://xaus.com/api/v1/spot")
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
            goldPrice.textContent = `Prix: ${data['per_gram_usd'].toFixed(3)} ${data['xau']['currency']}`
            silverPrice.textContent = `Prix: ${(data['silver_usd_oz'] / 31.1034768).toFixed(3)} ${data['xau']['currency']}`
            dateArea.textContent = `Date: ${data['data_state']['as_of'].split("T")[0]}
            Time: ${data['data_state']['as_of'].split("T")[1]}`
        })
        .catch(error => {
            console.error(error);
        });    
}
fetchinfo()
setInterval(fetchinfo, 60000);
//US-02
