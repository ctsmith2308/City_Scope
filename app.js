$(document).ready(function() {
  // MATERIALIZE jQuery
  $('.slider').slider();
  $('.dropdown-trigger').dropdown();
  $('.sidenav').sidenav();

  // States array to be appended dynamically
  let states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
    'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
    'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
    'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
    'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI',
    'WY'
  ]
  // Category array to be appended dynamically
  let categories = [
    'Accounting/Finance', 'Administrative', 'Analyst', 'Architecture/Drafting', 'Art/Design/Entertainment',
    'Banking/Loan/Insurance', 'Beauty/Wellness', 'Business Development/Consulting', 'Education',
    'Engineering (Non-Software)', 'General Labor', 'Hospitality', 'Human Resources',
    'Installation/Maintenance', 'Legal', 'Manufacturing/Construction', 'Marketing/Advertising',
    'Medical/Healthcare', 'Non-profit', 'Product Management', 'Real-Estate', 'Restaurant', 'Retail',
    'Sales/Customer Service', 'Science/Research', 'Security/Law Enforcement', 'Management', 'Skilled Trade',
    'Software Development/IT', 'Sports/Fitness', 'Travel/Transportation', 'Writing/Editing/Publishing',
    'Other'
  ]
  // Appends categories to dropdown selector dynamically
  appendCategories = (arrayOfCategories) => {
    arrayOfCategories.forEach((category, idx) => {
      $('#categoryDropDownSelector').append(`<option value=${idx+1}>${category}</option>`)
      $('select').select(); // This is needed to append values dynamically as per Materialize docs
    })
  }
  appendCategories(categories)

  // Appends states to dropdown selector dynamically
  appendStates = (arrayOfStates) => {
    arrayOfStates.forEach(state => {
      $('#stateDropDownSelector').append(`<option value=${state}>${state}</option>`)
      $('select').select(); // This is needed to append values dynamically as per Materialize docs
    })
  }
  appendStates(states)

  formSubmitter = () => {
    $('#input_form').submit(function(e) {
      e.preventDefault()
      let city = $('#city_input').val(),
        job = $('#categoryDropDownSelector').val(),
        state = $('#stateDropDownSelector').val()
      // converts user input to allCaps as per params AJAX call
      convert_case = (str) => {
        let lower = str.toLowerCase();
        return lower.replace(/(^| )(\w)/g, function(x) {
          return x.toUpperCase();
        });
      }
      let input = convert_case(city)
      getWeather(input, state)
      getGas(input, state)
      getJobs(input, state, job)
    })
  }
  formSubmitter()
  // Clear Searches
  $('#clearButton').click(function() {
    event.preventDefault();
    $("#svgTemp").remove()
    $("#svgGas").remove()
    $("#svgJobs").remove()
    $(".city_Name").remove()
  })
  // Weather Call
  getWeather = (input, state) => {
    axios.get('http://api.openweathermap.org/data/2.5/weather', {
        params: {
          APPID: keys.openWeatherkey,
          id: 524901,
          q: input
        }
      })
      .then(function(res) {
        $('.tempCanvas').append(`<h5 class="white-text city_Name">${input},${state}</h5>`)
        let temp = (res.data.main.temp_max * 1.8 - 459.87).toFixed()
        // Append svg to class and set attributes
        let createSvg = d3.select(".tempCanvas").append('svg')
          .attr('id', 'svgTemp')
          .attr('width', 400)
          .attr('height', 200)
        // Append circle to svg and set attributes
        let createCircle = createSvg.append("circle")
          .attr('cx', 200)
          .attr('cy', 100)
          .attr('r', 5)
          .style("stroke", "#0BC6A5")
          .style("stroke-width", 5)
          .style("fill", "none")
        //Append text to svg and set attributes
        let text = createSvg.append("text")
          .attr("text-anchor", "middle")
          .attr('x', 200)
          .attr('y', 105)
          .attr("fill", "white")
          .style("stroke-width", 1)
          .style("font-size", "0.1px")
          .text(temp + "°F")
        // Set circle transition
        createCircle.transition().duration(3000).attr('r', temp);
        text.transition().duration(3000).style("font-size", "18px");

      })
      .catch(function(error) {
        console.log(error);
      });
  }

  // Gas Call
  getGas = (input, state) => {
    axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          'key': keys.googleKey,
          'address': input
        }
      })
      .then(function(res) {
        let lat = res.data.results[0].geometry.location.lat;
        let long = res.data.results[0].geometry.location.lng;
        // AJAX call to mygasfeed API
        axios.get(`http://api.mygasfeed.com/stations/radius/${lat}/${long}/10/mid/price/aw9e0drwjg.json?callback?`)
          .then(function(res) {
            $('.gasCanvas').append(`<h5 class="white-text city_Name">${input},${state}</h5>`)

            let price = res.data.stations[3].reg_price - .25
            let expand = (res.data.stations[3].reg_price - .25) * 18
            // Append svg to class and set attributes
            let createSvg = d3.select(".gasCanvas").append('svg')
              .attr('id', 'svgGas')
              .attr('width', 400)
              .attr('height', 200)
            // Append circle to svg and set attributes
            let createCircle = createSvg.append("circle")
              .attr('cx', 200)
              .attr('cy', 100)
              .attr('r', 5)
              .style("stroke", "#0BC6A5")
              .style("stroke-width", 5)
              .style("fill", "none")
            // Append text to svg and set attributes
            let text = createSvg.append("text")
              .attr("text-anchor", "middle")
              .attr('x', 200)
              .attr('y', 105)
              .attr("fill", "white")
              .style("stroke-width", 1)
              .style("font-size", "0.1px")
              .text("$" + price.toFixed(2) + " gal")
            // Set circle transition
            createCircle.transition().duration(3000).attr('r', expand);
            text.transition().duration(3000).style("font-size", "18px");
          })
          .catch(function(error) {
            console.log(error);
          })
      }).catch(function(error) {
        console.log(error);
      })
  }
  // Job Ajax Call
  getJobs = (input, state, job) => {
    axios.get("http://api.glassdoor.com/api/api.htm", {
        params: {
          v: "1",
          format: "json",
          "t.p": "187711",
          "t.k": keys.glassdoorKey,
          userip: "208.184.3.194",
          useragent: "Chrome/60.0.3112.113",
          action: "jobs-stats",
          city: input,
          state: state,
          jc: job,
          returnCities: "true",
        }
      })
      .then(function(res) {
        $('.jobCanvas').append(`<h5 class="white-text city_Name">${input},${state}</h5>`)

        let numberOfJobs = res.data["response"]["cities"][0]["numJobs"]
        // Formats numbers correctly with commas
        function numberWithCommas(value) {
          return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        let availableJobs = numberWithCommas(res.data['response']['cities'][0]['numJobs'])

        if (numberOfJobs > 5000) {
          numberOfJobs = "85px";
        } else {
          let x = (Math.cbrt(numberOfJobs) * 2) + "px";
          numberOfJobs = x.toString();
        }
        // Append svg to class and set attributes
        let createSvg = d3.select(".jobCanvas")
          .append('svg')
          .attr("id", "svgJobs")
          .attr('width', 400)
          .attr('height', 200)
        // Append circle to svg and set attributes
        let createCircle = createSvg.append("circle")
          .attr('cx', 200)
          .attr('cy', 100)
          .attr('r', 5)
          .style("stroke", "#0BC6A5")
          .style("stroke-width", 5)
          .style("fill", "none")
        // Append text to svg and set attributes
        let text = createSvg.append("text")
          .attr("text-anchor", "middle")
          .attr('x', 200)
          .attr('y', 105)
          .attr("fill", "white")
          .style("stroke-width", 1)
          .style("font-size", "0.1px")
          .text(availableJobs)
        createCircle.transition().duration(3000).attr('r', numberOfJobs);
        text.transition().duration(3000).style("font-size", "18px");
      })
      .catch(function(error) {
        console.log(error);
      })
  }

  // Scroll to element key.jsfunctions
  $(".bottom_Home_Link").click(function() {
    $('html, body').animate({
      scrollTop: $(".nav-wrapper").offset().top
    }, 1000);
  });

  $(".top").click(function() {
    $('html, body').animate({
      scrollTop: $(".page-footer").offset().top
    }, 1000);
  });

  // Closing function ready brackets/parens
});
