document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('pet-form').addEventListener('submit', function (event) {
      event.preventDefault();
  
      // Get user-selected criteria
      const pet_type = document.getElementById('pet_type').value;
      const cat_breed = document.getElementById('cat_breed').value;
      const dog_breed = document.getElementById('dog_breed').value;
      const age = document.getElementById('age').value;
      const gender = document.querySelector('input[name="gender"]:checked')?.value;
      const friendlyWithDogs = document.querySelector('input[name="friendly1"]:checked')?.value;
      const friendlyWithCats = document.querySelector('input[name="friendly2"]:checked')?.value;
      const suitableForChildren = document.querySelector('input[name="friendly3"]:checked')?.value;
  
      // Fetch and process pets.txt
      fetch('pets.txt')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch pets.txt');
          }
          return response.text();
        })
        .then(data => {
          const lines = data.split('\n').slice(1); // Skip the header line
          const matchingPets = [];
  
          lines.forEach(line => {
            const fields = line.trim().split(':');
            if (fields.length < 10) return; // skip incomplete lines
  
            const petType = fields[2];
            const catBreed = fields[3];
            const dogBreed = fields[4];
            const petAge = fields[5];
            const petGender = fields[6];
            const petFriendlyWithDogs = fields[7];
            const petFriendlyWithCats = fields[8];
            const petSuitableForChildren = fields[9];
  
            // Match dog
            if (
              petType === pet_type &&
              (dog_breed === "Doesn't matter" || dogBreed === dog_breed) &&
              (age === "Doesn't matter" || petAge === age) &&
              (gender === "Doesn't matter" || petGender === gender) &&
              petFriendlyWithDogs === friendlyWithDogs &&
              petFriendlyWithCats === friendlyWithCats &&
              petSuitableForChildren === suitableForChildren
            ) {
              matchingPets.push({
                petType,
                catBreed,
                dogBreed,
                petAge,
                petGender,
                petFriendlyWithDogs,
                petFriendlyWithCats,
                petSuitableForChildren,
              });
            }
  
            // Match cat
            if (
              petType === pet_type &&
              (cat_breed === "Doesn't matter" || catBreed === cat_breed) &&
              (age === "Doesn't matter" || petAge === age) &&
              (gender === "Doesn't matter" || petGender === gender) &&
              petFriendlyWithDogs === friendlyWithDogs &&
              petFriendlyWithCats === friendlyWithCats &&
              petSuitableForChildren === suitableForChildren
            ) {
              matchingPets.push({
                petType,
                catBreed,
                dogBreed,
                petAge,
                petGender,
                petFriendlyWithDogs,
                petFriendlyWithCats,
                petSuitableForChildren,
              });
            }
          });
  
          // Display results
          const petResults = document.getElementById('pet-results');
          const noResults = document.getElementById('no-results');
          petResults.innerHTML = ''; // Clear previous results
  
          if (matchingPets.length > 0) {
            noResults.style.display = 'none';
            matchingPets.forEach(pet => {
              const petItem = document.createElement('li');
              petItem.classList.add('alert_li');
              petItem.innerHTML = `
                <p>Pet type: ${pet.petType}</p>
                <p>Dog breed: ${pet.dogBreed}</p>
                <p>Cat breed: ${pet.catBreed}</p>
                <p>Age: ${pet.petAge}</p>
                <p>Gender: ${pet.petGender}</p>
                <p>Friendly with dogs: ${pet.petFriendlyWithDogs}</p>
                <p>Friendly with cats: ${pet.petFriendlyWithCats}</p>
                <p>Suitable for a family with pets: ${pet.petSuitableForChildren}</p>
              `;
              petResults.appendChild(petItem);
            });
          } else {
            noResults.style.display = 'block';
          }
        })
        .catch(error => {
          console.error('Error fetching pets.txt:', error);
        });
    });
  });