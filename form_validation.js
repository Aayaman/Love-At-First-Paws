document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.give');

    form.addEventListener('submit', function(event) {
        let isValid = 0;
        let isnotChecked = 0;

        const radioGroups = ['gender', 'friendly1', 'friendly2', 'friendly3'];

        radioGroups.forEach(group => {
            const radios = document.querySelectorAll(`input[name="${group}"]`);
            let isGroupChecked = false;
            radios.forEach(radio => {
                if (radio.checked) {
                    isGroupChecked = true;
                }
            });
            if (!isGroupChecked) {
                isnotChecked++;
            }
        });

        if( isnotChecked >= 1){
            event.preventDefault();
            alert('Please select at least one option!');
        }
        const textInputs = document.querySelectorAll('input[type="text"], input[type="textarea"]');
        textInputs.forEach(input => {
            if (input.value.trim() === '') {
                isValid++;
            }
        });
        if (isValid>=1) {
            event.preventDefault(); 
            alert('Please fill out every field!');
        } 
        
        const emailinput = document.getElementById('owner_email');
        const email = emailinput.value;
        function validEmail(email){
            const re = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
            return re.test(email);
        }
        if (!validEmail(email)){
            event.preventDefault(); 
            alert('Please enter a valid email address.')
        }
    });
});