// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const burgerMenu = document.querySelector('[data-role="BurgerMenu"]');
  const mobileMenu = document.querySelector('[data-role="MobileMenu"]');
  const closeMenu = document.querySelector('[data-role="CloseMobileMenu"]');
  const bannerCarousel = document.getElementById('bannerCarousel');
  
  // Open mobile menu
  burgerMenu.addEventListener('click', function() {
    mobileMenu.style.display = 'block';
    document.body.style.overflow = 'hidden';
    // Hide banner when menu opens
    if (bannerCarousel) {
bannerCarousel.classList.add('menu-open');
    }
  });
  
  // Close mobile menu
  closeMenu.addEventListener('click', function() {
    mobileMenu.style.display = 'none';
    document.body.style.overflow = 'auto';
    // Show banner when menu closes
    if (bannerCarousel) {
bannerCarousel.classList.remove('menu-open');
    }
  });
  
  // Close mobile menu when clicking outside
  mobileMenu.addEventListener('click', function(e) {
    if (e.target === mobileMenu) {
mobileMenu.style.display = 'none';
document.body.style.overflow = 'auto';
// Show banner when menu closes
if (bannerCarousel) {
  bannerCarousel.classList.remove('menu-open');
}
    }
  });
  
  // Banner Carousel functionality
  const bannerContainer = document.getElementById('bannerContainer');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dots = document.querySelectorAll('.banner-dot');
  let currentSlide = 0;
  const totalSlides = 2;
  let autoSlideInterval;
  
  // Function to update carousel position
  function updateCarousel() {
    bannerContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update dots
    dots.forEach((dot, index) => {
if (index === currentSlide) {
  dot.classList.add('active');
} else {
  dot.classList.remove('active');
}
    });
  }
  
  // Next slide
  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
    resetAutoSlide();
  }
  
  // Previous slide
  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
    resetAutoSlide();
  }
  
  // Go to specific slide
  function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
    resetAutoSlide();
  }
  
  // Auto-slide functionality (optional - auto-rotates every 5 seconds)
  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000);
  }
  
  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }
  
  // Event listeners for arrows
  if (nextBtn) {
    nextBtn.addEventListener('click', nextSlide);
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', prevSlide);
  }
  
  // Event listeners for dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });
  
  // Touch/swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  bannerContainer.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  bannerContainer.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance for a swipe
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
if (diff > 0) {
  // Swipe left - next slide
  nextSlide();
} else {
  // Swipe right - previous slide
  prevSlide();
}
    }
  }
  
  // Start auto-slide
  startAutoSlide();
  
  // Pause auto-slide on hover (desktop)
  const carousel = document.getElementById('bannerCarousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', () => {
clearInterval(autoSlideInterval);
    });
    
    carousel.addEventListener('mouseleave', () => {
startAutoSlide();
    });
  }
});









function openKidsModal() {
  console.log('openKidsModal called');
  const modal = document.getElementById('kidsModal');
  if (modal) {
    console.log('Modal element found, setting display to block');
    modal.style.display = 'block';
    modal.style.zIndex = '1001'; // Ensure it's above other elements
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  } else {
    console.error('kidsModal element not found');
  }
}

function closeKidsModal() {
  document.getElementById('kidsModal').style.display = 'none';
  document.body.style.overflow = 'auto'; // Restore scrolling
}

function submitKidsModal(event) {
  event.preventDefault();
  
  const form = document.getElementById('kidsModalForm');
  const formData = new FormData(form);
  
  // Get form values
  const flatNo = formData.get('flatno');
  const childName = formData.get('childname');
  const age = formData.get('ag');
  
  // Create hidden form for submission
  const hiddenForm = document.createElement('form');
  hiddenForm.method = 'POST';
  hiddenForm.action = 'https://docs.google.com/forms/d/e/1FAIpQLSehlzohBowDkQbNMZwgutnmg8QTrtJpOxzVcccZL6sxCMftwg/formResponse';
  hiddenForm.target = 'hidden-iframe';
  hiddenForm.style.display = 'none';
  
  // Add form fields
  const fields = [
    { name: 'entry.1334472200', value: flatNo },
    { name: 'entry.675098627', value: childName },
    { name: 'entry.418234604', value: age },
    { name: 'submit', value: 'Submit' }
  ];
  
  fields.forEach(field => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = field.name;
    input.value = field.value;
    hiddenForm.appendChild(input);
  });
  
  // Create hidden iframe
  const iframe = document.createElement('iframe');
  iframe.name = 'hidden-iframe';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  document.body.appendChild(hiddenForm);
  
  // Submit form using native submit method
  const submitButton = document.createElement('input');
  submitButton.type = 'submit';
  submitButton.style.display = 'none';
  hiddenForm.appendChild(submitButton);
  submitButton.click();
  
  // Clean up after submission
  setTimeout(() => {
    if (document.body.contains(hiddenForm)) {
document.body.removeChild(hiddenForm);
    }
    if (document.body.contains(iframe)) {
document.body.removeChild(iframe);
    }
  }, 2000);
  
  // Show success message in the modal
  const modalBody = document.querySelector('#kidsModal .modal-body');
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 40px 20px;">
<div style="color: #28a745; font-size: 48px; margin-bottom: 20px;">✓</div>
<h3 style="color: #28a745; margin-bottom: 15px;">Submitted Successfully!</h3>
<p style="color: #666; font-size: 16px;">Your Kids Activities registration has been submitted successfully.</p>
    </div>
  `;
  
  // Close modal after 2 seconds
  setTimeout(() => {
    closeKidsModal();
    // Reset modal content for next use
    setTimeout(() => {
modalBody.innerHTML = `
  <form id="kidsModalForm" class="modal-rsvp-form" onsubmit="submitKidsModal(event)">
    <div class="modal-form-group">
      <label for="kidsFlatNo">Flat No *</label>
      <input type="text" id="kidsFlatNo" name="flatno" placeholder="Flat No *" required class="modal-form-input" style="text-transform: uppercase;" oninput="this.value = this.value.toUpperCase()">
    </div>
    <div class="modal-form-group">
      <label for="kidsChildName">Child Name *</label>
      <input type="text" id="kidsChildName" name="childname" placeholder="Child Name *" required class="modal-form-input">
    </div>
    <div class="modal-form-group">
      <label for="kidsAge">Age</label>
      <input type="number" id="kidsAge" name="ag" placeholder="Age" class="modal-form-input" min="1" max="18">
    </div>
    <div class="modal-form-actions">
      <button type="submit" class="modal-submit-button">
        <span>Submit</span>
      </button>
    </div>
  </form>
`;
    }, 500);
  }, 2000);
}

function openResidentModal() {
  console.log('openResidentModal called');
  const modal = document.getElementById('residentModal');
  if (modal) {
    console.log('Resident modal element found, setting display to block');
    modal.style.display = 'block';
    modal.style.zIndex = '1001'; // Ensure it's above other elements
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  } else {
    console.error('residentModal element not found');
  }
}

function closeResidentModal() {
  document.getElementById('residentModal').style.display = 'none';
  document.body.style.overflow = 'auto'; // Restore scrolling
}

function submitResidentModal(event) {
  event.preventDefault();
  
  const form = document.getElementById('residentModalForm');
  const formData = new FormData(form);
  
  // Get form values
  const flatNo = formData.get('flatno');
  const name = formData.get('name');
  const age = formData.get('age');
  
  // Create hidden form for submission
  const hiddenForm = document.createElement('form');
  hiddenForm.method = 'POST';
  hiddenForm.action = 'https://docs.google.com/forms/d/e/1FAIpQLSflLxDK2sLSF_wQIkmc6uJKjZKsEoQOfV9ZKKmQrQJvkKkuGw/formResponse';
  hiddenForm.target = 'hidden-iframe-resident';
  hiddenForm.style.display = 'none';
  
  // Add form fields
  const fields = [
    { name: 'entry.556153216', value: flatNo },
    { name: 'entry.1547567172', value: name },
    { name: 'entry.173729754', value: age },
    { name: 'submit', value: 'Submit' }
  ];
  
  fields.forEach(field => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = field.name;
    input.value = field.value;
    hiddenForm.appendChild(input);
  });
  
  // Create hidden iframe
  const iframe = document.createElement('iframe');
  iframe.name = 'hidden-iframe-resident';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  document.body.appendChild(hiddenForm);
  
  // Submit form using native submit method
  const submitButton = document.createElement('input');
  submitButton.type = 'submit';
  submitButton.style.display = 'none';
  hiddenForm.appendChild(submitButton);
  submitButton.click();
  
  // Clean up after submission
  setTimeout(() => {
    if (document.body.contains(hiddenForm)) {
document.body.removeChild(hiddenForm);
    }
    if (document.body.contains(iframe)) {
document.body.removeChild(iframe);
    }
  }, 2000);
  
  // Show success message in the modal
  const modalBody = document.querySelector('#residentModal .modal-body');
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 40px 20px;">
<div style="color: #28a745; font-size: 48px; margin-bottom: 20px;">✓</div>
<h3 style="color: #28a745; margin-bottom: 15px;">Submitted Successfully!</h3>
<p style="color: #666; font-size: 16px;">Your Resident Games registration has been submitted successfully.</p>
    </div>
  `;
  
  // Close modal after 2 seconds
  setTimeout(() => {
    closeResidentModal();
    // Reset modal content for next use
    setTimeout(() => {
modalBody.innerHTML = `
  <form id="residentModalForm" class="modal-rsvp-form" onsubmit="submitResidentModal(event)">
    <div class="modal-form-group">
      <label for="residentFlatNo">Flat No *</label>
      <input type="text" id="residentFlatNo" name="flatno" placeholder="Flat No *" required class="modal-form-input" style="text-transform: uppercase;" oninput="this.value = this.value.toUpperCase()">
    </div>
    <div class="modal-form-group">
      <label for="residentName">Name *</label>
      <input type="text" id="residentName" name="name" placeholder="Name *" required class="modal-form-input">
    </div>
    <div class="modal-form-group">
      <label for="residentAge">Age</label>
      <input type="number" id="residentAge" name="age" placeholder="Age" class="modal-form-input" min="1" max="100">
    </div>
    <div class="modal-form-actions">
      <button type="submit" class="modal-submit-button">
        <span>Submit</span>
      </button>
    </div>
  </form>
`;
    }, 500);
  }, 2000);
}

function openStallsModal() {
  console.log('openStallsModal called');
  const modal = document.getElementById('stallsModal');
  if (modal) {
    console.log('Stalls modal element found, setting display to block');
    modal.style.display = 'block';
    modal.style.zIndex = '1001'; // Ensure it's above other elements
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  } else {
    console.error('stallsModal element not found');
  }
}

function closeStallsModal() {
  document.getElementById('stallsModal').style.display = 'none';
  document.body.style.overflow = 'auto'; // Restore scrolling
}

function submitStallsModal(event) {
  event.preventDefault();
  
  const form = document.getElementById('stallsModalForm');
  const formData = new FormData(form);
  
  // Get form values
  const flatNo = formData.get('flatno');
  const stallType = formData.get('stalltype');
  const stallId = formData.get('stallid');
  const phone = formData.get('phone');
  const name = formData.get('name');
  
  // Create hidden form for submission
  const hiddenForm = document.createElement('form');
  hiddenForm.method = 'POST';
  hiddenForm.action = 'https://docs.google.com/forms/d/e/1FAIpQLSeWno4kAz4qb0nOPjrHHPwutRx_u9kreu3aHEudRiMIX2BjEA/formResponse';
  hiddenForm.target = 'hidden-iframe-stalls';
  hiddenForm.style.display = 'none';
  
  // Add form fields
  const fields = [
    { name: 'entry.1942657558', value: flatNo },
    { name: 'entry.1061335196', value: stallType },
    { name: 'entry.140136422', value: stallId },
    { name: 'entry.472708449', value: phone },
    { name: 'entry.794930411', value: name },
    { name: 'submit', value: 'Submit' }
  ];
  
  fields.forEach(field => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = field.name;
    input.value = field.value;
    hiddenForm.appendChild(input);
  });
  
  // Create hidden iframe
  const iframe = document.createElement('iframe');
  iframe.name = 'hidden-iframe-stalls';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  document.body.appendChild(hiddenForm);
  
  // Submit form using native submit method
  const submitButton = document.createElement('input');
  submitButton.type = 'submit';
  submitButton.style.display = 'none';
  hiddenForm.appendChild(submitButton);
  submitButton.click();
  
  // Clean up after submission
  setTimeout(() => {
    if (document.body.contains(hiddenForm)) {
document.body.removeChild(hiddenForm);
    }
    if (document.body.contains(iframe)) {
document.body.removeChild(iframe);
    }
  }, 2000);
  
  // Show success message in the modal
  const modalBody = document.querySelector('#stallsModal .modal-body');
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 40px 20px;">
<div style="color: #28a745; font-size: 48px; margin-bottom: 20px;">✓</div>
<h3 style="color: #28a745; margin-bottom: 15px;">Submitted Successfully!</h3>
<p style="color: #666; font-size: 16px;">Your Stalls and Play Zone registration has been submitted successfully.</p>
    </div>
  `;
  
  // Close modal after 2 seconds
  setTimeout(() => {
  closeStallsModal();
    // Reset modal content for next use
    setTimeout(() => {
modalBody.innerHTML = `
  <form id="stallsModalForm" class="modal-rsvp-form" onsubmit="submitStallsModal(event)">
    <div class="modal-form-group">
      <label for="stallsFlatNo">Flat No *</label>
      <input type="text" id="stallsFlatNo" name="flatno" placeholder="Flat No *" required class="modal-form-input" style="text-transform: uppercase;" oninput="this.value = this.value.toUpperCase()">
    </div>
    <div class="modal-form-group">
      <label for="stallsStallType">Stall Type *</label>
      <input type="text" id="stallsStallType" name="stalltype" placeholder="Stall Type *" required class="modal-form-input">
    </div>
    <div class="modal-form-group">
      <label for="stallsStallId">Stall ID *</label>
      <input type="text" id="stallsStallId" name="stallid" placeholder="Stall ID *" required class="modal-form-input">
    </div>
    <div class="modal-form-group">
      <label for="stallsPhone">Phone *</label>
      <input type="tel" id="stallsPhone" name="phone" placeholder="Phone *" required class="modal-form-input">
    </div>
    <div class="modal-form-group">
      <label for="stallsName">Name *</label>
      <input type="text" id="stallsName" name="name" placeholder="Name *" required class="modal-form-input">
    </div>
    <div class="modal-form-group">
      <div class="checkbox-container">
        <input type="checkbox" id="stallsTerms" name="terms" required class="modal-checkbox">
        <label for="stallsTerms" class="checkbox-label">
          I agree to the <a href="./stall-terms-and-conditions.html" target="_blank" class="terms-link">Terms & Conditions for Stall Participation</a> *
        </label>
      </div>
    </div>
    <div class="modal-form-actions">
      <button type="submit" class="modal-submit-button">
        <span>Submit</span>
      </button>
    </div>
  </form>
`;
    }, 500);
  }, 2000);
}

function openIdeasModal() {
  console.log('openIdeasModal called');
  const modal = document.getElementById('ideasModal');
  if (modal) {
    console.log('Ideas modal element found, setting display to block');
    modal.style.display = 'block';
    modal.style.zIndex = '1001'; // Ensure it's above other elements
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  } else {
    console.error('ideasModal element not found');
  }
}

function closeIdeasModal() {
  document.getElementById('ideasModal').style.display = 'none';
  document.body.style.overflow = 'auto'; // Restore scrolling
}

function submitIdeasModal(event) {
  event.preventDefault();
  
  const form = document.getElementById('ideasModalForm');
  const formData = new FormData(form);
  
  // Get form values
  const flatNo = formData.get('flatno');
  const activity = formData.get('activity');
  const phone = formData.get('phone');
  const name = formData.get('name');
  
  // Create URL with query parameters
  const baseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSePEC2ggFLn7RTHHNb8PBUUngYqFuXyG4DQgFIgyOBAEg-KEA/formResponse';
  const queryParams = new URLSearchParams({
    'entry.1942657558': flatNo,
    'entry.1061335196': activity,
    'entry.472708449': phone,
    'entry.794930411': name,
    'submit': 'Submit'
  });
  
  const fullUrl = `${baseUrl}?${queryParams.toString()}`;
  
  // Log the full URL with query parameters
  console.log('Submitting to URL:', fullUrl);
  console.log('Form data:', { flatNo, activity, phone, name });
  
  // Create hidden iframe for submission
  const iframe = document.createElement('iframe');
  iframe.name = 'hidden-iframe-ideas';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  // Navigate iframe to the URL with query parameters
  iframe.src = fullUrl;
  
  // Clean up after submission
  setTimeout(() => {
    if (document.body.contains(iframe)) {
document.body.removeChild(iframe);
    }
  }, 2000);
  
  // Show success message in the modal
  const modalBody = document.querySelector('#ideasModal .modal-body');
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 40px 20px;">
<div style="color: #28a745; font-size: 48px; margin-bottom: 20px;">✓</div>
<h3 style="color: #28a745; margin-bottom: 15px;">Submitted Successfully!</h3>
<p style="color: #666; font-size: 16px;">Your Ideas & Activities have been submitted successfully.</p>
    </div>
  `;
  
  // Close modal after 2 seconds
  setTimeout(() => {
    closeIdeasModal();
    // Reset modal content for next use
    setTimeout(() => {
modalBody.innerHTML = `
  <form id="ideasModalForm" class="modal-rsvp-form" onsubmit="submitIdeasModal(event)">
    <div class="modal-form-group">
      <label for="ideasFlatNo">Flat No *</label>
      <input type="text" id="ideasFlatNo" name="flatno" placeholder="Flat No *" required class="modal-form-input" style="text-transform: uppercase;" oninput="this.value = this.value.toUpperCase()">
    </div>
    <div class="modal-form-group">
      <label for="ideasActivity">Activity/Idea *</label>
      <input type="text" id="ideasActivity" name="activity" placeholder="Describe your activity or idea (e.g., Yoga session, Cultural dance, Special performance, etc.)" required class="modal-form-input">
    </div>
    <div class="modal-form-group">
      <label for="ideasPhone">Phone *</label>
      <input type="tel" id="ideasPhone" name="phone" placeholder="Phone *" required class="modal-form-input">
    </div>
    <div class="modal-form-group">
      <label for="ideasName">Name *</label>
      <input type="text" id="ideasName" name="name" placeholder="Name *" required class="modal-form-input">
    </div>
    <div class="modal-form-actions">
      <button type="submit" class="modal-submit-button">
        <span>Submit Ideas</span>
      </button>
    </div>
  </form>
`;
    }, 500);
  }, 2000);
}
