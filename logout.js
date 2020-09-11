const logoutTrigger = document.querySelector('[logout-button]')

logoutTrigger.addEventListener('click', e => {
    e.preventDefault()
    auth.signOut()
})

auth.onAuthStateChanged(firebaseUser => {
    if (!firebaseUser) window.location.replace("/login.html")
})