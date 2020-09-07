const deleteInputRowTriggers = document.querySelectorAll('[data-delete-row]')
const addInputRowTriggers = document.querySelectorAll('[data-add-input-row]')
const executeTrainingTrigger = document.querySelector('[data-execute-training]')
const notificationHandle = document.querySelector('[data-notification-handle]')
const allStatusClassNames = ['success', 'error']

const notificationHandler = (message, status) => {
    message ? notificationHandle.innerHTML = message : notificationHandle.innerHTML = ""
    if (status) {
        const classList = Array.from(notificationHandle.classList)
        classList.forEach(className => {
            if (allStatusClassNames.includes(className)) {
                node.classList.remove(className)
            }
        })

        notificationHandle.classList.add(status)
    }
}

const deleteRowHandler = event => {
    let parentNode

    // get parent node
    event.path.forEach(node => {
        if (node.nodeName === "FIELDSET") {
            parentNode = node
        }
    })

    const allFormRows = parentNode.querySelectorAll('[data-form-row]')
    const targetParents = event.path

    // if user deletes one of more rows
    if (allFormRows.length > 1) {
        targetParents.forEach(node => {
            // remove row from DOM
            if (node.className === "form-row") node.outerHTML = ""
        })
        return
    }

    // if user deletes last row
    const allInputsInLastRow = allFormRows[0].querySelectorAll('textarea, input')
    // remove values from inputs
    allInputsInLastRow.forEach(input => input.value = "")
}

const addRowHandler = (event) => {
    let parentNode

    // get parent node
    event.path.forEach(node => {
        if (node.nodeName === "FIELDSET") {
            parentNode = node
        }
    })

    // get footer based of parent node
    const formFooter = parentNode.getElementsByClassName('form-footer')[0]

    // clone form row based on parent node
    const clonedFormRow = parentNode.querySelector('[data-form-row]').cloneNode(true)
    const allInputsInClonedFormRow = clonedFormRow.querySelector('input[type=text]')
    const allTextareasInClonedFormRow = clonedFormRow.querySelector('textarea')
    const deleteButtonInClonedFormRow = clonedFormRow.querySelector('[data-delete-row]')

    // clear all input/textarea fields
    allInputsInClonedFormRow.value = ""
    allTextareasInClonedFormRow.value = ""
    allTextareasInClonedFormRow.removeAttribute('style')

    // attach eventListener to delete button
    deleteButtonInClonedFormRow.addEventListener('click', deleteRowHandler)

    parentNode.insertBefore(clonedFormRow, formFooter)
}

const executeTraining = (e) => {
    const userInputTrainingForm = document.getElementById('userInputTrainingForm')
    const chatbotReactionTrainingForm = document.getElementById('chatbotReactionTrainingForm')

    const resetStatusStyling = () => {
        const inputsWithStatusClasses = Array.from(document.querySelectorAll('.success, .error'))

        inputsWithStatusClasses.forEach(node => {
            const classList = Array.from(node.classList)
            classList.forEach(className => {
                if (allStatusClassNames.includes(className)) {
                    node.classList.remove(className)
                }
            })
        })
        notificationHandler()
    }
    resetStatusStyling()


    const allInputsValues = () => {
        const queu = [userInputTrainingForm, chatbotReactionTrainingForm]
        let missingValue = false
        const trainingData = {}

        queu.forEach(form => {
            const row = Array.from(form.querySelectorAll('[data-form-row]'))

            const rows = row.map(formRow => {
                const inputObj = {}
                const inputTypes = Array.from(formRow.querySelectorAll('select, textarea, input'))

                inputTypes.forEach(input => {
                    // checks if all input fields are filled in
                    if (!input.checkValidity()) {
                        missingValue = true
                        input.classList.add('error')
                        notificationHandler('Niet alle inputs zijn ingevuld!', 'error')
                        return
                    }
                    if (input.classList.contains('utterance')) inputObj.utterance = input.value
                    if (input.classList.contains('language')) inputObj.language = input.value
                    if (input.classList.contains('intent')) inputObj.intent = input.value
                })

                return inputObj
            })
            trainingData[form.id] = rows
        })
        return { missingValue, trainingData }
    }

    // if value is missing in form, this will be false
    if (!allInputsValues().missingValue) {
        const { trainingData } = allInputsValues()
        const trainingId = Date.now()
        const date = new Date().toLocaleString()
        const historyObj = {
            'trainedBy': '',
            'date': date,
            'trainingData': trainingData
        }
        const trainingRef = defaultDatabase.ref('training').child(`${trainingId}`);
        const traininHistorygRef = defaultDatabase.ref('trainingHistory').child(`${trainingId}`);

        // use to post data to firebase
        trainingRef.set(trainingData)
        traininHistorygRef.update(historyObj)

        fetch(`/.netlify/functions/train?trainingId=${encodeURI(trainingId)}`)
            .then(async response => response.json())
            .then(json => {
                if (json.statusCode !== 200) return
                trainingRef.remove()

                // reset form
                deleteInputRowTriggers.forEach((deleteButton, index) => {
                    // https://stackoverflow.com/a/49117631
                    try {
                        // For modern browsers except IE:
                        const event = new CustomEvent('click');
                    } catch (err) {
                        // If IE 11 (or 10 or 9...?) do it this way:

                        // Create the event.
                        const event = deleteButton.createEvent('Event');
                        // Define that the event name is 'build'.
                        event.initEvent('click', true, true);
                    }
                    deleteButton.dispatchEvent(new Event("click"))
                })

                notificationHandler('Training voltooid!', 'success')
            })
            .catch(e => {
                console.log(e);
            })
    }
}

deleteInputRowTriggers.forEach(deleteButton => {
    deleteButton.addEventListener('click', deleteRowHandler)
})

addInputRowTriggers.forEach(addButton => {
    addButton.addEventListener('click', addRowHandler)
})

executeTrainingTrigger.addEventListener('click', executeTraining)