document.addEventListener('DOMContentLoaded', () => {
    // --- Preloader Logic ---
    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', () => {
        preloader.classList.add('preloader-hidden');
    });

    // --- Dynamic Background Image ---
    const backgroundImages = [
        "https://4kwallpapers.com/images/wallpapers/oregon-coast-sunset-beach-purple-sky-3840x2160-48.jpg",
        "https://4kwallpapers.com/images/wallpapers/beach-aerial-view-3840x2160-60.jpg",
        "https://4kwallpapers.com/images/wallpapers/hogwarts-school-of-3840x2160-22210.jpeg"
    ];
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    const selectedImage = backgroundImages[randomIndex];
    
    // Create a new style rule for the body::before pseudo-element
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `body::before { background-image: url('${selectedImage}'); }`;
    document.head.appendChild(styleSheet);


    // --- Lenis Smooth Scroll & Parallax ---
    const lenis = new Lenis({
        lerp: 0.07,
        wheelMultiplier: 0.8,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    
    // OPTIMIZATION: Use transform for parallax instead of background-position.
    // This is much smoother as it can be hardware-accelerated by the GPU.
    lenis.on('scroll', (e) => {
        // This sets the CSS variable --scroll-y, which is now used by the CSS for a smooth parallax effect.
        document.body.style.setProperty('--scroll-y', `${e.animatedScroll * -0.15}px`);
    });


    // --- Navigation Link Highlighting on Scroll ---
    const sections = document.querySelectorAll('section');
    const topNavLinks = document.querySelectorAll('.top-nav li');
    let isScrolling = false;

    const navObserver = new IntersectionObserver((entries) => {
        if (isScrolling) return;
        
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.top-nav a[href="#${id}"]`);

                topNavLinks.forEach(link => link.classList.remove('active'));

                if (activeLink) {
                    activeLink.parentElement.classList.add('active');
                }
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => {
        navObserver.observe(section);
    });
    
    // --- Click to Open Nav & Smooth Scroll ---
    topNavLinks.forEach(clickedItem => {
        const link = clickedItem.querySelector('a');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            
            isScrolling = true;
            topNavLinks.forEach(item => {
                item.classList.remove('active');
            });
            clickedItem.classList.add('active');
            
            lenis.scrollTo(target, {
                duration: 1.5,
                easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
                onComplete: () => {
                    // Use a short timeout to prevent observer from firing immediately after scroll
                    setTimeout(() => { isScrolling = false; }, 100);
                }
            });
        });
    });


    // --- Fade-in Animation on Scroll ---
    const hiddenElements = document.querySelectorAll('.hidden');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, { threshold: 0.15 });

    hiddenElements.forEach((el) => scrollObserver.observe(el));

    // --- Typing Animation ---
    const typingTextElement = document.getElementById('typing-text');
    const textsToType = ["Cloud & DevOps Engineer", "AWS & Azure Specialist", "Security Focused"];
    let textIndex = 0;
    let charIndex = 0;

    function type() {
        if (charIndex < textsToType[textIndex].length) {
            typingTextElement.textContent += textsToType[textIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, 100);
        } else {
            setTimeout(erase, 2000);
        }
    }

    function erase() {
        if (charIndex > 0) {
            typingTextElement.textContent = textsToType[textIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, 50);
        } else {
            textIndex = (textIndex + 1) % textsToType.length;
            setTimeout(type, 500);
        }
    }
    
    if(typingTextElement) {
       type();
    }
    
    // --- Skill Modal Logic ---
    const skillModal = document.getElementById('skill-modal');
    const modalSkillName = document.getElementById('modal-skill-name');
    const modalSkillDescription = document.getElementById('modal-skill-description');
    
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('click', () => {
            modalSkillName.textContent = card.dataset.skill;
            modalSkillDescription.textContent = card.dataset.description;
            skillModal.classList.add('visible');
        });
    });
    
    // --- Code Preview Modal ---
    const codeModal = document.getElementById('code-modal');
    const modalRepoName = document.getElementById('modal-repo-name');
    const codePreview = document.getElementById('code-preview');
    
    document.querySelectorAll('.code-preview-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const repo = e.target.dataset.repo;
            modalRepoName.textContent = repo;
            codePreview.textContent = 'Loading...';
            codeModal.classList.add('visible');
            
            try {
                const response = await fetch(`https://api.github.com/repos/${repo}/readme`);
                if (!response.ok) throw new Error('README not found.');
                const data = await response.json();
                codePreview.textContent = atob(data.content);
            } catch (error) {
                codePreview.textContent = `Could not fetch README: ${error.message}`;
            }
        });
    });
    
    // --- Generic Modal Close Logic ---
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        const hideModal = () => {
            modal.classList.remove('visible');
        };
        closeBtn.addEventListener('click', hideModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal();
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.visible').forEach(m => m.classList.remove('visible'));
        }
    });
    
    
    // --- Contact Form Logic ---
    const contactOptions = document.getElementById('contact-options');
    const hireForm = document.getElementById('hire-form');
    const freelanceForm = document.getElementById('freelance-form');
    const formMessage = document.getElementById('form-message');
    const budgetSlider = document.getElementById('budget-slider');
    const budgetValue = document.getElementById('budget-value');

    if (contactOptions) {
        contactOptions.addEventListener('click', (e) => {
            if (e.target.matches('.action-btn')) {
                contactOptions.style.display = 'none';
                const formId = e.target.getAttribute('data-form');
                if (formId === 'hire-form') {
                    hireForm.style.display = 'flex';
                } else if (formId === 'freelance-form') {
                    freelanceForm.style.display = 'flex';
                }
            }
        });
    }

    const handleFormSubmit = (form) => {
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            
            submitButton.disabled = true;
            submitButton.classList.add('sending-state');
            formMessage.textContent = "Sending...";
            formMessage.style.color = "#e0e0e0";

            const formData = new FormData(form);
            const object = {};
            formData.forEach((value, key) => {
                object[key] = value;
            });
            const json = JSON.stringify(object);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: json
                });

                const result = await response.json();

                if (result.success) {
                    submitButton.classList.remove('sending-state');
                    submitButton.classList.add('success-state');
                    formMessage.textContent = "Thank you! Your message has been sent successfully.";
                    formMessage.style.color = "#00aaff";
                    
                    setTimeout(() => {
                        form.style.display = 'none';
                        form.reset();
                        contactOptions.style.display = 'flex';
                        formMessage.textContent = "";
                        submitButton.disabled = false;
                        submitButton.classList.remove('success-state');
                    }, 4000);
                } else {
                    throw new Error(result.message || "Something went wrong. Please try again.");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                submitButton.classList.remove('sending-state');
                submitButton.classList.add('error-state');
                formMessage.textContent = error.message;
                formMessage.style.color = "#ff4d4d";
                
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.classList.remove('error-state');
                }, 2500);
            }
        });
    };

    handleFormSubmit(hireForm);
    handleFormSubmit(freelanceForm);
    
    if(budgetSlider) {
        budgetSlider.addEventListener('input', () => {
            budgetValue.textContent = `$${parseInt(budgetSlider.value).toLocaleString()}`;
        });
    }
    
    // --- Download Resume Animation ---
    const downloadBtn = document.getElementById('download-resume-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (downloadBtn.classList.contains('downloading')) return;
            downloadBtn.classList.add('downloading');
            setTimeout(() => {
                // This is where you would trigger the actual download
                // window.location.href = '/path/to/your/resume.pdf';
                downloadBtn.classList.remove('downloading');
            }, 2500);
        });
    }
    
    // --- Side Menu Logic ---
    const menuTrigger = document.querySelector('.menu-trigger');
    
    if (menuTrigger) {
        const isTouchDevice = () => ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (isTouchDevice()) {
            menuTrigger.addEventListener('click', () => {
                document.body.classList.toggle('side-menu-open');
            });
        } else {
            menuTrigger.addEventListener('mouseenter', () => {
                document.body.classList.add('side-menu-open');
            });
            const sideMenu = document.querySelector('.menu');
            if(sideMenu) {
                sideMenu.addEventListener('mouseleave', () => {
                     document.body.classList.remove('side-menu-open');
                });
            }
        }
    }
    
    // --- Smooth Scroll for Hero CTA ---
    const heroCta = document.querySelector('.hero-cta');
    if (heroCta) {
        heroCta.addEventListener('click', (e) => {
             e.preventDefault();
             const target = heroCta.getAttribute('href');
             lenis.scrollTo(target, {
                duration: 1.5,
                easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
            });
        });
    }
    
    // --- View More Logic ---
    document.querySelectorAll('.view-more-btn').forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            const hiddenItems = document.querySelectorAll(`.hidden-${section}`);
            
            if (button.textContent === 'View More') {
                hiddenItems.forEach(item => item.classList.add('show'));
                button.textContent = 'View Less';
            } else {
                const parentSection = button.closest('section');
                if (parentSection) {
                    lenis.scrollTo(parentSection, {
                        duration: 1.2,
                        easing: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
                        onComplete: () => {
                            hiddenItems.forEach(item => item.classList.remove('show'));
                            button.textContent = 'View More';
                        }
                    });
                } else {
                    hiddenItems.forEach(item => item.classList.remove('show'));
                    button.textContent = 'View More';
                }
            }
        });
    });
    
    // --- YouTube Player Logic ---
    let player;
    let ytApiLoaded = false;
    const heroVisual = document.querySelector('.hero-visual');
    const pauseBtn = document.getElementById('video-pause-btn');

    // OPTIMIZATION: Load the YouTube API script only when the user clicks to play.
    // This improves initial page load time.
    function loadYouTubeApi() {
        if (ytApiLoaded) return;
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        ytApiLoaded = true;
    }

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            videoId: 'dQw4w9WgXcQ', // Placeholder
            playerVars: { 'autoplay': 1, 'controls': 0, 'rel': 0, 'showinfo': 0, 'loop': 1, 'playlist': 'dQw4w9WgXcQ' },
            events: {
                'onReady': (event) => {
                    // Mute the video to allow autoplay in most browsers
                    event.target.mute();
                    event.target.playVideo();
                }
            }
        });
    }

    if (heroVisual) {
        heroVisual.addEventListener('click', () => {
            loadYouTubeApi();
            heroVisual.classList.toggle('flipped');
            if (player) {
                if (heroVisual.classList.contains('flipped')) {
                    player.playVideo();
                } else {
                    player.pauseVideo();
                }
            }
        });
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (player) player.pauseVideo();
            heroVisual.classList.remove('flipped');
        });
    }
    
    // --- Tech Facts Logic ---
    const techFactElement = document.getElementById('tech-fact');
    const techFacts = [
        "AWS was launched in 2006, making it one of the first major cloud providers.",
        "Azure is the second-largest cloud provider and is owned by Microsoft.",
        "The term 'cloud' was first used in the context of computing in the early 1990s.",
        "AWS S3 is designed for 99.999999999% (11 nines) of durability.",
        "Infrastructure as Code (IaC) tools like Terraform allow you to manage infrastructure with configuration files.",
        "A VPC (Virtual Private Cloud) is a secure, isolated private cloud hosted within a public cloud."
    ];
    let factIndex = Math.floor(Math.random() * techFacts.length); // Start with a random fact
    
    const changeFact = () => {
        if (!techFactElement) return;
        techFactElement.style.opacity = 0;
        setTimeout(() => {
            factIndex = (factIndex + 1) % techFacts.length;
            techFactElement.textContent = techFacts[factIndex];
            techFactElement.style.opacity = 1;
        }, 500);
    };
    
    if(techFactElement) {
        changeFact(); // Initial call
        setInterval(changeFact, 5000);
    }
    
    // --- AI Description Generator ---
    const generateDescBtn = document.getElementById('generate-description-btn');
    const keywordsInput = document.getElementById('ai-keywords');
    const descriptionTextarea = document.getElementById('freelance-description');
    
    if (generateDescBtn) {
        generateDescBtn.addEventListener('click', () => {
            const keywords = keywordsInput.value;
            if (!keywords) {
                descriptionTextarea.value = "Please enter some keywords first.";
                return;
            }
            
            generateDescBtn.textContent = 'Generating...';
            generateDescBtn.disabled = true;
            
            setTimeout(() => {
                descriptionTextarea.value = `This project involves creating a ${keywords} solution. Key deliverables include setting up a scalable cloud infrastructure, ensuring robust security measures, and developing an intuitive user interface. The goal is to build a high-performance application that meets all business requirements.`;
                generateDescBtn.textContent = '✨ Generate with AI';
                generateDescBtn.disabled = false;
            }, 1500);
        });
    }
    
    // --- Dark Mode Toggle ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        const icons = darkModeToggle.querySelectorAll('.material-symbols-outlined');
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            icons.forEach(icon => icon.classList.toggle('hidden-icon'));
        });
    }

    // --- MAJOR OPTIMIZATION: High-Performance CSS Custom Cursor ---
    // This is a lightweight, hardware-accelerated CSS transform-based cursor.
    // It is a major contributor to a smoother experience.
    const cursorDot = document.querySelector(".cursor--small");
    const cursorOutline = document.querySelector(".cursor--large");
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let outlineX = 0, outlineY = 0;
    let isStuck = false;
    let stuckX, stuckY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animateCursor = () => {
        // Animate dot (moves instantly)
        dotX = mouseX;
        dotY = mouseY;
        cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`;

        // Animate outline (lerps for a smooth trail)
        if (!isStuck) {
            outlineX += (mouseX - outlineX) * 0.2;
            outlineY += (mouseY - outlineY) * 0.2;
        } else {
            outlineX += (stuckX - outlineX) * 0.2;
            outlineY += (stuckY - outlineY) * 0.2;
        }
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
        
        requestAnimationFrame(animateCursor);
    };
    
    const initHovers = () => {
        const handleMouseEnter = e => {
            const target = e.currentTarget;
            const box = target.getBoundingClientRect();
            stuckX = Math.round(box.left + box.width / 2);
            stuckY = Math.round(box.top + box.height / 2);
            isStuck = true;
            cursorOutline.classList.add('stuck');
        };

        const handleMouseLeave = () => {
            isStuck = false;
            cursorOutline.classList.remove('stuck');
        };

        // Cache this selector since it's used only once
        const hoverables = document.querySelectorAll(
            'a, button, .skill-card, .flip-card-inner, .menu-trigger'
        );

        hoverables.forEach(item => {
            item.addEventListener("mouseenter", handleMouseEnter);
            item.addEventListener("mouseleave", handleMouseLeave);
        });
    };

    animateCursor();
    initHovers();
});