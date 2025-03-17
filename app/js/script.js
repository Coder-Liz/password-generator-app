const passwordDisplay = document.querySelector('.password__display');
const passwordCopyButton = document.querySelector('.password__copy-btn');
const passwordCopiedNotification = document.querySelector(
  '.password__copied-text'
);

const passwordOptions = document.querySelector('.password__options');
const lengthSlider = document.querySelector('.password__slider');
const charCount = document.querySelector('.password__length');
const checkboxes = document.querySelectorAll('input[type=checkbox]');
const generateButton = document.querySelector('.password__generate-btn');

const strengthDescription = document.querySelector('.password__strength-text');
const strengthRatingBars = document.querySelectorAll('.password__bar');

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_-+=<>?',
};

let canCopy = false;

// Update slider value display
const updateSliderValue = () => {
  charCount.textContent = lengthSlider.value;
  styleRangeSlider();
};

// Style range slider dynamically
const styleRangeSlider = () => {
  const min = lengthSlider.min;
  const max = lengthSlider.max;
  const value = lengthSlider.value;
  lengthSlider.style.backgroundSize =
    ((value - min) * 100) / (max - min) + '% 100%';
};

// Reset meter bar styles
const resetBarStyle = () => {
  strengthRatingBars.forEach((bar) => {
    bar.style.backgroundColor = 'transparent';
    bar.style.borderColor = 'hsl(252, 11%, 91%)';
  });
};

// Apply styling to strength bars
const styleBars = (bars, color) => {
  bars.forEach((bar) => {
    bar.style.backgroundColor = color;
    bar.style.borderColor = color;
  });
};

// Determine password strength and apply corresponding styles
const styleMeter = (rating) => {
  const [text, numBars] = rating;
  const barsToFill = Array.from(strengthRatingBars).slice(0, numBars);

  resetBarStyle();
  strengthDescription.textContent = text;

  const colors = [
    'hsl(0, 91%, 63%)',
    'hsl(13, 95%, 66%)',
    'hsl(42, 91%, 68%)',
    'hsl(127, 100%, 82%)',
  ];

  if (numBars > 0) {
    styleBars(barsToFill, colors[numBars - 1]);
  }
};

// Calculate password strength based on entropy
const calcPasswordStrength = (passwordLength, charPoolSize) => {
  const strength = passwordLength * Math.log2(charPoolSize);

  if (strength < 25) return ['Too Weak', 1];
  if (strength < 50) return ['Weak', 2];
  if (strength < 75) return ['Medium', 3];
  return ['Strong', 4];
};

// Validate at least one checkbox is selected
const validateInput = () => {
  if (![...checkboxes].some((box) => box.checked)) {
    throw new Error('Select at least one character type.');
  }
};

// Generate a secure password
const generatePassword = (e) => {
  e.preventDefault();

  try {
    validateInput();

    let passwordArray = [];
    let includedSets = [];
    let charPoolSize = 0;

    checkboxes.forEach((box) => {
      if (box.checked) {
        includedSets.push(CHAR_SETS[box.value]);
        charPoolSize += CHAR_SETS[box.value].length;
      }
    });

    if (includedSets.length === 0) return;

    // Ensure all selected types are included at least once
    includedSets.forEach((set) => {
      passwordArray.push(set[Math.floor(Math.random() * set.length)]);
    });

    // Fill remaining password length randomly
    for (let i = passwordArray.length; i < lengthSlider.value; i++) {
      const randomSet =
        includedSets[Math.floor(Math.random() * includedSets.length)];
      passwordArray.push(
        randomSet[Math.floor(Math.random() * randomSet.length)]
      );
    }

    // Shuffle password
    passwordArray = passwordArray.sort(() => Math.random() - 0.5);
    const finalPassword = passwordArray.join('');

    // Calculate strength and update meter
    const strength = calcPasswordStrength(lengthSlider.value, charPoolSize);
    styleMeter(strength);

    // Display password
    passwordDisplay.textContent = finalPassword;
    canCopy = true;
  } catch (error) {
    console.error(error.message);
  }
};

// Copy password to clipboard
const copyPassword = async () => {
  if (!canCopy || !passwordDisplay.textContent) return;

  try {
    await navigator.clipboard.writeText(passwordDisplay.textContent);
    passwordCopiedNotification.textContent = 'Copied!';
    passwordCopiedNotification.style.opacity = 1;

    setTimeout(() => {
      passwordCopiedNotification.style.opacity = 0;
      setTimeout(() => {
        passwordCopiedNotification.textContent = '';
      }, 1000);
    }, 1000);
  } catch (error) {
    console.error('Copy failed:', error);
  }
};

// Attach event listeners
passwordCopyButton.addEventListener('click', copyPassword);
generateButton.addEventListener('click', generatePassword);
// passwordOptions.addEventListener('change', generatePassword);
lengthSlider.addEventListener('input', updateSliderValue);

// Initialize values on page load
lengthSlider.value = 0;
updateSliderValue();

checkboxes.forEach((checkbox) => {
  checkbox.checked = false;
});
