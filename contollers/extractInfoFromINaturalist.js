const { BROWSER } = require("../helpers/loadPuppeteer");

module.exports ={
    extractFromINaturalist: async () => {
        console.log('Launching browser...');
        const browser = await BROWSER();
      
        try {
          const page = await browser.newPage();
          console.log('Navigating to iNaturalist observations page...');
      
          // Go to the specified iNaturalist observations page
          await page.goto('https://www.inaturalist.org/observations?user_id=lehoa2025&place_id=any&verifiable=any', {
            waitUntil: 'networkidle2',
            timeout: 60000 // Set timeout to 60 seconds
          });
          console.log('Page successfully loaded.');
      
          // Wait for observation cards to load
          console.log('Waiting for observation cards to load...');
          await page.waitForSelector('.thumbnail.borderless.d-flex.flex-column');
      
          // Extract links for each observation
          console.log('Extracting observation links...');
          const observationLinks = await page.evaluate(() => {
            // Select all observation links
            const linkElements = document.querySelectorAll('.thumbnail.borderless.d-flex.flex-column a.photo.has-photo');
            return Array.from(linkElements).map((linkElement) => linkElement.href);
          });
      
          // Array to store detailed observations, including species, image, coordinates, and link
          const detailedObservations = [];
      
          // Visit each observation link to extract detailed information
          for (let i = 0; i < observationLinks.length; i++) {
            const observationLink = observationLinks[i];
            console.log(`Navigating to observation page: ${observationLink}`);
      
            try {
              // Open each observation link
              await page.goto(observationLink, {
                waitUntil: 'networkidle2',
                timeout: 60000 // Set timeout to 60 seconds
              });
      
              // Explicitly wait for the species name or other important elements to load
              await page.waitForSelector('.top_container', { timeout: 10000 });
      
              // Extract details from the individual observation page
              console.log(`Extracting details for observation ${i + 1}...`);
              const observationDetails = await page.evaluate(() => {
                // Extract species name
                const speciesElement = document.querySelector('.container .ObservationTitle .comname.display-name');
                const species = speciesElement ? speciesElement.textContent.trim() : 'Unknown Species';
                
                //container for species and image
                const container = document.querySelector('.top_container');
    
                // Extract image URL from the individual observation page
                const imageElement = container.querySelector('.image-gallery-image img');
                const imageUrl = imageElement ? imageElement.src : 'No image available';
      
                // Extract coordinates (latitude and longitude)
                const coordinatesElement = container.querySelector('#latlng');
                let latitude = 'N/A';
                let longitude = 'N/A';
                if (coordinatesElement) {
                  const coordinatesText = coordinatesElement.textContent.trim();
                  const [lat, long] = coordinatesText.split(',').map(coord => coord.trim());
                  latitude = lat;
                  longitude = long;
                }
      
                return {
                  species,
                  imageUrl,
                  coordinates: {
                    latitude,
                    longitude
                  }
                };
              });
      
              // Add the observation link to the extracted details
              observationDetails.link = observationLink;
      
              // Add the extracted information to the detailedObservations array
              detailedObservations.push(observationDetails);
      
            } catch (error) {
              console.log(`Error occurred while processing observation link ${observationLink}:`, error.message);
            }
      
            // Wait a bit between page visits to avoid overloading the server
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
      
          // Print the extracted information for each observation
          console.log('Printing detailed observations:');
          detailedObservations.forEach((obs, index) => {
            console.log(`Observation #${index + 1}:`);
            console.log('Species:', obs.species);
            console.log('Image URL:', obs.imageUrl);
            console.log('Coordinates:', obs.coordinates);
            console.log('Link:', obs.link);
            console.log('------------------------');
          });
      
        } catch (error) {
          console.error('An error occurred during the scraping process:', error.message);
        } finally {
          console.log('Closing browser...');
          await browser.close();
          console.log('Browser closed.');
        }
      }
}