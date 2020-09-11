const form = document.querySelector('[chatbot-input-form]')
const inputValue = document.querySelector('[chatbot-input-value]')
const chatbotConversation = document.querySelector('[chatbot-conversation]')

const injectInChat = (value, personality) => {
    const listItem = document.createElement('li')
    const userInput = document.createTextNode(value)
    listItem.appendChild(userInput)
    chatbotConversation.appendChild(listItem)
    listItem.classList.add(personality)
}

const submitForm = e => {
    e.preventDefault()
    const currentValue = inputValue.value

    injectInChat(currentValue, 'user')
    inputValue.value = ""

    fetch(`/.netlify/functions/ask?message=${encodeURI(currentValue)}`)
        .then(async response => response.json())
        .then(json => {
            const chatbotResponse = json.result.answers[0]
            injectInChat(chatbotResponse, 'chatbot')
        })
        .catch(e => {
            const errorMessage = e.message
            injectInChat(errorMessage, 'error')
        })
}

form.addEventListener('submit', submitForm)