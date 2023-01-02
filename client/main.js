import './style.css'

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat-container');

let loadInterval;

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

const typeText = (element, text) => {
    let index = 0;
    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20)
}

const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);
    return `id-${timestamp}-${hexadecimalString}`;
}

const chatData = (isAI, value, uniqueId) => {
    return (
        `
       <div class="${isAI && 'ai'}">
           <div class="chat">
               <div class="profile ${isAI ? 'fa-solid fa-robot' : 'fa-solid fa-user'}"></div>
               <div class="message" id="${uniqueId}">${value}</div>
           </div>
       </div>
      `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    chatContainer.innerHTML += chatData(false, data.get('prompt'))

    form.reset();

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatData(true, " ", uniqueId)

    // to focus scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch('http://localhost:4000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if(response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();
        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text();
        messageDiv.innerHTML = 'Something went wrong';
        alert(err);
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})
