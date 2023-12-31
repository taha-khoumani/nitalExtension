// GLOBAL-VARIABLES
    const currentLanguageShown = selectElement('#currentLanguageShown')
    const languagesInputs = Array.from(document.querySelectorAll(".language-box"))
// 



// HELPER-FUNCTIONS
    function selectElement(query){
        return document.querySelector(query)
    }

    function removeAddClass(element,removedClass,addedClass){
        if(removeAddClass) element.classList.remove(removedClass);
        if(addedClass) element.classList.add(addedClass);
    }

    function checkGoogle(){
        chrome.storage.local.get(
            'state',
            (result) => {
                // Vars
                const state = result.state
    
                if(state === "on"){
                    goToGoolgeIfOnHome()
                }else{
                    goToHomeIfOnGoogle()
                }
            }
        );
    }
    
    function goToGoolgeIfOnHome(){
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const tab = tabs[0];
            if (!tab.url || tab.url === "chrome://newtab/") {
              chrome.tabs.update({ url: "https://www.google.com" },()=>console.log("google finished"));
            }
        }); 
    }
    
    function goToHomeIfOnGoogle(callback){
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const tab = tabs[0];
            if (tab.url === "https://www.google.com/") {
              chrome.tabs.update({ url: "chrome://newtab/" },callback);
            }
        }); 
    }

    function handleError() {
        if(chrome.runtime.lastError) {

        } else {

        }
    }

// 



// NAVIGATION
    // Variables
    const home = selectElement("#home")
    const currentLanguageShownContainer = selectElement("#currentLanguageShownContainer")
    const languagesSection = selectElement("#language-selection")
    const form = selectElement("#languagesForm")
 
    // 1TimesRuns
    form.addEventListener("submit",(e)=>e.preventDefault())

    // Event listener funtions
    function goToLanguagesSection(){
        // check if the toggler is off
        if(state === "off") return;

        removeAddClass(languagesSection,"hidden","flex")
        removeAddClass(home,"flex","hidden")

        // scroll to selected language
        selectElement(`#${selectedLanguage}`).scrollIntoView()
    }
    function goToHome(){
        removeAddClass(home,"hidden","flex")
        removeAddClass(languagesSection,"flex","hidden")
    }
    function onSavePopup(){
        if(!form.checkValidity()) return;

        state = "on"
        chrome.storage.local.set({state:"on"})
        onOnUI()
        goToHome()
        checkGoogle()
    }

    // Dom
    currentLanguageShownContainer.addEventListener('click',goToLanguagesSection)
//



// LANGUAGES-SELECTION
    // Variables
    let selectedLanguage = ""

    // On load
    chrome.storage.local.get(
        'selectedLanguage',
        (result) => {
            // Variables
            selectedLanguage = result.selectedLanguage

            // if it's the user first visit
            if(!selectedLanguage)return; 

            // Conditional variables 
            const radioButtonMatchingCurrentLanguage = languagesInputs.find(language=> language.value === selectedLanguage )
            
            // Check the stored language on the form
            radioButtonMatchingCurrentLanguage.checked = true

            // update the currentLanguageShown in home
            currentLanguageShown.innerText = radioButtonMatchingCurrentLanguage.labels[0].textContent

            // navigate to home
            goToHome()
            
        }
    );

    // On change
    function onLanguageChangePopup(e){
        // Variables
        const clickedRadio = e.target
        const clickedLanguage = e.target.value

        // Update local variable and localStorage variable
        selectedLanguage = clickedLanguage
        chrome.storage.local.set({selectedLanguage:clickedLanguage})
        
        // update the currentLanguageShown in home
        currentLanguageShown.innerText = clickedRadio.labels[0].textContent

        // Add the removed languages if search box used
        languagesDiv.forEach(language=>language.style.display = "")

        // Reseting the search input
        search.value = ""

        // Scroll to selected element
        selectElement(`#${clickedLanguage}`).scrollIntoView()

        // Go back home
        onSavePopup()

        // Close popup
        window.close()
    }

    // Dom
    languagesInputs.forEach(language=>language.addEventListener('change',onLanguageChangePopup))
// 



// ON-OFF-TOGGLING

    // Variables
    let state;
    const on = selectElement("#on")
    const off = selectElement("#off")

    // On load
    chrome.storage.local.get(
        'state',
        (result) => {
            // if it's the user first visit 
            if(!result.state)return;


            // Variables
            state = result.state

            if(state === 'on') return;
            onOffPopup()
            
            
        }
    );

    //Event listener funtions  
    function ON(){

    }    
    function OFF (){

    }
    function onOnUI() {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {message: "on"},handleError);

        });
    }
    function onOnPopup(){
        // Update global variable
        state = "on"

        // Store to localStorage
        chrome.storage.local.set({state:"on"})

        // Update popup UI
        removeAddClass(on,false,'state')
        removeAddClass(off,'state',false)
        removeAddClass(currentLanguageShownContainer,'disabled',false)

        // Navigate to Google.com if needed
        checkGoogle()
    } 
    function onOffUI() {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {message: "off"},handleError);
        });
    }
    async function onOffPopup(){
        // Update global variable
        state = "off"

        // Store to localStorage
        chrome.storage.local.set({state:"off"})

        // Update UI
        removeAddClass(on,'state',false)
        removeAddClass(off,false,'state')
        removeAddClass(currentLanguageShownContainer,false,'disabled')

        // Navigate to Home if needed
        checkGoogle()
    } 
    function onOffPopupAndCloseWindow(){
        // Update global variable
        state = "off"

        // Store to localStorage
        chrome.storage.local.set({state:"off"})

        // Update UI
        removeAddClass(on,'state',false)
        removeAddClass(off,false,'state')
        removeAddClass(currentLanguageShownContainer,false,'disabled')

        // Navigate to Home if needed
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const tab = tabs[0];
            if (tab.url === "https://www.google.com/") {
              chrome.tabs.update({ url: "chrome://newtab/" },()=>window.close());
            }else{
                window.close()
            }
        }); 
    }
    

    // Dom
    document.addEventListener("DOMContentLoaded", ()=>on.addEventListener("click", onOnUI));
    on.addEventListener('click',onOnPopup)
    document.addEventListener("DOMContentLoaded", ()=>off.addEventListener("click", onOffUI));
    off.addEventListener('click',onOffPopupAndCloseWindow)

// 



// Search Filtering
    // Vars
    const search = selectElement("#search")
    const languagesDiv = Array.from(document.querySelectorAll(".language"))
    

    // Event listener functions
    function onInputSearchHandler(e){
        const searchInput = e.target.value
        const regex = new RegExp(`^${searchInput}.*`,'i');
        const languagesInputs = languagesDiv.map(l=>l.firstElementChild.id)
        const languagesInputsToRemove = languagesInputs.filter(l=>!regex.test(l))
        const languagesDivToRemove = languagesInputsToRemove.map(l=>selectElement(`#${l}`).parentNode)
        
        languagesDiv.forEach(languageDiv=>{
            if(languagesDivToRemove.includes(languageDiv)){
                languageDiv.style.display = 'none'
            }else{
                languageDiv.style.display = ''
            }
        })

    }

    // Dom
    search.addEventListener("input",onInputSearchHandler)

// 

