document.addEventListener('DOMContentLoaded', () => {

    // 1. Modal Open/Close Logic
    const openModalButtons = document.querySelectorAll('.open-modal');
    const closeModalButtons = document.querySelectorAll('.modal-close-btn');
    const modals = document.querySelectorAll('.modal');

    // General Slideshow Init Function
    const initializeSlideshow = (container) => {
        const track = container.querySelector('.slides-track');
        const slides = container.querySelectorAll('.slide');
        const totalSlides = slides.length;
        const dotsContainer = container.closest('.modal-content').querySelector('.slide-dots');
        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');
        const video = container.querySelector('video');

        let currentSlide = 0;

        // Create dots dynamically
        if (dotsContainer && totalSlides > 0) {
            dotsContainer.innerHTML = ''; // Clear existing
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('div');
                dot.className = `dot ${i === 0 ? 'active' : ''}`;
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }

        const updateDots = (index) => {
            if (!dotsContainer) return;
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        };

        const goToSlide = (index) => {
            if (index < 0 || index >= totalSlides || !track) return;
            currentSlide = index;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            updateDots(currentSlide);

            // Handle video playback if there is a video in this slideshow
            if (video) {
                const videoSlide = video.closest('.slide');
                const videoSlideIndex = Array.from(slides).indexOf(videoSlide);
                if (currentSlide === videoSlideIndex) {
                    video.play().catch(err => console.log('Auto-play blocked:', err));
                } else {
                    video.pause();
                }
            }
        };

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                let prevIndex = currentSlide - 1;
                if (prevIndex < 0) prevIndex = totalSlides - 1;
                goToSlide(prevIndex);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                let nextIndex = currentSlide + 1;
                if (nextIndex >= totalSlides) nextIndex = 0;
                goToSlide(nextIndex);
            });
        }

        return {
            goToSlide,
            nextSlide: () => {
                let nextIndex = currentSlide + 1;
                if (nextIndex >= totalSlides) nextIndex = 0;
                goToSlide(nextIndex);
            },
            prevSlide: () => {
                let prevIndex = currentSlide - 1;
                if (prevIndex < 0) prevIndex = totalSlides - 1;
                goToSlide(prevIndex);
            },
            reset: () => {
                goToSlide(0);
            },
            stopVideo: () => {
                if (video) {
                    video.pause();
                    video.currentTime = 0;
                }
            }
        };
    };

    // Store references to slideshows
    const slideshowControllers = {};
    document.querySelectorAll('.slideshow-container').forEach(container => {
        const modal = container.closest('.modal');
        if (modal) {
            slideshowControllers[modal.id] = initializeSlideshow(container);
        }
    });

    // Modal triggers
    openModalButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = button.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
                
                // If there is a slideshow controller, reset to slide 1 (index 0)
                if (slideshowControllers[modalId]) {
                    slideshowControllers[modalId].reset();
                }
            }
        });
    });

    const closeModal = (modal) => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
        
        // Stop any running video in this modal
        if (slideshowControllers[modal.id]) {
            slideshowControllers[modal.id].stopVideo();
        }
    };

    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Close modal when clicking outside content
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Keyboard navigation (Escape to close, Left/Right arrows to change slides of active modal)
    window.addEventListener('keydown', (e) => {
        const activeModal = document.querySelector('.modal.active');
        
        if (e.key === 'Escape') {
            if (activeModal) {
                closeModal(activeModal);
            }
        }

        // Only handle slide navigation if there is an active modal with a slideshow
        if (activeModal && slideshowControllers[activeModal.id]) {
            if (e.key === 'ArrowRight') {
                slideshowControllers[activeModal.id].nextSlide();
            } else if (e.key === 'ArrowLeft') {
                slideshowControllers[activeModal.id].prevSlide();
            }
        }
    });

});
