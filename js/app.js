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

/* Loader */
appEvent.loaderActive = function () {
    this.getById('table').style.display = 'none';
    this.getById('loader').style.display = 'block';
};
appEvent.loaderHide = function () {
    this.getById('table').style.display = 'block';
    this.getById('loader').style.display = 'none';
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

    appEvent.loaderActive();

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

    appEvent.loaderHide();

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

appEvent.getCountryItemCB = function (res) {

    appEvent.loaderHide();

    if (res.status.code == 0 && res.status.success) {

        //get response ITEM rates {...,rates[{key: {..},val:{..}}]}
        var rates = res.rates;
        var finalRes = [];

        if (rates instanceof Array) {
            for (var rate in rates) {
                // Deep into.Get -- rates[{key: {..},val:{..}}]
                if (rates.hasOwnProperty(rate)){
                    for (var keys in rates[rate].value) {
                        // Deep into. Get array of final objects by Type(Mobile,Regular e.t.c.)
                        // [ {..},...{areaCode, phonePart, rate, Type}...,{..} ]

                        //console.log(rates[rate].value[keys]);
                        if (rates[rate].value.hasOwnProperty(keys)){
                            var items = rates[rate].value[keys];

                            // !!! if ONE ITEM like -- {areaCode, phonePart, rate, Type}
                            // typeof must change to []
                            // OTHERWISE -- Logic Error(There into Loop below will be
                            // called empty properties of objects)
                            if (!(items instanceof Array)){
                                items = [items];
                            }

                            // Bare objects(Final)
                            for (var item in items) {


                                var type = items[item]['type'] ? items[item]['type'] : '';
                                var rate = items[item]['rate'] ? items[item]['rate'] : '';
                                var areaCode = items[item]['areaCode'] ? items[item]['areaCode'] : '';
                                var phonePart = items[item]['phonePart'] ? items[item]['phonePart'] : '';

                                // Fill array like -- [ mobile:[], regular:[] ...]
                                if (!finalRes[type]) {
                                    finalRes[type] = [];
                                }

                                // [ mobile:[ { RATE: *} ],... ],
                                finalRes[type]['rate'] = rate;

                                // [ mobile:[ { rate: *}, {AREACODES: *} ],... ],
                                if(!finalRes[type]['areaCodes']) finalRes[type]['areaCodes'] = '';

                                // String( areaCode + phonePart )
                                var areaCodeFull = areaCode + phonePart;
                                finalRes[type]['areaCodes'] = finalRes[type]['areaCodes'] + areaCodeFull + ', ';
                            }
                        }
                    }
                }
            }
        }

        // finalRes = []; -- Looks like this below ->
        // [ {mobile:[areaCodes: (String)*, rate: *]}, {regular:...}, ... ,{other:...}]

        // Append table into HTML
        this.showTable(finalRes);
    }
    else {
        alert("Error: " + res.status.code);
    }
};

/* Append dynamic <table> to HTML */
appEvent.showTable = function (rateTypesList ) {
    var tbody = "";

    for (var type in rateTypesList) {

        var tr = "<tr><td></td><td>" + type + "</td><td>" + rateTypesList[type]['areaCodes'].replace(/,\s*$/, "") + "</td><td>$" +  rateTypesList[type]['rate']  + "</td></tr>";
        tbody += tr;
    }
    if(tbody){
        var table = "<table><tr><th>" + this.countries[this.selectCountry]['name'] + "</th><th>Type</th><th>Code</th><th>Rate per minute</th></tr>";
        table += tbody;
        table += "</table>"
        this.getById('table').innerHTML = table;
    }

    //  If (tbody += tr;) -- is not filled then TBODY = false
    else {
        // No Table
        this.getById('table').innerHTML = '';
        alert(this.countries[this.selectCountry]['name'] + " has no rates");
    }

};

/* Get all rates of country */
appEvent.getCountryInfo = function (e) {

    e.preventDefault();
    // Country select index and selectIndex == 0
    var selectInd = this.getById("select").selectedIndex;
    if (!selectInd) alert("Please! Select country item");

    else {

        this.selectCountry = this.getById("select").value;

        /* Injection tag <script> to DOM for cross-domain request ability*/
        var script = this.createEl("script");
        script.src = "http://www.ringcentral.com/api/index.php?cmd=getInternationalRates&" +
            "param[internationalRatesRequest][brandId]=1210&" +
            "param[internationalRatesRequest][countryId]=" + appEvent.selectCountry +
            "&param[internationalRatesRequest][tierId]=3311&" +
            "typeResponse=json&callback=appEvent.getCountryItemCB";

        script.type = "text/javascript";
        script.id = "cities";
        this.getByTag("head")[0].appendChild(script);

        appEvent.loaderActive();

        /* Remove injected script tag from DOM */
        var scriptTags = script.parentNode.childNodes;
        [].forEach.call(scriptTags, function (tag) {
            if (tag.id == "cities") {
                script.parentNode.removeChild(tag);
            }
        });
    }
};

appEvent.setCityName = function (cityName) {
    var span = appEvent.getById("cityName");
    span.innerHTML = cityName;
};

document.querySelector("select").addEventListener('change', function (e) {
    var select = appEvent.getById("select");
    var cityName = select.options[select.selectedIndex].text;
    return appEvent.setCityName(cityName);
});

window.onload = function () {
    appEvent.loadCountriesList();
    appEvent.getById('search')
        .addEventListener('click', function (e) {
            return appEvent.getCountryInfo(e)
        });
};
