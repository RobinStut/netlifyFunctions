const deleteInputRowTriggers = document.querySelectorAll('[data-delete-row]')
const addInputRowTriggers = document.querySelectorAll('[data-add-input-row]')
const executeTrainingTrigger = document.querySelector('[data-execute-training]')
const notificationHandle = document.querySelector('[data-notification-handle]')
const allStatusClassNames = ['success', 'error']
const traininHistorygRef = defaultDatabase.ref("trainingHistory");

const generateId = () => {
    //https://tomspencer.dev/blog/2014/11/16/short-id-generation-in-javascript/
    const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const ID_LENGTH = 12;
    let rtn = '';
    for (let i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
}

const getDataFromDb = (ref) => {
    return new Promise((resolve, reject) => {
        const onError = error => reject(error);
        const onData = snap => resolve(snap.val());

        ref.on("value", onData, onError);
    });
};

const notificationHandler = (message, status) => {
    message ? notificationHandle.innerHTML = message : notificationHandle.innerHTML = ""
    if (status) {
        const classList = Array.from(notificationHandle.classList)
        classList.forEach(className => {
            if (allStatusClassNames.includes(className)) {
                notificationHandle.classList.remove(className)
            }
        })

        notificationHandle.classList.add(status)
    }
}

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

const deleteRowHandler = event => {
    let parentNode

    // get parent node
    event.path.forEach(node => {
        if (node.className === "form-row") {
            parentNode = node.parentNode
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

const executeTraining = async (e) => {
    const userInputTrainingForm = document.getElementById('userInputTrainingForm')
    const chatbotReactionTrainingForm = document.getElementById('chatbotReactionTrainingForm')

    resetStatusStyling()


    const allInputsValues = async () => {
        const queu = [userInputTrainingForm, chatbotReactionTrainingForm]
        let missingValue = false
        let duplicateValue = false
        let alreadyExist = false
        let formIsEmpty = false
        const historyTrainingData = await getDataFromDb(traininHistorygRef)
        const strippedHistoryTrainingData = historyTrainingData ? Object.values(historyTrainingData) : false
        const trainingData = {}

        queu.forEach(form => {
            const id = form.id
            const filteredHistoryTrainingData = {
                language: [],
                intent: [],
                utterance: []
            }

            if (strippedHistoryTrainingData) {
                strippedHistoryTrainingData.forEach(e => {
                    if (!e.trainingData[id]) return
                    e.trainingData[id].forEach(value => {
                        const { language, intent, utterance } = value
                        filteredHistoryTrainingData.language.push(language)
                        filteredHistoryTrainingData.intent.push(intent)
                        filteredHistoryTrainingData.utterance.push(utterance)
                    })
                })
            }

            const row = Array.from(form.querySelectorAll('[data-form-row]'))
            const utteranceCollection = []

            const rows = row.map((formRow, index) => {
                const inputObj = {
                    id: generateId(),
                    language: '',
                    intent: '',
                    utterance: ''
                }
                const inputTypes = Array.from(formRow.querySelectorAll('select, textarea, input'))
                let isOnlyOneInput = false

                inputTypes.forEach(input => {
                    // check if one of the forms is left empty
                    if (!input.value && index === row.length - 1) {
                        isOnlyOneInput = true
                        return
                    }
                    // checks if all input fields are filled in
                    if (!input.checkValidity()) {
                        missingValue = true
                        input.classList.add('error')
                        notificationHandler('Niet alle inputs zijn ingevuld!', 'error')
                        return
                    }

                    if (input.classList.contains('language')) inputObj.language = input.value
                    if (input.classList.contains('intent')) inputObj.intent = input.value

                    if (input.classList.contains('utterance')) {
                        // check if input already exist
                        if (utteranceCollection.includes(input.value)) {
                            duplicateValue = true
                            input.classList.add('error')
                            notificationHandler('Er zijn opmerkingen met dezelfde waarde!', 'error')
                            return
                        }
                        const inputExistsInDb = filteredHistoryTrainingData.utterance.includes(input.value)
                        if (inputExistsInDb) {
                            alreadyExist = true
                            input.classList.add('error')
                            notificationHandler('Deze waarde is al eerder toegevoegd!', 'error')
                        }

                        // push unique utterance to array
                        utteranceCollection.push(input.value)
                        inputObj.utterance = input.value
                    }
                })

                const rowIsEmpty = () => {
                    const keys = Object.keys(inputObj)
                    if (keys.length === 1 && keys[0] === 'language') return true
                    return false
                }
                if (rowIsEmpty()) {
                    return false
                }

                if (isOnlyOneInput) {
                    const hasEmptyValue = Object.values(inputObj).includes('')
                    if (hasEmptyValue) return
                }
                return inputObj
            })

            if (rows[0]) trainingData[form.id] = rows
        })
        // if form is not empty
        if (!Object.keys(trainingData).length) {
            notificationHandler('Er is geen trainingsdata ingevuld!', 'error')

        }

        const valueIsIncorrect = missingValue || duplicateValue || alreadyExist || formIsEmpty

        return { valueIsIncorrect, trainingData }
    }

    const result = await allInputsValues()

    // if value is missing in form, this will be false
    if (!result.valueIsIncorrect) {
        const { trainingData } = result
        const trainingId = Date.now()
        const date = new Date().toLocaleString()
        const historyObj = {
            'trainedBy': '',
            'date': date,
            'trainingData': trainingData
        }
        const trainingRef = defaultDatabase.ref('training').child(`${trainingId}`);
        const traininHistoryChildRef = traininHistorygRef.child(`${trainingId}`);

        // use to post data to firebase
        trainingRef.set(trainingData)
        traininHistoryChildRef.update(historyObj)

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