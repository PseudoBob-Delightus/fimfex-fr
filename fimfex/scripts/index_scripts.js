async function submit_exchange() {
    const ex_title = document.getElementById('ex_title').value;
    const warningbox = document.getElementById('warningbox');
    const resultbox = document.getElementById('resultbox');
    try {
        const res = await fetch(`http://fimfex.ddns.net:7669/create-exchange?title=${ex_title}`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        );
        const data = await res.json();

        if (!res.ok) {
            resultbox.innerHTML = ''
            resultbox.classList.add('invisible')

            warningbox.innerHTML = `
                <p>The server returned an error:</p>
                <p><strong>Error ${res.status}:</strong> ${res.body}</p> 
            `
            warningbox.classList.remove('invisible')
            return;
        }
        else {
            warningbox.innerHTML = ''
            warningbox.classList.add('invisible')

            resultbox.innerHTML = `
                <p>Exchange created! You can access it <a href="view.html?id=${data.id}">here</a>.</p>
                <p>To administer your exchange, you will need the following passphrase:</p>
                <p>${data.passphrase}</p>
                <p>Copy and save it somewhere now.</p>
            `
            resultbox.classList.remove('invisible')
        }
    } catch (error) {
        resultbox.innerHTML = ''
        resultbox.classList.add('invisible')
        
        warningbox.innerHTML = '<p>There was an uncaught error. Consult the console, and notify site authors.</p>'
        warningbox.classList.remove('invisible')
        console.log(error);
    }
}