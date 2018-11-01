var appEvent = {};

appEvent.countries = [];

appEvent.selectCountry = null;

appEvent.getById = function (id) {
    return document.getElementById(id)
};
appEvent.createEl = function (el) {
    return document.createElement(el)
};
appEvent.getByTag = function (name) {
    return document.getElementsByTagName(name)
};

/* Method for load country data */
appEvent.loadCountriesList = function () {

    /* Injection tag <script> to DOM for cross-domain request ability*/
    var script = this.createEl("script");
    script.src = "http://www.ringcentral.com/api/index.php?" +
        "cmd=getCountries&" +
        "typeResponse=json&" +
        "callback=appEvent.getCountriesCB";
    script.type = "text/javascript";
    script.id = "cities";
    this.getByTag("head")[0].appendChild(script);

    /* Remove injected script tag from DOM */
    var scriptTags = script.parentNode.childNodes;
    [].forEach.call(scriptTags, function (tag) {
        if (tag.id == "cities") {
            script.parentNode.removeChild(tag);
        }
    });
};

/* Methods that will be passed as callback when the script tag dynamic injection */
appEvent.getCountriesCB = function (res) {

    var self = this;
    if (res.status.code == 0 && res.status.success) {

        res.result.forEach(function (el) {
            self.countries[el.id] = el;
        });

        // Create <select> and append into options
        var select = self.getById('select');

        for (var country in self.countries) {
            var option = self.createEl("option");
            option.innerHTML = self.countries[country]['name'];
            option.value = self.countries[country]['id'];
            select.appendChild(option);
        }
    }
    else {
        alert("Error: " + res.status.code)
    }
};

window.onload = function () {
    appEvent.loadCountriesList();
};
