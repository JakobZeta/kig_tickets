(function() {
    'use strict';
  
    var app = {
      isLoading: true,
      visibleCards: {},
      selectedCities: [],
      spinner: document.querySelector('.loader'),
      cardTemplate: document.querySelector('.cardTemplate'),
      container: document.querySelector('.main'),
      addDialog: document.querySelector('.dialog-container'),
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    };
  
  
    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/
  
    document.getElementById('butRefresh').addEventListener('click', function() {
      // Refresh all of the forecasts
      app.updateForecasts();
    });
  
    document.getElementById('butUser').addEventListener('click', function() {
      // Open/show the add new city dialog
      app.toggleAddDialog(true);
    });
  
    document.getElementById('butAddCity').addEventListener('click', function() {
      // Add the newly selected city
      var select = document.getElementById('selectCityToAdd');
      var selected = select.options[select.selectedIndex];
      var key = selected.value;
      var label = selected.textContent;
      if (!app.selectedCities) {
        app.selectedCities = [];
      }
      app.getForecast(key, label);
      app.selectedCities.push({key: key, label: label});
      app.saveSelectedCities();
      app.toggleAddDialog(false);
    });
  
    document.getElementById('butAddCancel').addEventListener('click', function() {
      // Close the add new city dialog
      app.toggleAddDialog(false);
    });
  
  
    /*****************************************************************************
     *
     * Methods to update/refresh the UI
     *
     ****************************************************************************/
  
    // Toggles the visibility of the add new city dialog.
    app.toggleAddDialog = function(visible) {
      if (visible) {
        app.addDialog.classList.add('dialog-container--visible');
      } else {
        app.addDialog.classList.remove('dialog-container--visible');
      }
    };
  
    app.updateForecastCard = function(data) {
      var card = app.visibleCards[data.key];
      if (!card) {
        card = app.cardTemplate.cloneNode(true);
        card.classList.remove('cardTemplate');
        
        card.querySelector('.buy-date').textContent = new Date(data.ticket['timestamp']).toLocaleDateString();
        card.querySelector('.buy-time').textContent = new Date(data.ticket['timestamp']).toLocaleTimeString();
        card.querySelector('.ticket-code').textContent = data.ticket['ticketCode'];
        card.querySelector('.event-name').textContent = data.details['name'];
        card.querySelector('.event-place').textContent = data.details['place'];
        card.querySelector('.event-date').textContent = data.details['date'];
        card.querySelector('.event-time').textContent = data.details['time'];
        let adNum = parseInt(data.ticket['adults']);
        let childNum = parseInt(data.ticket['children']);
        let adText = card.querySelector('.adults');
        let childText = card.querySelector('.children');
        if (adNum) {
          if (adNum == 1) adText.textContent = '1 vuxen á ' + data.details['adultPrice'] + ' kr';
          else adText.textContent = adNum + ' vuxna á ' + data.details['adultPrice'] + ' kr';
        }
        if (childNum) childText.textContent = childNum + ' barn á ' + data.details['childPrice'] + ' kr';
        card.querySelector('.amount').textContent = data.ticket['amount'];
        card.querySelector('.event-info').textContent = data.details['info'];
        
        card.removeAttribute('hidden');
        app.container.appendChild(card);
        app.visibleCards[data._id] = card;
      }

      if (app.isLoading) {
        app.spinner.setAttribute('hidden', true);
        app.container.removeAttribute('hidden');
        app.isLoading = false;
      }
    };
  
  
    /*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/
  
    /*
     * Gets a forecast for a specific city and updates the card with the data.
     * getForecast() first checks if the weather data is in the cache. If so,
     * then it gets that data and populates the card with the cached data.
     * Then, getForecast() goes to the network for fresh data. If the network
     * request goes through, then the card gets updated a second time with the
     * freshest data.
     */
    app.getForecast = function(key, label) {
      var statement = 'select * from weather.forecast where woeid=' + key;
      var url = 'https://query.yahooapis.com/v1/public/yql?format=json&q=' +
          statement;
      // TODO add cache logic here
  
      // Fetch the latest data.
      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE) {
          if (request.status === 200) {
            var response = JSON.parse(request.response);
            var results = response.query.results;
            results.key = key;
            results.label = label;
            results.created = response.query.created;
            app.updateForecastCard(results);
          }
        } else {
          // Return the initial weather forecast since no data is available.
          app.updateForecastCard(initialWeatherForecast);
        }
      };
      request.open('GET', url);
      request.send();
    };
  
    // Iterate all of the cards and attempt to get the latest forecast data
    app.updateForecasts = function() {
      var keys = Object.keys(app.visibleCards);
      keys.forEach(function(key) {
        app.getForecast(key);
      });
    };
  
    // Save list of cities to localStorage.
    app.saveSelectedCities = function() {
      var selectedCities = JSON.stringify(app.selectedCities);
      //localStorage.selectedCities = selectedCities;
    };
  

    var initialWeatherForecast = {
      "ticket": {
        "_id": "AC-ZV-HI-HQ",
        "email": "bengtsn@gmail.com",
        "name": "Bengt S Nilsson",
        "phone": "070-555 93 50",
        "timestamp": 1542924255970.0,
        "eventCode": "AC",
        "ticketCode": "AC-ZV-HI-HQ",
        "amount": 0,
        "adults": 4,
        "children": 0,
        "method": 3,
        "status": 2,
        "fee": 0
      },
      "details": {
          "_id": "AC",
          "name": "Trettondagskonsert",
          "date": "4 januari",
          "place": "Gryts kyrka",
          "time": "16.00",
          "adultPrice": 0,
          "childPrice": 0,
          "info": "Frivilliga bidrag tas emot på plats"
      }
    };
    // TODO uncomment line below to test app with fake data
    app.updateForecastCard(initialWeatherForecast);
  
  /************************************************************************
     *
     * Code required to start the app
     *
     * NOTE: To simplify this codelab, we've used localStorage.
     *   localStorage is a synchronous API and has serious performance
     *   implications. It should not be used in production applications!
     *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
     *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
     ************************************************************************/
    /*
    app.selectedCities = localStorage.selectedCities;
    if (app.selectedCities) {
      app.selectedCities = JSON.parse(app.selectedCities);
      app.selectedCities.forEach(function(city) {
        app.getForecast(city.key, city.label);
      });
    } else {
      /* The user is using the app for the first time, or the user has not
       * saved any cities, so show the user some fake data. A real app in this
       * scenario could guess the user's location via IP lookup and then inject
       * that data into the page. */
      /*
      app.updateForecastCard(initialWeatherForecast);
      app.selectedCities = [
        {key: initialWeatherForecast.key, label: initialWeatherForecast.label}
      ];
      app.saveSelectedCities();
    }*/
  
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
               .register('./service-worker.js')
               .then(function() { console.log('Service Worker Registered'); });
    }
  })();