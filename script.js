fetch("https://xaus.com/api/v1/spot")
    .then(response => {
        if(!response.ok){
            throw new Error(`Https error, Status; ${response.status}`)
        }
        return response.json()
    })
    .then(data => {
        let main = document.getElementById('main')
        let infoPrix = document.getElementById('infoPrix')
        let input = document.getElementById('metal')
        input.addEventListener('change', (event) => {
            let selected = event.target.value; 
            console.log(selected);
            
            if(selected == "or"){
                infoPrix.textContent = `
                Prix d'Or (usd/gram) : ${data['per_gram_usd']} ${data['xau']['currency']}
                `
            }
            else if(selected == "argent"){
                //api gives silver price in oz so must convert to gram (multiply by 31.103...)
                infoPrix.textContent = `
                Prix D'argent (usd/gram): ${data['silver_usd_oz'] / 31.1034768} USD
                `
            }
            else{
                infoPrix.textContent = `
                Il faut selectionne un metal
                `
            }
            infoPrix.textContent += `\nprix a periode: ${data.price_as_of}`
        })
        console.log(data);
        
        
    })
    .catch(error => {
        infoPrix.textContent = `ERROR: ${error}`
    });
