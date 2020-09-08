const trainingHistoryDbRef = defaultDatabase.ref("trainingHistory");
const updateChangesTrigger = document.querySelector('[data-update-changes]')
const mutatedElementIds = []
const allStatusClassNames = ['success', 'error', 'warning']
const notificationHandle = document.querySelector('[data-notification-handle]')

const getTrainingData = (ref) => {
    return new Promise((resolve, reject) => {
        const onError = error => reject(error);
        const onData = snap => resolve(snap.val());

        ref.on("value", onData, onError);
    });
};

const getPathById = (ref, id) => {
    return new Promise((resolve, reject) => {
        const onError = error => reject(error);
        const onData = snap => {
            snap.forEach(differentTraining => {
                const trainingData = differentTraining.child("trainingData");
                trainingData.forEach(chatbotOrUser => {
                    const findId = (training) => {
                        return training.id === id;
                    }

                    const hasId = chatbotOrUser.val().find(findId);
                    if (hasId) {
                        chatbotOrUser.forEach(trainingItem => {
                            if (trainingItem.val().id === id) {
                                const path = trainingItem.ref_.path.pieces_
                                resolve(path)
                            }
                        })
                    }
                })

            })
        };

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
            if (mutatedElementIds.includes(node.id)) return
            mutatedElementIds.push(node.id)
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
    // if last row in fieldset
    parentNode.remove()
}

const mutationHandler = event => {
    event.path.forEach(node => {
        if (node.className !== "form-row") return
        if (mutatedElementIds.includes(node.id)) return
        mutatedElementIds.push(node.id)
    })
}

const stripTrainingData = async () => {
    const trainingData = await getTrainingData(trainingHistoryDbRef)
    const splittedValues = {
        userInputTrainingForm: [],
        chatbotReactionTrainingForm: [],
    }
    if (!trainingData) {
        notificationHandler('Er is nog geen training toegevoegd!', 'warning')
    }

    Object.values(trainingData).forEach(training => {
        const { chatbotReactionTrainingForm, userInputTrainingForm } = training.trainingData

        if (chatbotReactionTrainingForm) {
            splittedValues.chatbotReactionTrainingForm.push(chatbotReactionTrainingForm)
        }
        if (userInputTrainingForm) {
            splittedValues.userInputTrainingForm.push(userInputTrainingForm)
        }
    })

    const flattenValues = {
        userInputTrainingForm: splittedValues.userInputTrainingForm.flat(),
        chatbotReactionTrainingForm: splittedValues.chatbotReactionTrainingForm.flat(),
    }

    const sort = (array) => {
        // https://stackoverflow.com/a/6712080
        return array.sort(function (a, b) {
            if (a.intent < b.intent) { return -1; }
            if (a.intent > b.intent) { return 1; }
            return 0;
        })
    }

    const sortedValues = {
        chatbotReactionTrainingForm: sort(flattenValues.chatbotReactionTrainingForm),
        userInputTrainingForm: sort(flattenValues.userInputTrainingForm)
    }
    return sortedValues
}

const showTrainingHistory = async () => {
    const trainingData = await stripTrainingData()
    const keys = Object.keys(trainingData)

    keys.forEach(key => {
        const formHandle = document.getElementById(key)
        const formRow = formHandle.querySelector('[data-form-row]')
        const historyValues = trainingData[key]
        const formFieldset = formHandle.querySelector('fieldset')

        const uniqueHistoryIntents = []

        historyValues.forEach(value => {
            const { intent } = value
            if (!uniqueHistoryIntents.includes(intent)) {
                uniqueHistoryIntents.push(intent)
            }
        })

        const sortedUniqueHistoryIntent = uniqueHistoryIntents.map(currentIntent => {
            return historyValues.filter(({ intent }) => intent === currentIntent)

        })

        // for every unique intent 
        sortedUniqueHistoryIntent.forEach(sortedIntents => {
            const customFieldset = document.createElement("fieldset")
            const customLegend = document.createElement("legend")
            const currentIntentName = sortedIntents[0].intent
            const newContent = document.createTextNode(currentIntentName);

            formFieldset.prepend(customFieldset)
            customLegend.appendChild(newContent);
            customFieldset.appendChild(customLegend)

            // for every intent
            sortedIntents.forEach(historyIntent => {
                const { id, utterance, intent, language } = historyIntent
                const clonedFormRow = formRow.cloneNode(true)
                const deleteButtonInClonedFormRow = clonedFormRow.querySelector('[data-delete-row]')
                clonedFormRow.id = id
                if (clonedFormRow.classList.contains('hide')) clonedFormRow.classList.remove('hide')

                const inputKeys = Object.keys({ utterance, intent, language })

                inputKeys.forEach(inputKey => {
                    const inputField = clonedFormRow.querySelector(`.${inputKey}`)
                    inputField.value = historyIntent[inputKey]
                    inputField.addEventListener('change', mutationHandler)
                })

                deleteButtonInClonedFormRow.addEventListener('click', deleteRowHandler)
                customFieldset.appendChild(clonedFormRow)
            })

        })

        formRow.remove()
    })
}
showTrainingHistory()

const updateHistoryChanges = (e) => {
    if (!mutatedElementIds.length) return
    resetStatusStyling()

    // get all Id's to delete in db
    const removedInputIds = mutatedElementIds.filter(id => {
        const nodeElement = document.getElementById(id)
        if (!nodeElement) return id
    })

    // get all Id's to update in db
    const updatedInputIds = mutatedElementIds.filter(id => {
        if (!removedInputIds.includes(id)) return id
    })

    if (removedInputIds.length) {
        removedInputIds.forEach(async id => {
            const pathArray = await getPathById(trainingHistoryDbRef, id)

            let childPath = ''
            pathArray.forEach((pathItem, index) => {
                if (pathItem === 'trainingHistory') return
                const slash = (index === pathArray.length - 1) ? '' : '/'
                childPath += `${pathItem}${slash}`
            })

            const trainingDataPath = `${pathArray[1]}/${pathArray[2]}`
            const trainingData = await getTrainingData(trainingHistoryDbRef.child(trainingDataPath))

            let lastTrainingFormData = 0
            Object.keys(trainingData).map(formData => { lastTrainingFormData += trainingData[formData].length })


            // if last data in specific training, delete training
            if (lastTrainingFormData === 1) trainingHistoryDbRef.child(pathArray[1]).remove()
            // else delete row
            trainingHistoryDbRef.child(childPath).remove()
        })
    }

    if (updatedInputIds.length) {
        updatedInputIds.forEach(async id => {
            const pathArray = await getPathById(trainingHistoryDbRef, id)
            const formRow = document.getElementById(id)
            const formRowElements = formRow.querySelectorAll('select, input, textarea')
            const utteranceCollection = []
            let missingValue = false
            let duplicateValue = false

            const updatedFormRowValues = {
                id: id,
                intent: '',
                language: '',
                utterance: ''
            }

            formRowElements.forEach(input => {
                if (!input.value) {
                    missingValue = true
                    input.classList.add('error')
                    notificationHandler('Niet alle inputs zijn ingevuld!', 'error')
                    return
                }
                if (input.classList.contains('intent')) {
                    updatedFormRowValues.intent = input.value
                }
                if (input.classList.contains('utterance')) {
                    updatedFormRowValues.utterance = input.value
                    const allUtterances = Array.from(document.querySelectorAll('.utterance'))
                    const allUtteranceValues = allUtterances.map(utterance => utterance.value)
                    const possibleDuplicateValues = allUtteranceValues.filter(value => value.includes(input.value));
                    const hasDuplicates = possibleDuplicateValues.length > 1

                    if (hasDuplicates) {
                        duplicateValue = true
                        input.classList.add('error')
                        notificationHandler('Er zijn opmerkingen met dezelfde waarde!', 'error')
                        return
                    }
                }
                if (input.classList.contains('language')) {
                    updatedFormRowValues.language = input.value
                }
            })

            if (missingValue || duplicateValue) return

            // else
            let childPath = ''
            pathArray.forEach((pathItem, index) => {
                if (pathItem === 'trainingHistory') return
                const slash = (index === pathArray.length - 1) ? '' : '/'
                childPath += `${pathItem}${slash}`
            })

            // update
            trainingHistoryDbRef.child(childPath).set(updatedFormRowValues)
        })
    }
    fetch(`/.netlify/functions/update`)
        .then(async response => response.json())
        .then(json => {
            if (json.statusCode !== 200) return
            notificationHandler('De wijzigingen zijn doorgevoerd!', 'success')
        })
        .catch(e => {
            notificationHandler(`error: ${e.message}`, 'error')
        })


}

updateChangesTrigger.addEventListener('click', updateHistoryChanges)